"use client"

/**
 * محرّك ألعاب التصنيف – النمط الموحّد لألعاب نواتج التعلم.
 * لوحات متحركة تمثل الفئات، وبطاقة تظهر عليها ظاهرة أو مثال، والطالبة تختار اللوحة الصحيحة.
 * عدة جولات (آخرها تحدٍّ سريع بمؤقّت)، تفسير علمي بعد كل إجابة، والسؤال الخاطئ يعود في نهاية الجولة.
 * اللوحات رسوم متحركة على canvas، ولذلك يُدار منطق اللعبة مباشرة على عناصر الصفحة داخل useEffect
 * واحد (الواجهة في JSX ثابتة ولا تعيد React رسمها أثناء اللعب).
 * النتيجة المرسلة إلى onComplete هي نسبة الإجابات الصحيحة من المحاولة الأولى (٠–١٠٠).
 */
import { useEffect, useRef } from "react"
import type { ClassifierGameData } from "@/types/games"
import { CLASSIFIER_CONFIGS } from "./configs"
import { CLASSIFIER_STYLES } from "./styles"
import type { ClassifierConfig } from "./types"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type GameResult = { score: number; answers: Record<string, unknown>; timeSpent: number }

type ClassifierGameProps = {
  gameData: ClassifierGameData
  game: EducationalGameMeta
  onComplete: (result: GameResult) => void
}

type Card = { p: string; text: string; exp: string; retry: boolean }
type Mode = "intro" | "inter" | "ask" | "shown" | "end"
type Live = { id: string; btn: HTMLButtonElement; canvas: HTMLCanvasElement }
type State = {
  round: number
  score: number
  streak: number
  best: number
  queue: Card[]
  i: number
  n: number
  first: number
  asked: number
  stat: Record<string, [number, number]>
  missed: Card[]
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"
const ar = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)])
const shuffle = <T,>(src: T[]): T[] => {
  const a = src.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function runGame(root: HTMLDivElement, cfg: ClassifierConfig, complete: (r: GameResult) => void) {
  const $ = (id: string) => root.querySelector('[data-el="' + id + '"]') as HTMLElement
  const bar = (id: string) => $(id).firstElementChild as HTMLElement
  const startedAt = Date.now()
  const rounds = cfg.rounds
  const total = rounds.length
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  let S: State | null = null
  let mode: Mode = "intro"
  let deadline = 0
  let limit = 0
  let cur: Card | null = null
  let live: Live[] = []
  let result: GameResult | null = null
  let sent = false
  const fx: Record<string, number> = {}
  const phase: Record<string, number> = {}
  Object.keys(cfg.panels).forEach((id, k) => {
    fx[id] = 0
    phase[id] = k * 0.4
  })

  /* ---------- الصوت ---------- */
  let AC: AudioContext | null = null
  let soundOn = true
  function tone(f: number, d: number, type: OscillatorType = "sine", when = 0) {
    if (!soundOn) return
    try {
      AC = AC || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const o = AC.createOscillator()
      const g = AC.createGain()
      const t0 = AC.currentTime + when
      o.type = type
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
      o.connect(g)
      g.connect(AC.destination)
      o.start(t0)
      o.stop(t0 + d + 0.02)
    } catch {
      /* الصوت اختياري */
    }
  }
  $("sound").onclick = () => {
    soundOn = !soundOn
    $("sound").textContent = "الصوت: " + (soundOn ? "يعمل" : "متوقف")
  }

  /* ---------- اللوحات ---------- */
  function showPanels(ids: string[]) {
    const box = $("panels")
    box.textContent = ""
    box.dataset.n = String(ids.length)
    live = ids.map((id, k) => {
      const def = cfg.panels[id]
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "panel"
      const canvas = document.createElement("canvas")
      canvas.width = 600
      canvas.height = 400
      canvas.setAttribute("aria-hidden", "true")
      const name = document.createElement("span")
      name.className = "name"
      name.textContent = def.name
      const hint = document.createElement("span")
      hint.className = "move"
      hint.textContent = def.hint
      const key = document.createElement("span")
      key.className = "key"
      key.textContent = "مفتاح " + ar(k + 1)
      btn.append(canvas, name, hint, key)
      btn.onclick = () => pick(id, btn)
      box.append(btn)
      return { id, btn, canvas }
    })
  }
  function pick(id: string, btn: HTMLButtonElement) {
    if (mode === "ask") return answer(id)
    if (mode === "intro") {
      clearMarks()
      btn.classList.add("pick")
      fx[id] = performance.now()
      $("kind").textContent = "تعرّفي على اللوحات"
      $("big").textContent = cfg.panels[id].name
      $("say").textContent = cfg.panels[id].info
      tone(440, 0.1, "triangle")
    }
  }

  /* ---------- سير اللعبة ---------- */
  function hud() {
    $("score").textContent = ar(S ? S.score : 0)
    $("streak").textContent = ar(S ? S.streak : 0)
  }
  function clearMarks() {
    live.forEach((p) => p.btn.classList.remove("hit", "miss", "reveal", "pick"))
    $("card").classList.remove("good", "wrong")
    $("say").className = "say"
  }
  function newGame() {
    const stat: State["stat"] = {}
    Object.keys(cfg.panels).forEach((id) => (stat[id] = [0, 0]))
    S = { round: -1, score: 0, streak: 0, best: 0, queue: [], i: 0, n: 0, first: 0, asked: 0, stat, missed: [] }
    hud()
    nextRound()
  }
  function nextRound() {
    if (!S) return
    const st = S
    st.round++
    if (st.round >= total) return finish()
    const r = rounds[st.round]
    const mk = (c: [string, string, string]): Card => ({ p: c[0], text: c[1], exp: c[2], retry: false })
    if (r.timed) {
      st.queue = shuffle(r.cards).slice(0, 10).map(mk)
    } else {
      const n = r.panels.length
      const per = n === 2 ? 4 : n === 3 ? 3 : 2
      st.queue = shuffle(r.panels.flatMap((id) => shuffle(r.cards.filter((c) => c[0] === id)).slice(0, per))).map(mk)
    }
    st.i = 0
    st.n = st.queue.length
    limit = (r.timed || 0) * 1000
    mode = "inter"
    cur = null
    showPanels(r.panels)
    clearMarks()
    const label = "الجولة " + ar(st.round + 1) + " من " + ar(total)
    $("roundChip").textContent = label
    $("kind").textContent = label
    $("big").textContent = r.name
    $("say").textContent = r.say
    $("go").textContent = "ابدئي الجولة"
    $("go").hidden = false
    $("timer").hidden = true
    bar("progress").style.width = "0%"
    $("go").focus()
  }
  function showCard() {
    if (!S) return
    const st = S
    if (st.i >= st.queue.length) return nextRound()
    const card = st.queue[st.i]
    cur = card
    mode = "ask"
    clearMarks()
    $("kind").textContent = (card.retry ? "محاولة ثانية · " : "") + rounds[st.round].kind
    $("big").textContent = card.text
    $("say").textContent = ""
    $("go").hidden = true
    root.querySelectorAll<HTMLElement>('[data-el="card"] .src').forEach((el) => (el.hidden = true))
    bar("progress").style.width = (Math.min(st.i, st.n) / st.n) * 100 + "%"
    if (limit) {
      $("timer").hidden = false
      deadline = performance.now() + limit
    }
  }
  function answer(id: string | null) {
    if (mode !== "ask" || !S || !cur) return
    const c = cur
    const st = S
    mode = "shown"
    const ok = id === c.p
    const left = Math.max(0, deadline - performance.now())
    if (!c.retry) {
      st.asked++
      st.stat[c.p][1]++
    }
    const right = live.find((p) => p.id === c.p)
    const chosen = live.find((p) => p.id === id)
    fx[c.p] = performance.now()
    if (ok) {
      st.streak++
      st.best = Math.max(st.best, st.streak)
      let pts = c.retry ? 5 : 10 + Math.min(st.streak - 1, 5) * 2
      if (limit) pts += Math.ceil(left / (limit / 5))
      st.score += pts
      if (!c.retry) {
        st.first++
        st.stat[c.p][0]++
      }
      right?.btn.classList.add("hit")
      $("card").classList.add("good")
      $("say").className = "say good"
      $("say").innerHTML = "<strong>صحيح، +" + ar(pts) + " نقطة.</strong> " + c.exp
      tone(523, 0.12, "triangle")
      tone(784, 0.2, "triangle", 0.11)
    } else {
      st.streak = 0
      if (!c.retry) {
        if (!st.missed.some((m) => m.text === c.text)) st.missed.push(c)
        st.queue.push({ ...c, retry: true })
      }
      chosen?.btn.classList.add("miss")
      right?.btn.classList.add("reveal")
      $("card").classList.add("wrong")
      $("say").className = "say wrong"
      $("say").innerHTML =
        "<strong>" + (id ? "ليست هذه." : "انتهى الوقت.") + " الإجابة: " + cfg.panels[c.p].name + ".</strong> " + c.exp
      tone(170, 0.3, "sawtooth")
    }
    st.i++
    hud()
    const last = st.i >= st.queue.length
    $("go").textContent = last ? (st.round === total - 1 ? "اعرضي النتيجة" : "الجولة التالية") : "التالي"
    $("go").hidden = false
    $("go").focus()
  }
  function finish() {
    if (!S) return
    const st = S
    mode = "end"
    clearMarks()
    $("card").hidden = true
    $("panels").hidden = true
    $("timer").hidden = true
    $("progress").hidden = true
    $("end").hidden = false
    $("roundChip").textContent = "انتهت اللعبة"
    const acc = st.asked ? st.first / st.asked : 0
    const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1
    const used = Object.keys(cfg.panels).filter((id) => st.stat[id][1] > 0)
    const byCategory: Record<string, [number, number]> = {}
    used.forEach((id) => (byCategory[cfg.panels[id].name] = st.stat[id]))
    result = {
      score: Math.round(acc * 100),
      answers: {
        points: st.score,
        firstTryCorrect: st.first,
        asked: st.asked,
        bestStreak: st.best,
        byCategory,
        missed: st.missed.map((m) => ({ item: m.text, correct: cfg.panels[m.p].name })),
      },
      timeSpent: Math.floor((Date.now() - startedAt) / 1000),
    }
    $("stars").innerHTML = [1, 2, 3]
      .map(
        (i) =>
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.1 6.6 7.1.9-5.2 5 1.3 7.1L12 18.1 5.7 21.6 7 14.5 1.8 9.5l7.1-.9z" fill="' +
          (i <= stars ? "var(--crust)" : "var(--ridge)") +
          '"/></svg>'
      )
      .join("")
    $("endTitle").textContent = cfg.ranks[3 - stars]
    $("endSay").innerHTML =
      "جمعتِ <strong>" + ar(st.score) + "</strong> نقطة، وأجبتِ من المحاولة الأولى عن <strong>" + ar(st.first) +
      "</strong> من " + ar(st.asked) + ". أطول سلسلة إجابات صحيحة: " + ar(st.best) + "."
    $("rows").innerHTML = used
      .map((id) => {
        const [c, n] = st.stat[id]
        const p = n ? Math.round((c / n) * 100) : 0
        return (
          '<div class="row"><span>' + cfg.panels[id].name + '</span><div class="track"><i style="width:' + p +
          '%"></i></div><span>' + ar(c) + "/" + ar(n) + "</span></div>"
        )
      })
      .join("")
    $("missedH").hidden = $("missed").hidden = !st.missed.length
    $("missed").innerHTML = st.missed
      .map((m) => "<li><b>" + m.text + "</b> ← " + cfg.panels[m.p].name + ". " + m.exp + "</li>")
      .join("")
    tone(523, 0.12, "triangle")
    tone(659, 0.12, "triangle", 0.12)
    tone(784, 0.3, "triangle", 0.24)
    $("again").focus()
  }

  $("go").onclick = () => {
    if (mode === "intro") newGame()
    else if (mode === "inter" || mode === "shown") showCard()
  }
  $("again").onclick = () => {
    if (result && !sent) {
      sent = true
      ;($("again") as HTMLButtonElement).disabled = true
      complete(result)
    }
  }
  const onKey = (e: KeyboardEvent) => {
    const k = "123456789".indexOf(e.key) >= 0 ? "123456789".indexOf(e.key) : AR_DIGITS.indexOf(e.key) - 1
    if (mode === "ask" && k >= 0 && k < live.length && e.key.length === 1) {
      e.preventDefault()
      answer(live[k].id)
    }
  }
  window.addEventListener("keydown", onKey)

  /* ---------- حلقة الرسم ---------- */
  showPanels(rounds[0].panels)
  let last = performance.now()
  let raf = 0
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (mode !== "end") {
      for (const p of live) {
        const g = p.canvas.getContext("2d")
        if (!g) continue
        const boost = fx[p.id] && now - fx[p.id] < 1600 ? 3.2 : 1
        phase[p.id] += dt * boost * (still ? 0 : 1)
        g.setTransform(p.canvas.width / 300, 0, 0, p.canvas.height / 200, 0, 0)
        g.clearRect(0, 0, 300, 200)
        if (cfg.panels[p.id].shake && boost > 1 && !still) g.translate(Math.sin(now * 0.09) * 2.5, 0)
        g.save()
        cfg.panels[p.id].draw(g, phase[p.id])
        g.restore()
      }
    }
    if (mode === "ask" && limit) {
      const left = deadline - now
      bar("timer").style.width = Math.max(0, (left / limit) * 100) + "%"
      if (left <= 0) answer(null)
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener("keydown", onKey)
    mode = "end"
    if (AC) AC.close().catch(() => {})
  }
}

export default function ClassifierGame({ gameData, onComplete }: ClassifierGameProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const cfg: ClassifierConfig | undefined = CLASSIFIER_CONFIGS[gameData.config]

  useEffect(() => {
    const el = rootRef.current
    if (!el || !cfg) return
    return runGame(el, cfg, (r) => onCompleteRef.current(r))
  }, [cfg])

  if (!cfg) {
    return <div className="card text-center text-slate-600">تعذّر تحميل هذه اللعبة.</div>
  }

  return (
    <div className="pbx" dir="rtl" lang="ar" ref={rootRef} key={gameData.config}>
      <style>{CLASSIFIER_STYLES}</style>
      <div className="app">
        <div className="top">
          <p className="title">
            {cfg.title[0]} <span>{cfg.title[1]}</span>
          </p>
          <div className="hud">
            <span className="chip" data-el="roundChip">{ar(cfg.rounds.length)} جولات</span>
            <span className="chip">النقاط<b data-el="score">٠</b></span>
            <span className="chip">متتالية<b data-el="streak">٠</b></span>
            <button className="ghost" data-el="sound" type="button">الصوت: يعمل</button>
          </div>
        </div>

        <div className="track" data-el="progress" aria-hidden="true"><i /></div>

        <section className="pcard" data-el="card" aria-live="polite">
          <span className="kind" data-el="kind">كيف تلعبين؟</span>
          <p className="big" data-el="big">{cfg.intro.big}</p>
          <p className="say" data-el="say">{cfg.intro.say}</p>
          <button className="go" data-el="go" type="button">ابدئي اللعب</button>
        </section>

        <div className="track" data-el="timer" hidden aria-hidden="true"><i /></div>

        <div className="panels" data-el="panels" />

        <section className="pcard" data-el="end" hidden>
          <div className="stars" data-el="stars" />
          <p className="big" data-el="endTitle" />
          <p className="say" data-el="endSay" />
          <p className="sub">إتقانك لكل فئة</p>
          <div className="rows" data-el="rows" />
          <p className="sub" data-el="missedH">راجعي هذه البطاقات</p>
          <ul className="missed" data-el="missed" />
          <button className="go" data-el="again" type="button">احفظي النتيجة</button>
        </section>
      </div>
    </div>
  )
}
