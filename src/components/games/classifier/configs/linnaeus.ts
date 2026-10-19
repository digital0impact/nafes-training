/**
 * سلّم لينيوس – ناتج التعلم: تصنيف المخلوقات الحية وفق نظام لينيوس.
 * المحتوى مأخوذ من دروس «منصة سليمان المالكي التعليمية»، الصف التاسع (الثالث المتوسط)، العلوم:
 * «تصنيف المخلوقات الحية»، «مقارنة الخصائص الرئيسة للمخلوقات الحية»، «تصنيف مخلوقات من البيئة المحلية».
 */
import { bg, blob, motes } from "../kit"
import type { CardDef, ClassifierConfig, Draw, G } from "../types"

function archaea(g: G, ph: number) {
  bg(g, "#4a2511", "#1f0e05")
  // ينبوع حار: فقاعات تصعد وبكتيريا عصوية
  g.fillStyle = "#e8590c"
  g.beginPath()
  g.ellipse(150, 186, 120, 24, 0, 0, 7)
  g.fill()
  for (let i = 0; i < 10; i++) {
    const t = (ph * 0.25 + i / 10) % 1
    g.strokeStyle = "rgba(255,212,59," + (1 - t) + ")"
    g.lineWidth = 2
    g.beginPath()
    g.arc(70 + i * 17, 180 - t * 160, 3 + t * 5, 0, 7)
    g.stroke()
  }
  for (let i = 0; i < 6; i++) {
    g.save()
    g.translate(80 + i * 30, 100 + Math.sin(ph + i) * 12)
    g.rotate(i + ph * 0.3)
    g.fillStyle = "#ff922b"
    g.beginPath()
    g.roundRect(-10, -4, 20, 8, 4)
    g.fill()
    g.restore()
  }
}

function bacteria(g: G, ph: number) {
  bg(g, "#2b1a3b", "#120a1c")
  motes(g, ph, "#d0bfff", 8)
  for (let i = 0; i < 9; i++) {
    const x = 50 + (i % 3) * 100 + Math.sin(ph + i) * 8
    const y = 50 + Math.floor(i / 3) * 52 + Math.cos(ph * 1.2 + i) * 6
    g.save()
    g.translate(x, y)
    g.rotate(i * 0.7)
    g.fillStyle = i % 2 ? "#b197fc" : "#9775fa"
    g.beginPath()
    if (i % 3 === 0) g.arc(0, 0, 11, 0, 7)
    else g.roundRect(-18, -7, 36, 14, 7)
    g.fill()
    // الحمض النووي حر داخل الخلية (بدائية النواة)
    g.strokeStyle = "#e5dbff"
    g.lineWidth = 1.2
    g.beginPath()
    g.moveTo(-6, -2)
    g.quadraticCurveTo(0, 4, 6, -2)
    g.stroke()
    g.restore()
  }
}

function protists(g: G, ph: number) {
  bg(g, "#0f3a33", "#06201c")
  motes(g, ph, "#96f2d7", 10)
  blob(g, 120, 100, 52, 40, ph * 1.4, 9, 4)
  g.fillStyle = "rgba(150,242,215,.55)"
  g.fill()
  g.strokeStyle = "#e6fcf5"
  g.lineWidth = 2
  g.stroke()
  g.fillStyle = "#0ca678"
  g.beginPath()
  g.arc(112, 96, 12, 0, 7)
  g.fill()
  // طحلب خيطي
  g.strokeStyle = "#51cf66"
  g.lineWidth = 6
  g.lineCap = "round"
  g.beginPath()
  for (let y = 20; y <= 180; y += 8) g.lineTo(232 + Math.sin(y * 0.06 + ph) * 10, y)
  g.stroke()
}

function fungi(g: G, ph: number) {
  bg(g, "#2e2416", "#140f08")
  g.fillStyle = "#5c4022"
  g.fillRect(0, 160, 300, 40)
  ;[[110, 1], [190, 0.75]].forEach(([x, s]) => {
    const sw = Math.sin(ph + x) * 2
    g.fillStyle = "#f1e6d2"
    g.fillRect(x - 9 * s, 160 - 60 * s, 18 * s, 60 * s)
    g.fillStyle = "#c2410c"
    g.beginPath()
    g.ellipse(x + sw, 160 - 60 * s, 46 * s, 30 * s, 0, Math.PI, 0)
    g.fill()
    g.fillStyle = "#fff4e6"
    for (const [dx, dy] of [[-20, -14], [6, -22], [24, -10]]) {
      g.beginPath()
      g.arc(x + sw + dx * s, 160 - 60 * s + dy * s, 4 * s, 0, 7)
      g.fill()
    }
  })
  // أبواغ تتطاير
  for (let i = 0; i < 8; i++) {
    const t = (ph * 0.2 + i / 8) % 1
    g.fillStyle = "rgba(255,244,230," + (1 - t) + ")"
    g.beginPath()
    g.arc(110 + i * 12 - t * 20, 90 - t * 70, 1.6, 0, 7)
    g.fill()
  }
}

function plants(g: G, ph: number) {
  bg(g, "#0f2e4a", "#081a2a")
  // شمس وبناء ضوئي
  g.fillStyle = "#ffd43b"
  g.beginPath()
  g.arc(250, 40, 18, 0, 7)
  g.fill()
  g.fillStyle = "#c9a227"
  g.fillRect(0, 170, 300, 30)
  // نخلة
  g.strokeStyle = "#8d6e3c"
  g.lineWidth = 9
  g.beginPath()
  g.moveTo(130, 172)
  g.quadraticCurveTo(122, 120, 140, 66)
  g.stroke()
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.5 + Math.sin(ph + i) * 0.05
    g.strokeStyle = "#2f9e44"
    g.lineWidth = 5
    g.beginPath()
    g.moveTo(140, 66)
    g.quadraticCurveTo(140 + Math.cos(a) * 40, 66 + Math.sin(a) * 40 - 12, 140 + Math.cos(a) * 64, 66 + Math.sin(a) * 64 + 18)
    g.stroke()
  }
  g.fillStyle = "#a0522d"
  for (const dx of [-6, 4]) {
    g.beginPath()
    g.arc(140 + dx, 76, 5, 0, 7)
    g.fill()
  }
}

function animals(g: G, ph: number) {
  bg(g, "#3b2a0d", "#1a1206")
  g.fillStyle = "#e9c46a"
  g.fillRect(0, 168, 300, 32)
  // صقر يطير
  const fl = Math.sin(ph * 4) * 14
  const x = 150 + Math.sin(ph * 0.6) * 60
  const y = 70 + Math.cos(ph * 0.8) * 10
  g.fillStyle = "#6b4f2a"
  g.beginPath()
  g.moveTo(x - 50, y - fl)
  g.quadraticCurveTo(x - 20, y - 6, x, y)
  g.quadraticCurveTo(x + 20, y - 6, x + 50, y - fl)
  g.quadraticCurveTo(x + 18, y + 6, x, y + 12)
  g.quadraticCurveTo(x - 18, y + 6, x - 50, y - fl)
  g.fill()
  g.fillStyle = "#f1e6d2"
  g.beginPath()
  g.arc(x, y - 4, 6, 0, 7)
  g.fill()
  // جمل على الرمل
  g.fillStyle = "#b07d3a"
  const cx = 90
  g.beginPath()
  g.ellipse(cx, 140, 34, 14, 0, 0, 7)
  g.fill()
  g.beginPath()
  g.ellipse(cx - 4, 126, 14, 10, 0, 0, 7)
  g.fill()
  g.lineWidth = 5
  g.strokeStyle = "#b07d3a"
  g.lineCap = "round"
  g.beginPath()
  g.moveTo(cx + 30, 136)
  g.quadraticCurveTo(cx + 44, 110, cx + 50, 108)
  g.stroke()
  for (const lx of [-24, -12, 14, 26]) {
    g.beginPath()
    g.moveTo(cx + lx, 148)
    g.lineTo(cx + lx + Math.sin(ph * 3 + lx) * 2, 170)
    g.stroke()
  }
}

/** السلم التصنيفي: مستويات متداخلة من الأعم إلى الأخص، مع إبراز المستوى المطلوب */
function ladder(level: number): Draw {
  const names = ["المملكة", "الشعبة", "الطائفة", "الرتبة"]
  return (g, ph) => {
    bg(g, "#13283f", "#0a1626")
    for (let i = 0; i < 4; i++) {
      const w = 260 - i * 56
      const h = 176 - i * 40
      const on = i === level
      g.fillStyle = on ? "rgba(255,212,59,.28)" : "rgba(255,255,255," + (0.05 + i * 0.03) + ")"
      g.strokeStyle = on ? "#ffd43b" : "rgba(255,255,255,.3)"
      g.lineWidth = on ? 3 + Math.sin(ph * 4) : 1.5
      g.beginPath()
      g.roundRect(150 - w / 2, 100 - h / 2 + i * 6, w, h, 14)
      g.fill()
      g.stroke()
      g.fillStyle = on ? "#ffd43b" : "rgba(255,255,255,.55)"
      g.font = (on ? "bold " : "") + "13px sans-serif"
      g.textAlign = "center"
      g.fillText(names[i], 150, 100 - h / 2 + i * 6 + 16)
    }
  }
}

const KINGDOMS: CardDef[] = [
  ["arch", "وحيدة الخلية تعيش في بيئات قاسية", "البدائيات القديمة: وحيدة الخلية، تعيش في بيئات قاسية، ومن أمثلتها بكتيريا الينابيع الحارة."],
  ["arch", "بكتيريا الينابيع الحارة", "بكتيريا الينابيع الحارة مثال على مملكة البدائيات القديمة."],
  ["bact", "كائناتها بدائية النواة", "البكتيريا بدائية النواة."],
  ["bact", "بكتيريا الأمعاء", "بكتيريا الأمعاء مثال على مملكة البكتيريا."],
  ["prot", "حقيقية النواة، معظمها وحيدة الخلية", "الطلائعيات حقيقية النواة، ومعظمها وحيدة الخلية، ومن أمثلتها الأميبا والطحالب."],
  ["prot", "الأميبا", "الأميبا مثال على مملكة الطلائعيات."],
  ["prot", "تضم كائنات ذاتية وغير ذاتية التغذية", "الطلائعيات متنوعة: تضم كائنات ذاتية وغير ذاتية التغذية، ومعظمها متحرك."],
  ["fung", "غير ذاتية التغذية ولها جدار خلوي", "الفطريات غير ذاتية التغذية ولها جدار خلوي، ومن أمثلتها عيش الغراب والخميرة."],
  ["fung", "عيش الغراب والخميرة", "عيش الغراب والخميرة مثالان على مملكة الفطريات."],
  ["fung", "تتغذى بتحليل المواد العضوية (رمية أو طفيلية)", "الفطريات غير ذاتية التغذية (رمية/طفيلية) وغير متحركة، وتحصل على غذائها بالتحليل."],
  ["plant", "ذاتية التغذية (البناء الضوئي) ولها جدار خلوي", "النباتات ذاتية التغذية ولها جدار خلوي، وتصنع غذاءها بالبناء الضوئي."],
  ["plant", "الأشجار والأعشاب", "الأشجار والأعشاب أمثلة على مملكة النباتات."],
  ["plant", "النخلة", "النخلة من مملكة النباتات، شعبة مغطاة البذور، طائفة أحادية الفلقة."],
  ["anim", "غير ذاتية التغذية، متعددة الخلايا", "الحيوانات غير ذاتية التغذية ومتعددة الخلايا، ومن أمثلتها الإنسان والطيور."],
  ["anim", "تتحرك بحرية", "الحركة هي الخاصية التي تميز الحيوانات عن النباتات؛ فالحيوانات تتحرك بحرية."],
  ["anim", "الجمل والصقر", "الجمل والصقر من مملكة الحيوانات، ويشتركان في شعبة الحبليات."],
]

const LEVELS: CardDef[] = [
  ["k", "أوسع مستوى في التصنيف", "المملكة (Kingdom) هي أوسع مستوى تصنيفي."],
  ["k", "الحيوانات (عند تصنيف الإنسان)", "عند تصنيف الإنسان حسب مستويات لينيوس: المملكة هي الحيوانات."],
  ["k", "النباتات (عند تصنيف النخلة)", "النخلة من مملكة النباتات."],
  ["p", "تقسيم المملكة", "الشعبة (Phylum) هي تقسيم المملكة."],
  ["p", "الحبليات (عند تصنيف الجمل)", "الجمل من شعبة الحبليات، ويشترك مع الصقر في الشعبة."],
  ["p", "مغطاة البذور (عند تصنيف النخلة)", "النخلة من شعبة مغطاة البذور."],
  ["p", "المفصليات (عند تصنيف النحلة)", "النحلة من شعبة المفصليات؛ فالحشرات من المفصليات."],
  ["c", "تقسيم الشعبة", "الطائفة (Class) هي تقسيم الشعبة."],
  ["c", "الثدييات (عند تصنيف الجمل)", "الجمل من طائفة الثدييات، لأنه يرضع صغاره."],
  ["c", "الطيور (عند تصنيف الصقر)", "الصقر من طائفة الطيور."],
  ["c", "أحادية الفلقة (عند تصنيف النخلة)", "النخلة من طائفة أحادية الفلقة."],
  ["c", "الحشرات (عند تصنيف النحلة)", "النحلة من طائفة الحشرات."],
  ["o", "تقسيم الطائفة", "الرتبة (Order) هي تقسيم الطائفة."],
  ["o", "الرئيسيات (عند تصنيف الإنسان)", "عند تصنيف الإنسان: الرتبة هي الرئيسيات."],
  ["o", "مزدوجة الأصابع (عند تصنيف الجمل)", "الجمل له خف، فهو من رتبة مزدوجة الأصابع."],
]

export const linnaeus: ClassifierConfig = {
  title: ["سلّم", "لينيوس"],
  intro: {
    big: "صنّفي المخلوقات كما رتّبها لينيوس",
    say: "التصنيف هو علم ترتيب المخلوقات الحية في مجموعات بناءً على خصائص مشتركة. اختاري المملكة أو المستوى التصنيفي الصحيح لكل بطاقة. اضغطي على أي لوحة لتتعرّفي عليها قبل البدء.",
  },
  panels: {
    arch: { name: "البدائيات القديمة", hint: "بيئات قاسية", info: "وحيدة الخلية، تعيش في بيئات قاسية. مثال: بكتيريا الينابيع الحارة.", draw: archaea },
    bact: { name: "البكتيريا", hint: "بدائية النواة", info: "بدائية النواة، بعضها متحرك، منها ذاتية وغير ذاتية التغذية. مثال: بكتيريا الأمعاء.", draw: bacteria },
    prot: { name: "الطلائعيات", hint: "حقيقية النواة", info: "حقيقية النواة، معظمها وحيدة الخلية ومعظمها متحرك. مثال: الأميبا، الطحالب.", draw: protists },
    fung: { name: "الفطريات", hint: "رمية أو طفيلية", info: "غير ذاتية التغذية، لها جدار خلوي، غير متحركة. مثال: عيش الغراب، الخميرة.", draw: fungi },
    plant: { name: "النباتات", hint: "بناء ضوئي", info: "ذاتية التغذية (البناء الضوئي)، لها جدار خلوي، غير متحركة. مثال: الأشجار، الأعشاب.", draw: plants },
    anim: { name: "الحيوانات", hint: "متحركة", info: "غير ذاتية التغذية، متعددة الخلايا، متحركة. مثال: الإنسان، الطيور.", draw: animals },
    k: { name: "المملكة", hint: "أوسع مستوى", info: "المملكة (Kingdom): أوسع مستوى في السلم التصنيفي.", draw: ladder(0) },
    p: { name: "الشعبة", hint: "تقسيم المملكة", info: "الشعبة (Phylum): تقسيم المملكة.", draw: ladder(1) },
    c: { name: "الطائفة", hint: "تقسيم الشعبة", info: "الطائفة (Class): تقسيم الشعبة.", draw: ladder(2) },
    o: { name: "الرتبة", hint: "تقسيم الطائفة", info: "الرتبة (Order): تقسيم الطائفة.", draw: ladder(3) },
  },
  rounds: [
    {
      name: "الممالك الست",
      say: "خصائص وأمثلة من الممالك الست. إلى أي مملكة تنتمي كل بطاقة؟",
      kind: "إلى أي مملكة تنتمي؟",
      panels: ["arch", "bact", "prot", "fung", "plant", "anim"],
      cards: KINGDOMS,
    },
    {
      name: "السلم التصنيفي",
      say: "رتّب لينيوس الكائنات في مستويات متدرجة من الأعم للأخص. أي مستوى تمثله كل بطاقة؟",
      kind: "أي مستوى تصنيفي هذا؟",
      panels: ["k", "p", "c", "o"],
      cards: LEVELS,
    },
    {
      name: "التحدي السريع: الممالك",
      say: "عشرة أسئلة عن الممالك الست، ولكل سؤال ١٥ ثانية. الإجابة الأسرع تكسب نقاطًا إضافية.",
      kind: "إلى أي مملكة تنتمي؟",
      panels: ["arch", "bact", "prot", "fung", "plant", "anim"],
      cards: KINGDOMS,
      timed: 15,
    },
  ],
  ranks: ["عالِمة تصنيف خبيرة", "مستكشفة ماهرة", "بداية جيدة، حاولي من جديد"],
  source: "منصة سليمان المالكي التعليمية، الصف التاسع: «تصنيف المخلوقات الحية»، «مقارنة الخصائص الرئيسة للمخلوقات الحية»، «تصنيف مخلوقات من البيئة المحلية»",
}
