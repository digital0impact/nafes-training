"use client"

/**
 * مستكشفة حدود الصفائح – ربط أنواع حدود الصفائح (متباعدة، متقاربة، تحويلية) بالظواهر الناتجة عنها.
 * ثلاث جولات: الظواهر والتضاريس، أماكن من العالم، التحدي السريع (١٥ ثانية لكل سؤال).
 * اللوحات الثلاث رسوم متحركة على canvas، ولذلك يُدار منطق اللعبة مباشرة على عناصر الصفحة
 * داخل useEffect واحد (الواجهة في JSX ثابتة ولا تعيد React رسمها أثناء اللعب).
 * النتيجة المرسلة إلى onComplete هي نسبة الإجابات الصحيحة من المحاولة الأولى (٠–١٠٠).
 */
import { useEffect, useRef } from "react"
import type { PlateBoundariesExplorerGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type GameResult = { score: number; answers: Record<string, unknown>; timeSpent: number }

type PlateBoundariesExplorerProps = {
  gameData: PlateBoundariesExplorerGameData
  game: EducationalGameMeta
  onComplete: (result: GameResult) => void
}

/** d = متباعدة، c = متقاربة، t = تحويلية */
type Kind = "d" | "c" | "t"
type Raw = [Kind, string, string]
type Card = { t: Kind; text: string; exp: string; retry: boolean }
type Mode = "intro" | "inter" | "ask" | "shown" | "end"
type G = CanvasRenderingContext2D
type State = {
  round: number; score: number; streak: number; best: number
  queue: Card[]; i: number; n: number; first: number; asked: number
  stat: Record<Kind, [number, number]>; missed: Card[]
}
const KINDS: Kind[] = ["d", "c", "t"]

const STYLES = `
.pbx{
  --abyss:#0b1d2a; --deep:#12303f; --ridge:#1c4558;
  --foam:#ecf6f2; --muted:#a5c0c4;
  --magma:#ff9a2e; --lava:#e5432d; --crust:#e6bd63; --sea:#3fbfdc;
  --ok:#62d68d; --bad:#ff7466; --ink:#07141d;
}
.pbx *{box-sizing:border-box}
.pbx{background:linear-gradient(180deg,var(--abyss) 0%,#0f2937 55%,#2b1612 100%) var(--abyss);color:var(--foam);font-size:17px;line-height:1.6;padding:18px 16px 26px;border-radius:24px}
.pbx .app{max-width:980px;margin-inline:auto;display:flex;flex-direction:column;gap:16px}
.pbx .top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px}
.pbx .title{font-weight:800;font-size:clamp(26px,5vw,38px);margin:0;line-height:1.15;color:var(--crust);text-wrap:balance}
.pbx .title span{color:var(--foam)}
.pbx .hud{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pbx .chip{background:var(--deep);border:1px solid var(--ridge);border-radius:999px;padding:4px 14px;font-weight:700;font-size:15px;white-space:nowrap}
.pbx .chip b{font-weight:800;font-size:20px;color:var(--magma);margin-inline-start:4px}
.pbx button{font:inherit;color:inherit;cursor:pointer}
.pbx button:focus-visible{outline:3px solid var(--sea);outline-offset:3px}
.pbx .ghost{background:transparent;border:1px solid var(--ridge);border-radius:999px;padding:4px 14px;font-size:15px;font-weight:500}
.pbx .ghost:hover{border-color:var(--sea)}
.pbx .track{height:8px;background:var(--deep);border-radius:99px;overflow:hidden}
.pbx .track i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--magma),var(--crust));border-radius:99px;transition:width .35s}
.pbx [data-el="timer"] i{background:var(--sea);transition:none}
.pbx .pcard{
  background:var(--deep);border:2px solid var(--ridge);border-radius:22px;
  padding:22px clamp(16px,4vw,34px);text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;
  box-shadow:0 14px 0 -6px rgba(0,0,0,.28);min-height:210px;justify-content:center
}
.pbx .pcard.good{border-color:var(--ok)}
.pbx .pcard.wrong{border-color:var(--bad);animation:pbxShake .4s}
.pbx .kind{font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--sea)}
.pbx .big{font-weight:800;font-size:clamp(26px,5.6vw,42px);line-height:1.25;margin:0;text-wrap:balance}
.pbx .say{margin:0;max-width:62ch;color:var(--muted);min-height:1.6em}
.pbx .say strong{color:var(--foam)}
.pbx .say.good strong{color:var(--ok)}
.pbx .say.wrong strong{color:var(--bad)}
.pbx .go{
  background:var(--magma);color:var(--ink);border:0;border-radius:14px;padding:10px 30px;
  font-weight:800;font-size:22px;box-shadow:0 5px 0 #b3560c;transition:transform .08s,box-shadow .08s
}
.pbx .go:hover{transform:translateY(-1px)}
.pbx .go:active{transform:translateY(4px);box-shadow:0 1px 0 #b3560c}
.pbx .panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,2vw,18px)}
.pbx .panel{
  background:var(--deep);border:2px solid var(--ridge);border-radius:18px;padding:8px 8px 12px;
  display:flex;flex-direction:column;gap:4px;align-items:center;text-align:center;min-width:0;
  transition:transform .12s,border-color .12s
}
.pbx .panel:hover:not(:disabled){transform:translateY(-4px);border-color:var(--crust)}
.pbx .panel:disabled{cursor:default}
.pbx .panel canvas{width:100%;aspect-ratio:3/2;border-radius:12px;display:block;background:var(--abyss)}
.pbx .panel .name{font-weight:800;font-size:clamp(17px,3.6vw,26px);line-height:1.2;color:var(--crust)}
.pbx .panel .move{font-size:clamp(12px,2.4vw,15px);color:var(--muted);line-height:1.35}
.pbx .panel .key{font-size:12px;color:var(--muted);border:1px solid var(--ridge);border-radius:6px;padding:0 7px}
.pbx .panel.hit{border-color:var(--ok);box-shadow:0 0 0 4px rgba(98,214,141,.25);animation:pbxPop .45s}
.pbx .panel.miss{border-color:var(--bad);animation:pbxShake .4s}
.pbx .panel.reveal{border-color:var(--ok);border-style:dashed}
.pbx .panel.pick{border-color:var(--sea)}
@keyframes pbxPop{40%{transform:scale(1.06)}}

@keyframes pbxShake{20%{transform:translateX(7px)}40%{transform:translateX(-7px)}60%{transform:translateX(5px)}80%{transform:translateX(-4px)}}
.pbx .stars{display:flex;gap:6px;direction:ltr}
.pbx .stars svg{width:54px;height:54px}
.pbx .rows{width:100%;max-width:520px;display:flex;flex-direction:column;gap:8px;text-align:start}
.pbx .row{display:grid;grid-template-columns:8.5em 1fr 3.2em;gap:10px;align-items:center;font-size:15px}
.pbx .row .track i{background:var(--ok)}
.pbx .row span:last-child{font-variant-numeric:tabular-nums;text-align:end}
.pbx .missed{width:100%;max-width:620px;text-align:start;margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:15px}
.pbx .missed li{border-inline-start:3px solid var(--bad);padding-inline-start:10px;color:var(--muted)}
.pbx .missed b{color:var(--foam)}
.pbx .sub{font-weight:800;font-size:20px;margin:6px 0 0;color:var(--sea)}
@media (max-width:480px){.pbx .panel .key{display:none}
.pbx .pcard{min-height:190px}}

@media (prefers-reduced-motion:reduce){.pbx *{animation:none!important;transition:none!important}}

.pbx [hidden]{display:none!important}
.pbx .title,.pbx .sub,.pbx .big,.pbx .say{margin:0}
.pbx .sub{margin-top:6px}
`

export default function PlateBoundariesExplorer({ onComplete }: PlateBoundariesExplorerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const root: HTMLDivElement = el
    const startedAt = Date.now()
    let result: GameResult | null = null
    let sent = false
    const bar = (id: string) => $(id).firstElementChild as HTMLElement

    const $ = (id: string) => root.querySelector('[data-el="' + id + '"]') as HTMLElement;
    const ar = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
    const NAME: Record<Kind, string> = {d:'حدود متباعدة',c:'حدود متقاربة',t:'حدود تحويلية'};
    const INFO: Record<Kind, string> = {
     d:'تبتعد الصفيحتان إحداهما عن الأخرى، فتصعد الصهارة لتملأ الفراغ وتتصلب مكوّنة قشرة جديدة.',
     c:'تقترب الصفيحتان وتتصادمان، فتغوص إحداهما تحت الأخرى أو تنطوي الصخور وترتفع جبالًا.',
     t:'تنزلق الصفيحتان أفقيًّا في اتجاهين متعاكسين، فتتكوّن الصدوع وتحدث الزلازل دون براكين.'
    };
    const PHEN: Raw[] = [
     ['d','ظهر وسط المحيط','تصعد الصهارة بين الصفيحتين المتباعدتين وتتصلب، فتبني سلسلة جبلية في قاع المحيط.'],
     ['d','وادي الخسف','عندما تتباعد صفيحتان قاريتان تهبط القشرة بينهما ويتكوّن وادٍ طويل منخفض.'],
     ['d','تكوّن قشرة محيطية جديدة','الصهارة الصاعدة في منطقة التباعد تبرد وتصير قشرة محيطية حديثة.'],
     ['d','اتساع قاع المحيط','كلما تباعدت الصفيحتان أُضيفت قشرة جديدة في الوسط فاتسع قاع المحيط.'],
     ['c','أخدود بحري عميق','تغوص الصفيحة المحيطية الأكثر كثافة تحت الصفيحة الأخرى فيتكوّن أخدود عميق.'],
     ['c','سلاسل جبلية مطوية شاهقة','تصادم صفيحتين قاريتين يضغط الصخور ويطويها ويرفعها جبالًا عالية.'],
     ['c','قوس من الجزر البركانية','غوص صفيحة محيطية تحت أخرى محيطية يصهر الصخور فتصعد الصهارة وتبني جزرًا بركانية.'],
     ['c','نطاق الطرح: غوص صفيحة تحت أخرى','نطاق الطرح يتكوّن حيث تتقارب صفيحتان وتنزل إحداهما في الستار.'],
     ['c','استهلاك القشرة المحيطية القديمة','القشرة القديمة تغوص في الستار عند الحدود المتقاربة وتنصهر.'],
     ['t','صدع تنزلق الصخور على جانبيه أفقيًّا','الحركة الجانبية للصفيحتين تكسر الصخور على طول صدع تحويلي.'],
     ['t','لا تتكوّن قشرة ولا تُستهلك','عند الحدود التحويلية تنزلق الصفيحتان فقط، فتبقى مساحة القشرة كما هي.'],
     ['t','إزاحة جانبية للطرق ومجاري الأنهار','انزلاق الصفيحتين في اتجاهين متعاكسين يزيح كل ما يعبر الصدع.'],
     ['t','زلازل ضحلة بلا براكين','الاحتكاك بين الصفيحتين المنزلقتين يولّد زلازل، ولا تصعد صهارة لتكوّن براكين.']
    ];
    const PLACE: Raw[] = [
     ['d','البحر الأحمر','الصفيحة العربية تبتعد عن الصفيحة الإفريقية، والبحر الأحمر يتسع ببطء.'],
     ['d','جزيرة آيسلندا','تقع آيسلندا فوق ظهر وسط المحيط الأطلسي حيث تتباعد صفيحتان.'],
     ['d','وادي الخسف الإفريقي العظيم','شرق إفريقيا يتمزق ببطء، فتهبط القشرة مكوّنة واديًا طويلًا.'],
     ['d','ظهر وسط المحيط الأطلسي','أطول سلسلة جبلية على الأرض، وتتكوّن عندها قشرة محيطية جديدة.'],
     ['c','جبال الهيمالايا','الصفيحة الهندية تصطدم بالصفيحة الأوراسية وترفع أعلى جبال العالم.'],
     ['c','جبال الأنديز','صفيحة نازكا المحيطية تغوص تحت صفيحة أمريكا الجنوبية القارية.'],
     ['c','أخدود ماريانا','أعمق نقطة في المحيطات، وتكوّنت بغوص صفيحة المحيط الهادئ تحت صفيحة مجاورة.'],
     ['c','جزر اليابان','قوس جزر بركانية نشأ فوق نطاق طرح تغوص فيه صفيحة محيطية.'],
     ['c','جبال زاغروس','الصفيحة العربية تصطدم بالصفيحة الأوراسية فتنطوي الصخور وترتفع.'],
     ['t','صدع سان أندرياس في كاليفورنيا','صفيحة المحيط الهادئ تنزلق بمحاذاة صفيحة أمريكا الشمالية.'],
     ['t','صدع البحر الميت وخليج العقبة','الصفيحة العربية تنزلق شمالًا بمحاذاة الصفيحة الإفريقية.'],
     ['t','صدع شمال الأناضول في تركيا','صفيحة الأناضول تنزلق غربًا بمحاذاة الصفيحة الأوراسية وتسبب زلازل قوية.']
    ];
    const ROUNDS=[
     {name:'الظواهر والتضاريس',say:'تسع ظواهر جيولوجية. أيّ حدّ يصنع كلًّا منها؟',kind:'ما الحدّ الذي يصنع هذه الظاهرة؟'},
     {name:'أماكن من العالم',say:'تسعة أماكن حقيقية على سطح الأرض. على أي نوع من الحدود يقع كل مكان؟',kind:'على أي حدّ يقع هذا المكان؟'},
     {name:'التحدي السريع',say:'عشرة أسئلة مختلطة، ولكل سؤال ١٥ ثانية. الإجابة الأسرع تكسب نقاطًا إضافية.',kind:'أجيبي قبل انتهاء الوقت'}
    ];
    const shuffle = <T,>(src: T[]): T[] => {const a=src.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
    const pick3 = (pool: Raw[]) => shuffle(KINDS.flatMap(t=>shuffle(pool.filter(c=>c[0]===t)).slice(0,3)));
    const mk = (c: Raw): Card => ({t:c[0],text:c[1],exp:c[2],retry:false});

    let S: State | null = null, mode: Mode = 'intro', deadline = 0, cur: Card | null = null;
    const panels = Array.from(root.querySelectorAll<HTMLButtonElement>('.panel'));
    const kindOf = (p: HTMLElement) => p.dataset.t as Kind;
    const fx: Record<Kind, number> = {d:0,c:0,t:0};

    /* ---------- sound ---------- */
    let AC: AudioContext | null = null, soundOn = true;
    function tone(f: number, d: number, type: OscillatorType = 'sine', when = 0){
      if(!soundOn) return;
      try{
        AC = AC || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const o=AC.createOscillator(), g=AC.createGain(), t0=AC.currentTime+when;
        o.type=type; o.frequency.value=f;
        g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(.16,t0+.02); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
        o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+d+.02);
      }catch{ /* الصوت اختياري */ }
    }
    $('sound').onclick=()=>{soundOn=!soundOn; $('sound').textContent='الصوت: '+(soundOn?'يعمل':'متوقف')};

    /* ---------- game flow ---------- */
    function hud(){
      $('score').textContent=ar(S?S.score:0); $('streak').textContent=ar(S?S.streak:0);
    }
    function clearMarks(){panels.forEach(p=>p.classList.remove('hit','miss','reveal','pick')); $('card').classList.remove('good','wrong'); $('say').className='say'}
    function newGame(){
      S={n:0,round:-1,score:0,streak:0,best:0,queue:[],i:0,first:0,asked:0,stat:{d:[0,0],c:[0,0],t:[0,0]},missed:[]};
      hud(); nextRound();
    }
    function nextRound(){
      if(!S) return;
      const st=S;
      st.round++;
      if(st.round>=ROUNDS.length) return finish();
      const all=PHEN.concat(PLACE);
      st.queue=(st.round===0?pick3(PHEN):st.round===1?pick3(PLACE):shuffle(all).slice(0,10)).map(mk);
      st.i=0; st.n=st.queue.length; mode='inter'; cur=null; clearMarks();
      const r=ROUNDS[st.round];
      $('roundChip').textContent='الجولة '+ar(st.round+1)+' من ٣';
      $('kind').textContent='الجولة '+ar(st.round+1)+' من ٣';
      $('big').textContent=r.name; $('say').textContent=r.say;
      $('go').textContent='ابدئي الجولة'; $('go').hidden=false;
      $('timer').hidden=true; bar('progress').style.width='0%';
      $('go').focus();
    }
    function showCard(){
      if(!S) return;
      const st=S;
      if(st.i>=st.queue.length) return nextRound();
      const card=st.queue[st.i]; cur=card; mode='ask'; clearMarks();
      const done=Math.min(st.i,st.n);
      $('kind').textContent=(card.retry?'محاولة ثانية · ':'')+ROUNDS[st.round].kind;
      $('big').textContent=card.text; $('say').textContent='';
      $('go').hidden=true;
      bar('progress').style.width=(done/st.n*100)+'%';
      if(st.round===2){$('timer').hidden=false; deadline=performance.now()+15000}
    }
    function answer(t: Kind | null){
      if(mode!=='ask'||!S||!cur) return;
      const c=cur, st=S;
      mode='shown';
      const ok=t===c.t, left=Math.max(0,deadline-performance.now());
      if(!c.retry){st.asked++; st.stat[c.t][1]++}
      const right=panels.find(p=>kindOf(p)===c.t)!, chosen=panels.find(p=>kindOf(p)===t);
      if(ok){
        st.streak++; st.best=Math.max(st.best,st.streak);
        let pts=c.retry?5:10+Math.min(st.streak-1,5)*2;
        if(st.round===2) pts+=Math.ceil(left/3000);
        st.score+=pts;
        if(!c.retry){st.first++; st.stat[c.t][0]++}
        right.classList.add('hit'); fx[c.t]=performance.now();
        $('card').classList.add('good'); $('say').className='say good';
        $('say').innerHTML='<strong>صحيح، +'+ar(pts)+' نقطة.</strong> '+c.exp;
        tone(523,.12,'triangle'); tone(784,.2,'triangle',.11);
      }else{
        st.streak=0;
        if(!c.retry){if(!st.missed.some(m=>m.text===c.text)) st.missed.push(c); st.queue.push({...c,retry:true})}
        if(chosen) chosen.classList.add('miss');
        right.classList.add('reveal'); fx[c.t]=performance.now();
        $('card').classList.add('wrong'); $('say').className='say wrong';
        $('say').innerHTML='<strong>'+(t?'ليست هذه.':'انتهى الوقت.')+' الإجابة: '+NAME[c.t]+'.</strong> '+c.exp;
        tone(170,.3,'sawtooth');
      }
      st.i++; hud();
      $('go').textContent=st.i>=st.queue.length?(st.round===2?'اعرضي النتيجة':'الجولة التالية'):'التالي';
      $('go').hidden=false; $('go').focus();
    }
    function finish(){
      $('card').hidden=true; $('panels').hidden=true; $('timer').hidden=true; $('progress').hidden=true; $('end').hidden=false;
      if(!S) return;
      const st=S;
      mode='end'; clearMarks();
      $('roundChip').textContent='انتهت اللعبة';
      const acc=st.asked?st.first/st.asked:0, stars=acc>=.9?3:acc>=.7?2:1;
      result={score:Math.round(acc*100),answers:{points:st.score,firstTryCorrect:st.first,asked:st.asked,bestStreak:st.best,byBoundary:st.stat,missed:st.missed.map(m=>({item:m.text,correct:NAME[m.t]}))},timeSpent:Math.floor((Date.now()-startedAt)/1000)};
      $('stars').innerHTML=[1,2,3].map(i=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.1 6.6 7.1.9-5.2 5 1.3 7.1L12 18.1 5.7 21.6 7 14.5 1.8 9.5l7.1-.9z" fill="'+(i<=stars?'var(--crust)':'var(--ridge)')+'"/></svg>').join('');
      $('endTitle').textContent=stars===3?'عالِمة صفائح خبيرة':stars===2?'مستكشفة ماهرة':'بداية جيدة، حاولي من جديد';
      $('endSay').innerHTML='جمعتِ <strong>'+ar(st.score)+'</strong> نقطة، وأجبتِ من المحاولة الأولى عن <strong>'+ar(st.first)+'</strong> من '+ar(st.asked)+'. أطول سلسلة إجابات صحيحة: '+ar(st.best)+'.';
      $('rows').innerHTML=KINDS.map(k=>{const [c,n]=st.stat[k], p=n?Math.round(c/n*100):0;
        return '<div class="row"><span>'+NAME[k]+'</span><div class="track"><i style="width:'+p+'%"></i></div><span>'+ar(c)+'/'+ar(n)+'</span></div>'}).join('');
      $('missedH').hidden=$('missed').hidden=!st.missed.length;
      $('missed').innerHTML=st.missed.map(m=>'<li><b>'+m.text+'</b> ← '+NAME[m.t]+'. '+m.exp+'</li>').join('');
      tone(523,.12,'triangle'); tone(659,.12,'triangle',.12); tone(784,.3,'triangle',.24);
      $('again').focus();
    }
    $('go').onclick=()=>{ if(mode==='intro') newGame(); else if(mode==='inter'||mode==='shown') showCard(); };
    $('again').onclick=()=>{ if(result&&!sent){sent=true; ($('again') as HTMLButtonElement).disabled=true; onCompleteRef.current(result)} };
    panels.forEach(p=>p.onclick=()=>{
      const t=kindOf(p);
      if(mode==='ask') return answer(t);
      if(mode==='intro'){
        clearMarks(); p.classList.add('pick'); fx[t]=performance.now();
        $('kind').textContent='تعرّفي على الحدود'; $('big').textContent=NAME[t]; $('say').textContent=INFO[t]; tone(440,.1,'triangle');
      }
    });
    const onKey=(e: KeyboardEvent)=>{
      const k=({'1':'d','2':'c','3':'t','١':'d','٢':'c','٣':'t'} as Record<string, Kind>)[e.key];
      if(k&&mode==='ask'){e.preventDefault(); answer(k)}
    };
    window.addEventListener('keydown',onKey);

    /* ---------- living diagrams (logical 300x200) ---------- */
    function arrow(g: G, x: number, y: number, ang: number, ph: number){
      g.save(); g.translate(x,y); g.rotate(ang); g.translate(Math.sin(ph*4)*3,0);
      g.lineJoin='round'; g.beginPath();
      g.moveTo(-15,-4);g.lineTo(3,-4);g.lineTo(3,-10);g.lineTo(17,0);g.lineTo(3,10);g.lineTo(3,4);g.lineTo(-15,4);g.closePath();
      g.fillStyle='#fff'; g.strokeStyle='#07141d'; g.lineWidth=2; g.stroke(); g.fill(); g.restore();
    }
    function mantle(g: G){
      const m=g.createLinearGradient(0,60,0,200); m.addColorStop(0,'#a03a1c'); m.addColorStop(1,'#3d130e');
      g.fillStyle=m; g.fillRect(0,0,300,200);
    }
    function sea(g: G, path?: Path2D){
      const w=g.createLinearGradient(0,0,0,90); w.addColorStop(0,'#2aa9c8'); w.addColorStop(1,'#145d7a');
      g.fillStyle=w; if(path) g.fill(path); else g.fillRect(0,0,300,75);
    }
    function drawD(g: G, ph: number){
      mantle(g); sea(g);
      // rising magma
      const mg=g.createLinearGradient(0,60,0,200); mg.addColorStop(0,'#ffe27a'); mg.addColorStop(.4,'#ff9a2e'); mg.addColorStop(1,'#e5432d');
      g.save(); g.shadowColor='#ffb347'; g.shadowBlur=16; g.fillStyle=mg;
      g.beginPath(); g.moveTo(112,200); g.bezierCurveTo(138,150,142,100,144,58); g.lineTo(156,58); g.bezierCurveTo(158,100,162,150,188,200); g.closePath(); g.fill(); g.restore();
      for(let i=0;i<5;i++){const p=(ph*.35+i/5)%1; g.fillStyle='rgba(255,240,170,'+(1-p)+')';
        g.beginPath(); g.arc(150+Math.sin(i*9+ph)*7*(1-p),195-p*125,4*(1-p)+1.5,0,7); g.fill()}
      const off=(ph*14)%22;
      for(const s of [-1,1]){
        const P=new Path2D(); const X=(x: number)=>150+s*x;
        P.moveTo(X(160),74); P.lineTo(X(52),74); P.lineTo(X(9),56); P.lineTo(X(9),100); P.lineTo(X(160),102); P.closePath();
        g.fillStyle='#55697c'; g.fill(P); g.save(); g.clip(P);
        for(let k=0;k<8;k++){const d=9+k*22+off; g.strokeStyle=d<34?'rgba(255,170,70,.9)':'rgba(255,255,255,.2)'; g.lineWidth=d<34?4:2;
          g.beginPath(); g.moveTo(X(d),50); g.lineTo(X(d),104); g.stroke()}
        g.restore(); g.strokeStyle='#8fa5b8'; g.lineWidth=2; g.beginPath(); g.moveTo(X(160),74); g.lineTo(X(52),74); g.lineTo(X(9),56); g.stroke();
        arrow(g,X(88),128,s<0?Math.PI:0,ph);
      }
    }
    function drawC(g: G, ph: number){
      mantle(g);
      g.fillStyle='#173a52'; g.fillRect(0,0,300,60);
      const W=new Path2D(); W.moveTo(0,52);W.lineTo(163,52);W.lineTo(140,88);W.lineTo(118,80);W.lineTo(0,80);W.closePath(); sea(g,W);
      // continent with mountains and a volcano
      const C=new Path2D();
      [[140,86],[165,52],[182,46],[196,36],[205,45],[215,17],[222,17],[235,45],[251,33],[264,45],[300,40],[300,150],[192,150],[158,104]].forEach((p,i)=>i?C.lineTo(p[0],p[1]):C.moveTo(p[0],p[1]));
      C.closePath();
      const cg=g.createLinearGradient(0,20,0,150); cg.addColorStop(0,'#e6bd63'); cg.addColorStop(1,'#9a7436'); g.fillStyle=cg; g.fill(C);
      // conduit + blobs
      g.save(); g.shadowColor='#ffb347'; g.shadowBlur=10; g.strokeStyle='#ff9a2e'; g.lineWidth=4; g.lineCap='round';
      g.beginPath(); g.moveTo(203,152); g.quadraticCurveTo(222,90,218,19); g.stroke(); g.restore();
      for(let i=0;i<4;i++){const p=(ph*.4+i/4)%1; g.fillStyle='rgba(255,238,160,'+(1-p*.6)+')'; g.beginPath(); g.arc(205+p*13,150-p*130,3,0,7); g.fill()}
      g.fillStyle='#e5432d'; g.fillRect(214,15,9,5);
      for(let i=0;i<5;i++){const p=(ph*.45+i/5)%1; g.fillStyle='rgba(215,220,225,'+(.75*(1-p))+')';
        g.beginPath(); g.arc(218+Math.sin(i*5+p*5)*7+p*8,13-p*16,3+p*6,0,7); g.fill()}
      // subducting oceanic slab
      const Sl=new Path2D(); Sl.moveTo(0,80);Sl.lineTo(115,80);Sl.quadraticCurveTo(140,82,158,104);Sl.lineTo(228,200);Sl.lineTo(196,200);Sl.lineTo(138,118);Sl.quadraticCurveTo(126,103,108,102);Sl.lineTo(0,102);Sl.closePath();
      g.fillStyle='#55697c'; g.fill(Sl); g.save(); g.clip(Sl); g.strokeStyle='rgba(255,255,255,.22)'; g.lineWidth=2;
      const off=(ph*14)%22;
      for(let k=-1;k<13;k++){const s=k*22+off; g.beginPath();
        if(s<114){g.moveTo(s,78);g.lineTo(s,104)} else if(s>138){const u=s-138; const px=158+.589*u, py=104+.808*u; g.moveTo(px+3,py-2); g.lineTo(px-23,py+16)}
        g.stroke()}
      g.restore(); g.strokeStyle='#8fa5b8'; g.lineWidth=2; g.beginPath(); g.moveTo(0,80);g.lineTo(115,80);g.quadraticCurveTo(140,82,158,104);g.lineTo(228,200); g.stroke();
      arrow(g,58,128,0,ph); arrow(g,262,105,Math.PI,ph);
    }
    function drawT(g: G, ph: number){
      const off=(ph*16)%200;
      const side=(x0: number, w: number, shift: number, base: string)=>{
        g.save(); g.beginPath(); g.rect(x0,0,w,200); g.clip(); g.fillStyle=base; g.fillRect(x0,0,w,200);
        for(const r of [-1,0,1]){const y=r*200+shift;
          g.fillStyle='rgba(70,130,70,.55)'; g.fillRect(20,y+12,70,26); g.fillRect(190,y+92,80,24); g.fillRect(96,y+170,60,18); g.fillRect(170,y+14,50,20);
          g.strokeStyle='#3fbfdc'; g.lineWidth=9; g.lineCap='butt'; g.beginPath(); g.moveTo(-5,y+64);
          for(let x=0;x<=305;x+=15) g.lineTo(x,y+64+Math.sin(x*.045)*7); g.stroke();
          g.strokeStyle='#3b3f46'; g.lineWidth=11; g.beginPath(); g.moveTo(-5,y+146); g.lineTo(305,y+146); g.stroke();
          g.strokeStyle='#f3e9c4'; g.lineWidth=1.5; g.setLineDash([8,7]); g.beginPath(); g.moveTo(-5,y+146); g.lineTo(305,y+146); g.stroke(); g.setLineDash([]);
        }
        g.restore();
      };
      side(0,150,-off,'#c2a964'); side(150,150,off,'#b09755');
      for(let i=0;i<3;i++){const p=(ph*.5+i/3)%1; g.strokeStyle='rgba(255,255,255,'+(.7*(1-p))+')'; g.lineWidth=2; g.beginPath(); g.arc(150,100,8+p*70,0,7); g.stroke()}
      g.save(); g.shadowColor='#e5432d'; g.shadowBlur=8; g.strokeStyle='#2a1512'; g.lineWidth=4; g.lineJoin='round'; g.beginPath(); g.moveTo(150,-5);
      for(let y=10;y<=210;y+=20) g.lineTo(150+((y/20)%2?4:-4),y); g.stroke(); g.restore();
      arrow(g,76,104,-Math.PI/2,ph); arrow(g,224,104,Math.PI/2,ph);
    }
    const DRAW: Record<Kind, (g: G, ph: number) => void> = {d:drawD,c:drawC,t:drawT};
    const phase: Record<Kind, number> = {d:0,c:.4,t:.8};
    const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last=performance.now(), raf=0;
    function frame(now: number){
      const dt=Math.min(.05,(now-last)/1000); last=now;
      if(!$('panels').hidden) for(const p of panels){
        const t=kindOf(p), c=p.querySelector('canvas')!, g=c.getContext('2d');
        if(!g) continue;
        const boost=now-fx[t]<1600&&fx[t]?3.2:1;
        phase[t]+=dt*boost*(still?0:1);
        g.setTransform(c.width/300,0,0,c.height/200,0,0); g.clearRect(0,0,300,200);
        if(t==='t'&&boost>1&&!still) g.translate(Math.sin(now*.09)*2.5,0);
        DRAW[t](g,phase[t]);
      }
      if(mode==='ask'&&S&&S.round===2){
        const left=deadline-now; bar('timer').style.width=Math.max(0,left/150)+'%';
        if(left<=0) answer(null);
      }
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKey)
      mode = "end"
      if (AC) AC.close().catch(() => {})
    }
  }, [])

  return (
    <div className="pbx" dir="rtl" lang="ar" ref={rootRef}>
      <style>{STYLES}</style>
      <div className="app">
        <div className="top">
          <p className="title">مستكشفة <span>حدود الصفائح</span></p>
          <div className="hud">
            <span className="chip" data-el="roundChip">٣ جولات</span>
            <span className="chip">النقاط<b data-el="score">٠</b></span>
            <span className="chip">متتالية<b data-el="streak">٠</b></span>
            <button className="ghost" data-el="sound" type="button">الصوت: يعمل</button>
          </div>
        </div>

        <div className="track" data-el="progress" aria-hidden="true"><i /></div>

        <section className="pcard" data-el="card" aria-live="polite">
          <span className="kind" data-el="kind">كيف تلعبين؟</span>
          <p className="big" data-el="big">اربطي كل ظاهرة بالحدّ الذي يصنعها</p>
          <p className="say" data-el="say">ستظهر لكِ ظاهرة أو مكان من العالم. اختاري نوع حدود الصفائح المسؤول عنه. اضغطي الآن على أي حدّ في الأسفل لتتعرّفي عليه قبل البدء.</p>
          <button className="go" data-el="go" type="button">ابدئي اللعب</button>
        </section>

        <div className="track" data-el="timer" hidden aria-hidden="true"><i /></div>

        <div className="panels" data-el="panels">
          <button className="panel" type="button" data-t="d">
            <canvas width={600} height={400} aria-hidden="true" />
            <span className="name">حدود متباعدة</span>
            <span className="move">الصفيحتان تبتعدان</span>
            <span className="key">مفتاح ١</span>
          </button>
          <button className="panel" type="button" data-t="c">
            <canvas width={600} height={400} aria-hidden="true" />
            <span className="name">حدود متقاربة</span>
            <span className="move">الصفيحتان تتصادمان</span>
            <span className="key">مفتاح ٢</span>
          </button>
          <button className="panel" type="button" data-t="t">
            <canvas width={600} height={400} aria-hidden="true" />
            <span className="name">حدود تحويلية</span>
            <span className="move">الصفيحتان تنزلقان جانبيًّا</span>
            <span className="key">مفتاح ٣</span>
          </button>
        </div>

        <section className="pcard" data-el="end" hidden>
          <div className="stars" data-el="stars" />
          <p className="big" data-el="endTitle" />
          <p className="say" data-el="endSay" />
          <p className="sub">إتقانك لكل نوع</p>
          <div className="rows" data-el="rows" />
          <p className="sub" data-el="missedH">راجعي هذه الظواهر</p>
          <ul className="missed" data-el="missed" />
          <button className="go" data-el="again" type="button">احفظي النتيجة</button>
        </section>
      </div>
    </div>
  )
}
