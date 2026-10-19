/**
 * مستكشفة الخلية – ناتج التعلم: الخلية وحدة البناء الأساسية في المخلوقات الحية.
 * المحتوى مأخوذ من: ملخص التفوق، العلوم، الصف الأول المتوسط، الفصل الدراسي الثاني،
 * الفصل التاسع «الخلايا لبنات الحياة» (صفحات الملخص ١٨–٢١ و٥٠–٥١).
 */
import { bg, blob, glow, motes } from "../kit"
import type { CardDef, ClassifierConfig, Draw, G } from "../types"

type Part = "wall" | "membrane" | "cyto" | "nucleus" | "vacuole" | "mito" | "chloro"

/** خلية نباتية واحدة بكل أجزائها، مع إبراز الجزء المطلوب */
function plantCell(hi: Part): Draw {
  return (g: G, ph: number) => {
    bg(g, "#0f3a33", "#0a1f1c")
    motes(g, ph, "#9be3c4", 8)
    const cx = 150
    const cy = 100
    const dim = (p: Part) => (hi === p ? 1 : 0.32)
    // الجدار الخلوي
    g.globalAlpha = dim("wall")
    g.fillStyle = "#3f7d3a"
    g.beginPath()
    g.roundRect(46, 22, 208, 156, 26)
    g.fill()
    g.lineWidth = hi === "wall" ? 5 : 3
    g.strokeStyle = "#a6e07a"
    g.stroke()
    // الغشاء البلازمي والسيتوبلازم
    g.globalAlpha = dim("cyto")
    blob(g, cx, cy, 94, 68, ph, 2.5, 6)
    g.fillStyle = hi === "cyto" ? "#b8f0d6" : "#8fd3b5"
    g.fill()
    g.globalAlpha = dim("membrane")
    g.lineWidth = hi === "membrane" ? 4 : 2
    g.strokeStyle = "#f2fff8"
    g.stroke()
    // الفجوة الكبيرة الوسطية
    g.globalAlpha = dim("vacuole")
    blob(g, cx + 4, cy + 4, 46, 34, ph * 0.7, 2, 4)
    g.fillStyle = "#6fc6e8"
    g.fill()
    g.strokeStyle = "#d9f4ff"
    g.lineWidth = 1.5
    g.stroke()
    // النواة جانبية
    g.globalAlpha = dim("nucleus")
    g.fillStyle = "#7a4fb3"
    g.beginPath()
    g.arc(80, 66, 18, 0, 7)
    g.fill()
    g.fillStyle = "#c9a8f5"
    g.beginPath()
    g.arc(77, 63, 6, 0, 7)
    g.fill()
    // البلاستيدات الخضراء
    g.globalAlpha = dim("chloro")
    const chl: [number, number][] = [[200, 50], [222, 92], [196, 140], [100, 142], [74, 112]]
    chl.forEach(([x, y], i) => {
      g.save()
      g.translate(x + Math.sin(ph + i) * 3, y + Math.cos(ph + i) * 2)
      g.rotate(i)
      g.fillStyle = "#2f9e44"
      g.beginPath()
      g.ellipse(0, 0, 11, 6, 0, 0, 7)
      g.fill()
      g.strokeStyle = "#b2f2bb"
      g.lineWidth = 1
      for (let k = -6; k <= 6; k += 4) {
        g.beginPath()
        g.moveTo(k, -3)
        g.lineTo(k, 3)
        g.stroke()
      }
      g.restore()
    })
    // الميتوكندريا
    g.globalAlpha = dim("mito")
    const mit: [number, number][] = [[126, 48], [176, 152], [228, 128]]
    mit.forEach(([x, y], i) => {
      g.save()
      g.translate(x + Math.cos(ph * 1.3 + i) * 3, y)
      g.rotate(-0.5 + i)
      g.fillStyle = "#e8590c"
      g.beginPath()
      g.ellipse(0, 0, 12, 6, 0, 0, 7)
      g.fill()
      g.strokeStyle = "#ffd8a8"
      g.lineWidth = 1.2
      g.beginPath()
      for (let k = -9; k <= 9; k += 3) g.lineTo(k, k % 6 === 0 ? -3 : 3)
      g.stroke()
      g.restore()
    })
    g.globalAlpha = 1
    // إبراز الجزء المطلوب
    const spot: Record<Part, [number, number, number]> = {
      wall: [52, 30, 30],
      membrane: [244, 100, 26],
      cyto: [120, 128, 34],
      nucleus: [80, 66, 34],
      vacuole: [154, 104, 54],
      mito: [126, 48, 28],
      chloro: [200, 50, 28],
    }
    const [x, y, r] = spot[hi]
    glow(g, x, y, r, ph)
  }
}

/** خلية متخصصة: شكل يعبّر عن وظيفتها */
function nerve(g: G, ph: number) {
  bg(g, "#1b1640", "#0c0a22")
  motes(g, ph, "#b197fc", 8)
  g.strokeStyle = "#e5dbff"
  g.lineCap = "round"
  const arms = 9
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2 + 0.3
    const L = i === 0 ? 0 : 34 + (i % 3) * 8
    if (!L) continue
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(110, 100)
    const ex = 110 + Math.cos(a) * L
    const ey = 100 + Math.sin(a) * L
    g.lineTo(ex, ey)
    g.stroke()
    g.lineWidth = 1.5
    for (const s of [-0.5, 0.5]) {
      g.beginPath()
      g.moveTo(ex, ey)
      g.lineTo(ex + Math.cos(a + s) * 12, ey + Math.sin(a + s) * 12)
      g.stroke()
    }
  }
  // المحور الطويل
  g.lineWidth = 5
  g.beginPath()
  g.moveTo(110, 100)
  g.lineTo(272, 100)
  g.stroke()
  g.fillStyle = "#9775fa"
  g.beginPath()
  g.arc(110, 100, 18, 0, 7)
  g.fill()
  g.fillStyle = "#5f3dc4"
  g.beginPath()
  g.arc(110, 100, 7, 0, 7)
  g.fill()
  // رسالة عصبية تنتقل بسرعة
  const p = (ph * 0.9) % 1
  g.fillStyle = "#ffe27a"
  g.shadowColor = "#ffe27a"
  g.shadowBlur = 12
  g.beginPath()
  g.arc(128 + p * 144, 100, 5, 0, 7)
  g.fill()
  g.shadowBlur = 0
}

function bone(g: G, ph: number) {
  bg(g, "#3a3326", "#1e1a12")
  g.fillStyle = "#e9dcc0"
  g.fillRect(0, 0, 300, 200)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 34 + c * 58 + (r % 2) * 29
      const y = 30 + r * 46
      for (let k = 3; k >= 1; k--) {
        g.strokeStyle = "rgba(150,120,70," + (0.25 + k * 0.1) + ")"
        g.lineWidth = 2
        g.beginPath()
        g.arc(x, y, 6 + k * 6, 0, 7)
        g.stroke()
      }
      g.fillStyle = "#8d6e3c"
      g.beginPath()
      g.ellipse(x, y, 6, 4, ph * 0.2 + c, 0, 7)
      g.fill()
    }
  }
  g.fillStyle = "rgba(255,255,255,.75)"
  g.font = "bold 15px sans-serif"
  g.textAlign = "center"
  g.fillText("Ca  P", 150 + Math.sin(ph) * 6, 190)
}

function muscle(g: G, ph: number) {
  bg(g, "#4a1018", "#22070b")
  const squeeze = 1 + 0.12 * Math.sin(ph * 3)
  for (let i = 0; i < 6; i++) {
    const y = 40 + i * 24
    g.fillStyle = i % 2 ? "#e03131" : "#c92a2a"
    g.beginPath()
    g.ellipse(150, y, 120 / squeeze, 9 * squeeze, 0, 0, 7)
    g.fill()
    g.strokeStyle = "rgba(255,200,200,.5)"
    g.lineWidth = 1
    for (let x = -100; x <= 100; x += 10) {
      g.beginPath()
      g.moveTo(150 + x / squeeze, y - 6)
      g.lineTo(150 + x / squeeze, y + 6)
      g.stroke()
    }
  }
}

function skin(g: G, ph: number) {
  bg(g, "#3b2a22", "#1c120d")
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const x = 8 + c * 42 + (r % 2) * 21
      const y = 26 + r * 30 + Math.sin(ph + c) * 0.8
      g.fillStyle = r === 0 ? "#f3c9a4" : "#e6b08a"
      g.strokeStyle = "#7a4a2e"
      g.lineWidth = 2
      g.beginPath()
      g.roundRect(x, y, 40, 26, 6)
      g.fill()
      g.stroke()
      g.fillStyle = "#8c5a3c"
      g.beginPath()
      g.ellipse(x + 20, y + 13, 5, 3, 0, 0, 7)
      g.fill()
    }
  }
}

function fat(g: G, ph: number) {
  bg(g, "#3d3410", "#1d1906")
  ;[[90, 100], [210, 100]].forEach(([x, y], i) => {
    const s = 1 + 0.03 * Math.sin(ph * 2 + i)
    g.fillStyle = "#fff3bf"
    g.strokeStyle = "#e6c55a"
    g.lineWidth = 3
    g.beginPath()
    g.arc(x, y, 62 * s, 0, 7)
    g.fill()
    g.stroke()
    g.fillStyle = "#ffd43b"
    g.beginPath()
    g.arc(x - 4, y + 2, 50 * s, 0, 7)
    g.fill()
    g.fillStyle = "#845ef7"
    g.beginPath()
    g.ellipse(x + 54 * s, y - 14, 6, 10, 0.3, 0, 7)
    g.fill()
  })
}

/** مستويات تنظيم الخلايا */
function orgCell(g: G, ph: number) {
  bg(g, "#123a4a", "#0a1f28")
  motes(g, ph, "#99e9f2", 8)
  blob(g, 150, 100, 60, 46, ph, 3, 5)
  g.fillStyle = "#8ce99a"
  g.fill()
  g.strokeStyle = "#ebfbee"
  g.lineWidth = 3
  g.stroke()
  g.fillStyle = "#5f3dc4"
  g.beginPath()
  g.arc(150, 98, 15, 0, 7)
  g.fill()
}

function orgTissue(g: G, ph: number) {
  bg(g, "#123a4a", "#0a1f28")
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++) {
      const x = 40 + c * 44 + (r % 2) * 22
      const y = 40 + r * 38
      blob(g, x, y, 20, 16, ph + r + c, 1.5, 4)
      g.fillStyle = "#8ce99a"
      g.fill()
      g.strokeStyle = "#2b8a3e"
      g.lineWidth = 2
      g.stroke()
      g.fillStyle = "#5f3dc4"
      g.beginPath()
      g.arc(x, y, 5, 0, 7)
      g.fill()
    }
}

function orgOrgan(g: G, ph: number) {
  bg(g, "#123a4a", "#0a1f28")
  const s = 1 + 0.06 * Math.max(0, Math.sin(ph * 5))
  g.save()
  g.translate(150, 104)
  g.scale(s, s)
  g.fillStyle = "#e03131"
  g.beginPath()
  g.moveTo(0, 62)
  g.bezierCurveTo(-90, 10, -60, -64, 0, -26)
  g.bezierCurveTo(60, -64, 90, 10, 0, 62)
  g.fill()
  g.strokeStyle = "#ffc9c9"
  g.lineWidth = 3
  g.stroke()
  g.fillStyle = "#c92a2a"
  g.fillRect(-14, -66, 12, 34)
  g.fillRect(6, -60, 12, 28)
  g.restore()
}

function orgSystem(g: G, ph: number) {
  bg(g, "#123a4a", "#0a1f28")
  // قصبة هوائية ورئتان: أعضاء تعمل معًا
  const b = 1 + 0.08 * Math.sin(ph * 2.4)
  g.strokeStyle = "#ffd8a8"
  g.lineWidth = 9
  g.lineCap = "round"
  g.beginPath()
  g.moveTo(150, 18)
  g.lineTo(150, 86)
  g.moveTo(150, 86)
  g.lineTo(118, 108)
  g.moveTo(150, 86)
  g.lineTo(182, 108)
  g.stroke()
  for (const sgn of [-1, 1]) {
    g.save()
    g.translate(150 + sgn * 54, 118)
    g.scale(b, b)
    g.fillStyle = "#f783ac"
    g.beginPath()
    g.ellipse(0, 0, 40, 62, sgn * 0.15, 0, 7)
    g.fill()
    g.strokeStyle = "#fcc2d7"
    g.lineWidth = 2
    g.stroke()
    g.restore()
  }
}

const SRC = "ملخص التفوق، الصف الأول المتوسط، الفصل الدراسي الثاني، الفصل التاسع «الخلايا لبنات الحياة»"

const PARTS: CardDef[] = [
  ["membrane", "حاجز مرن يحيط بالخلية ويحفظ مكوناتها", "الغشاء البلازمي حاجز مرن يحيط بالخلية؛ ويحفظ مكوناتها؛ ويتحكم بمرور المواد من الخلية وإليها."],
  ["membrane", "يتحكم بمرور المواد من الخلية وإليها", "الغشاء البلازمي ينظم مرور المواد من الخلية وإليها."],
  ["wall", "يوفر الدعم والحماية لخلايا النباتات والطحالب", "لبعض الخلايا مثل النباتات والطحالب جدار خلوي يوفر الدعم والحماية لها، ولا يوجد في الخلايا الحيوانية."],
  ["wall", "يوجد في خلايا النباتات والطحالب والفطريات ولا يوجد في الخلايا الحيوانية", "الجدار الخلوي يوجد في خلايا النباتات والطحالب والفطريات ويوفر الدعم والحماية للخلية."],
  ["wall", "تركيب في الخلية يوفر الحماية والتماسك للنبات", "الجدار الخلوي يوفر الدعم والحماية للخلية النباتية."],
  ["cyto", "مادة شبه هلامية توجد داخل الغشاء البلازمي", "السيتوبلازم مادة شبه هلامية توجد داخل الغشاء البلازمي، تحتوي على ماء ومواد كيميائية وأجزاء الخلية الأخرى."],
  ["cyto", "تتحرك العضيات بداخله", "العضيات أجزاء متخصصة تستطيع التحرك داخل السيتوبلازم، وتقوم بالعمليات الضرورية للحياة."],
  ["nucleus", "تسيطر وتنظم جميع نشاطات الخلية", "النواة تسيطر وتنظم جميع نشاطات الخلية."],
  ["nucleus", "تحتوي على مادة وراثية تسمى DNA تحدد صفات المخلوق الحي", "النواة تحتوي على مادة وراثية تسمى DNA تحدد صفات المخلوق الحي، ومحمولة على الكروموسومات."],
  ["nucleus", "توجد بداخلها الكروموسومات", "الكروموسومات توجد داخل النواة، وتحتوي على DNA الذي يحدد صفات المخلوق الحي."],
  ["nucleus", "وسطية في الخلايا الحيوانية وجانبية في الخلايا النباتية", "النواة وسطية في الخلايا الحيوانية، وجانبية في الخلايا النباتية بسبب كبر الفجوة العصارية."],
]

const ORGANELLES: CardDef[] = [
  ["vacuole", "تشبه البالون في شكلها", "الفجوات تشبه البالون، وتعمل على تخزين الغذاء والماء، وتخزين الفضلات إلى حين التخلص منها."],
  ["vacuole", "تخزن الغذاء والماء والفضلات إلى حين التخلص منها", "الفجوة تخزن الغذاء والأملاح المعدنية والفضلات لحين التخلص منها."],
  ["vacuole", "واحدة وكبيرة في الخلايا النباتية، وصغيرة ومتعددة في الخلايا الحيوانية", "الفجوة العصارية كبيرة ووسطية في الخلية النباتية، وصغيرة ومتعددة في الخلية الحيوانية."],
  ["mito", "تقوم بإنتاج الطاقة في الخلية عن طريق التنفس الخلوي", "الميتوكندريا تقوم بإنتاج الطاقة في الخلية عن طريق التنفس الخلوي."],
  ["mito", "تستخدم الأكسجين لتحويل طاقة الغذاء إلى شكل آخر من الطاقة تستطيع الخلية استخدامه", "في التنفس الخلوي تستخدم الميتوكندريا الأكسجين لتحويل طاقة الغذاء إلى شكل آخر من الطاقة تستطيع الخلية استخدامه."],
  ["mito", "غذاء + أكسجين ← ثاني أكسيد الكربون + ماء + طاقة", "هذه معادلة التنفس الخلوي الذي يحدث في الميتوكندريا، وينتج عنه فضلات عبارة عن ماء وثاني أكسيد الكربون."],
  ["chloro", "تساعد النباتات الخضراء والطحالب وبعض البكتيريا على صنع غذائها بنفسها", "البلاستيدات الخضراء تساعد المخلوقات المنتجة (ذاتية التغذية) على صنع غذائها بنفسها بواسطة عملية البناء الضوئي."],
  ["chloro", "عضيات خضراء يحدث بداخلها البناء الضوئي", "البلاستيدات الخضراء عضيات خضراء توجد في أوراق النباتات، ويحدث بداخلها البناء الضوئي."],
  ["chloro", "ثاني أكسيد الكربون + ماء ← (ضوء) غذاء + أكسجين", "هذه معادلة البناء الضوئي: امتصاص طاقة الضوء وتخزينها على شكل جزيئات غذاء، ويحدث في البلاستيدات الخضراء."],
  ["chloro", "تمتص الطاقة الضوئية لتحول ثاني أكسيد الكربون والماء إلى غذاء", "البلاستيدات الخضراء تمتص الطاقة الضوئية وتخزنها في الغذاء الناتج من اتحاد ثاني أكسيد الكربون بالماء."],
]

const SPECIAL: CardDef[] = [
  ["nerve", "تمتاز بطولها وكثرة تفرعاتها", "الخلايا العصبية تمتاز بطولها وكثرة تفرعاتها؛ مما يسمح لها باستقبال الرسائل وإرسالها بسرعة."],
  ["nerve", "تستقبل الرسائل وترسلها بسرعة", "الخلايا العصبية طويلة بها الكثير من الزوائد لاستقبال وإرسال الرسائل العصبية."],
  ["bone", "تحاط خلاياها بمواد صلبة مكونة من الكالسيوم والفسفور", "الخلية العظمية محاطة بمواد صلبة مكونة من الكالسيوم والفوسفور للحماية والقوة."],
  ["muscle", "تمتاز بطولها ووجود ألياف قادرة على الانقباض والانبساط", "الخلايا العضلية طويلة وتحوي الكثير من الألياف القادرة على الانقباض والانبساط."],
  ["skin", "مسطحة ومتراصة لتشكل طبقة حماية للأعضاء الداخلية", "خلايا الجلد مسطحة ومتراصة لحماية طبقات الجسم الداخلية."],
  ["fat", "تخزن كميات كبيرة من الدهن مما يدفع النواة باتجاه الغشاء البلازمي", "الخلايا الدهنية تخزن كميات كبيرة من الدهن؛ مما يؤدي إلى دفع النواة باتجاه الغشاء البلازمي."],
]

const LEVELS: CardDef[] = [
  ["cell", "اللبنة الأساسية للحياة، وتحدث بداخلها الأنشطة الحيوية", "من أفكار نظرية الخلية: الخلية هي اللبنة الأساسية للحياة وتحدث بداخلها الأنشطة الحيوية."],
  ["cell", "يتكون جسم البكتيريا منها فقط", "البكتيريا أصغر المخلوقات الحية الوحيدة الخلية، ويتكون جسمها من خلية واحدة فقط."],
  ["cell", "تنشأ جميعها من خلايا سابقة مماثلة لها", "من أفكار نظرية الخلية: جميع الخلايا تنشأ من خلايا سابقة مماثلة لها."],
  ["tissue", "مجموعة من الخلايا المتماثلة التي تقوم بوظيفة محددة", "النسيج هو مجموعة من الخلايا المتماثلة التي تقوم بوظيفة محددة."],
  ["tissue", "النسيج العضلي", "من أمثلة الأنسجة: النسيج العضلي، النسيج العظمي، النسيج الدموي."],
  ["tissue", "النسيج العظمي", "من أمثلة الأنسجة: النسيج العضلي، النسيج العظمي، النسيج الدموي."],
  ["tissue", "النسيج الدموي", "من أمثلة الأنسجة: النسيج العضلي، النسيج العظمي، النسيج الدموي."],
  ["organ", "نسيجان أو أكثر يعملان معًا ليقوم بوظائف لا يقوم بها عضو غيره", "العضو هو نسيجين أو أكثر يعملان معًا ليقوم بوظائف لا يقوم بها عضو غيره، مثل القلب والكلية."],
  ["organ", "القلب", "القلب عضو، فكل من القلب والكلية يعتبر عضوًا."],
  ["organ", "الكلية", "الكلية عضو، فكل من القلب والكلية يعتبر عضوًا."],
  ["organ", "المعدة", "المعدة عضو."],
  ["system", "مجموعة من الأعضاء التي تتآزر للقيام بوظيفة واحدة", "الجهاز هو مجموعة من الأعضاء التي تتآزر للقيام بوظيفة واحدة."],
  ["system", "الجهاز التنفسي", "من أمثلة الأجهزة: الجهاز التنفسي والجهاز الهضمي والجهاز الدوري."],
  ["system", "الجهاز الهضمي", "من أمثلة الأجهزة: الجهاز التنفسي والجهاز الهضمي والجهاز الدوري."],
  ["system", "الجهاز الدوري", "من أمثلة الأجهزة: الجهاز التنفسي والجهاز الهضمي والجهاز الدوري."],
]

export const cells: ClassifierConfig = {
  title: ["مستكشفة", "الخلية"],
  intro: {
    big: "اربطي كل وصف بجزء الخلية الصحيح",
    say: "ستظهر لكِ صفة أو وظيفة. اختاري الجزء أو الخلية التي تصفها. اضغطي الآن على أي لوحة في الأسفل لتتعرّفي عليها قبل البدء.",
  },
  panels: {
    membrane: { name: "الغشاء البلازمي", hint: "يحيط بالخلية", info: "حاجز مرن يحيط بالخلية؛ ويحفظ مكوناتها؛ ويتحكم بمرور المواد من الخلية وإليها.", draw: plantCell("membrane") },
    wall: { name: "الجدار الخلوي", hint: "دعم وحماية", info: "يوجد في خلايا النباتات والطحالب والفطريات ويوفر الدعم والحماية للخلية، ولا يوجد في الخلايا الحيوانية.", draw: plantCell("wall") },
    cyto: { name: "السيتوبلازم", hint: "مادة شبه هلامية", info: "مادة شبه هلامية توجد داخل الغشاء البلازمي، تحتوي على ماء ومواد كيميائية وأجزاء الخلية الأخرى.", draw: plantCell("cyto") },
    nucleus: { name: "النواة", hint: "تنظم نشاطات الخلية", info: "تسيطر وتنظم جميع نشاطات الخلية، وتحتوي على مادة وراثية تسمى DNA تحدد صفات المخلوق الحي.", draw: plantCell("nucleus") },
    vacuole: { name: "الفجوة", hint: "تشبه البالون", info: "تشبه البالون، وتعمل على تخزين الغذاء والماء، وتخزين الفضلات إلى حين التخلص منها.", draw: plantCell("vacuole") },
    mito: { name: "الميتوكندريا", hint: "إنتاج الطاقة", info: "تقوم بإنتاج الطاقة في الخلية عن طريق التنفس الخلوي.", draw: plantCell("mito") },
    chloro: { name: "البلاستيدات الخضراء", hint: "البناء الضوئي", info: "تساعد المخلوقات المنتجة على صنع غذائها بنفسها بواسطة عملية البناء الضوئي.", draw: plantCell("chloro") },
    nerve: { name: "الخلايا العصبية", hint: "طويلة كثيرة التفرعات", info: "تمتاز بطولها وكثرة تفرعاتها؛ مما يسمح لها باستقبال الرسائل وإرسالها بسرعة.", draw: nerve },
    bone: { name: "الخلية العظمية", hint: "كالسيوم وفسفور", info: "تحاط خلاياها بمواد صلبة مكونة من الكالسيوم والفسفور.", draw: bone },
    muscle: { name: "الخلايا العضلية", hint: "تنقبض وتنبسط", info: "تمتاز بطولها ووجود ألياف قادرة على الانقباض والانبساط.", draw: muscle },
    skin: { name: "الخلايا الجلدية", hint: "مسطحة ومتراصة", info: "مسطحة ومتراصة؛ لتشكل طبقة حماية للأعضاء الداخلية.", draw: skin },
    fat: { name: "الخلايا الدهنية", hint: "تخزن الدهن", info: "تخزن كميات كبيرة من الدهن؛ مما يؤدي إلى دفع النواة باتجاه الغشاء البلازمي.", draw: fat },
    cell: { name: "خلية", hint: "اللبنة الأساسية", info: "الخلايا أصغر لبنات الحياة في جميع المخلوقات الحية.", draw: orgCell },
    tissue: { name: "نسيج", hint: "خلايا متماثلة", info: "النسيج هو مجموعة من الخلايا المتماثلة التي تقوم بوظيفة محددة.", draw: orgTissue },
    organ: { name: "عضو", hint: "نسيجان أو أكثر", info: "العضو هو نسيجين أو أكثر يعملان معًا ليقوم بوظائف لا يقوم بها عضو غيره.", draw: orgOrgan },
    system: { name: "جهاز", hint: "أعضاء متآزرة", info: "الجهاز هو مجموعة من الأعضاء التي تتآزر للقيام بوظيفة واحدة.", draw: orgSystem },
  },
  rounds: [
    {
      name: "مكونات الخلية",
      say: "صفات ووظائف لأجزاء الخلية الرئيسية. أي جزء تصفه كل بطاقة؟",
      kind: "أي جزء من الخلية هذا؟",
      panels: ["membrane", "wall", "cyto", "nucleus"],
      cards: PARTS,
    },
    {
      name: "العضيات",
      say: "لكل عضية وظيفة معينة تقوم بها. اربطي كل وظيفة بعضيتها.",
      kind: "أي عضية تقوم بهذا؟",
      panels: ["vacuole", "mito", "chloro"],
      cards: ORGANELLES,
    },
    {
      name: "خلايا متخصصة",
      say: "تتنوع أحجام الخلايا وأشكالها حسب الوظيفة. أي خلية تصفها كل بطاقة؟",
      kind: "أي خلية متخصصة هذه؟",
      panels: ["nerve", "bone", "muscle", "skin", "fat"],
      cards: SPECIAL,
    },
    {
      name: "التحدي السريع: تنظيم الخلايا",
      say: "عشرة أسئلة عن مستويات التنظيم، ولكل سؤال ١٥ ثانية. الإجابة الأسرع تكسب نقاطًا إضافية.",
      kind: "خلية أم نسيج أم عضو أم جهاز؟",
      panels: ["cell", "tissue", "organ", "system"],
      cards: LEVELS,
      timed: 15,
    },
  ],
  ranks: ["عالِمة خلايا خبيرة", "مستكشفة ماهرة", "بداية جيدة، حاولي من جديد"],
  source: SRC + " (ص ١٨–٢١، ٥٠–٥١)",
}
