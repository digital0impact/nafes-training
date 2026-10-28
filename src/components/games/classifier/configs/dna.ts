/**
 * شيفرة الوراثة – ناتج التعلم: مادة الوراثة.
 * المحتوى مأخوذ من: ملخص التفوق، العلوم، الصف الثالث المتوسط، الفصل الدراسي الأول،
 * الفصل الرابع «الوراثة»، درس «مادة الوراثة DNA» (صفحات الملخص ٣٤–٣٧).
 */
import { bg, motes } from "../kit"
import type { CardDef, ClassifierConfig, Draw, G } from "../types"

const BASE: Record<string, string> = { A: "#ff6b6b", T: "#ffd43b", G: "#51cf66", C: "#4dabf7", U: "#f783ac" }
const SEQ = "ATGCGTACCGATTGCA"

function helix(g: G, ph: number, opts: { hi?: number; unzip?: number; mutate?: number } = {}) {
  const n = SEQ.length
  for (let i = 0; i < n; i++) {
    const x = 20 + i * 17
    const a = i * 0.55 + ph * 1.4
    const y1 = 100 + Math.sin(a) * 40
    const y2 = 100 - Math.sin(a) * 40
    const open = opts.unzip !== undefined && i < opts.unzip
    const b = SEQ[i]
    const pair = ({ A: "T", T: "A", G: "C", C: "G" } as Record<string, string>)[b]
    const hi = opts.hi !== undefined && Math.abs(i - opts.hi) <= 2
    g.globalAlpha = opts.hi === undefined || hi ? 1 : 0.4
    if (!open) {
      g.strokeStyle = BASE[b]
      g.lineWidth = 4
      g.beginPath()
      g.moveTo(x, y1)
      g.lineTo(x, 100)
      g.stroke()
      g.strokeStyle = opts.mutate === i && Math.sin(ph * 6) > 0 ? "#fff" : BASE[pair]
      g.beginPath()
      g.moveTo(x, 100)
      g.lineTo(x, y2)
      g.stroke()
    }
    const dy = open ? 18 : 0
    g.fillStyle = "#e9ecef"
    g.beginPath()
    g.arc(x, y1 - Math.sign(y1 - 100 || 1) * 0 - dy, 3.5, 0, 7)
    g.fill()
    g.beginPath()
    g.arc(x, y2 + dy, 3.5, 0, 7)
    g.fill()
  }
  g.globalAlpha = 1
}

const dnaPanel: Draw = (g, ph) => {
  bg(g, "#13283f", "#0a1626")
  motes(g, ph, "#a5d8ff", 6)
  helix(g, ph)
}

const rnaPanel: Draw = (g, ph) => {
  bg(g, "#3b1430", "#1c0817")
  motes(g, ph, "#fcc2d7", 6)
  const s = "AUGCGUACCGAUUGCA"
  for (let i = 0; i < s.length; i++) {
    const x = 20 + i * 17
    const y = 100 + Math.sin(i * 0.55 + ph * 1.4) * 30
    g.strokeStyle = BASE[s[i]]
    g.lineWidth = 4
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x, y + 22)
    g.stroke()
    g.fillStyle = "#e9ecef"
    g.beginPath()
    g.arc(x, y, 3.5, 0, 7)
    g.fill()
  }
}

function basePanel(b: string, pair: string): Draw {
  return (g, ph) => {
    bg(g, "#1b1d2e", "#0d0e18")
    const sep = 6 + 6 * ((Math.sin(ph * 2) + 1) / 2)
    for (const [k, s] of [[b, -1], [pair, 1]] as [string, number][]) {
      const x = 150 + s * (40 + sep)
      g.fillStyle = BASE[k]
      g.globalAlpha = k === b ? 1 : 0.45
      g.beginPath()
      g.roundRect(x - 34, 60, 68, 80, 14)
      g.fill()
      g.globalAlpha = 1
      g.fillStyle = "#0d0e18"
      g.font = "bold 38px sans-serif"
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText(k, x, 102)
    }
    g.strokeStyle = "rgba(255,255,255,.6)"
    g.lineWidth = 2
    g.setLineDash([4, 4])
    g.beginPath()
    g.moveTo(150 - sep - 6, 100)
    g.lineTo(150 + sep + 6, 100)
    g.stroke()
    g.setLineDash([])
  }
}

const genePanel: Draw = (g, ph) => {
  bg(g, "#13283f", "#0a1626")
  helix(g, ph * 0.5, { hi: 8 })
  g.strokeStyle = "#ffe27a"
  g.lineWidth = 2
  g.beginPath()
  g.roundRect(20 + 6 * 17 - 8, 40, 5 * 17 + 16, 120, 10)
  g.stroke()
}

const mutationPanel: Draw = (g, ph) => {
  bg(g, "#3b1d0d", "#1a0c05")
  helix(g, ph * 0.5, { mutate: 7 })
  const x = 20 + 7 * 17
  g.strokeStyle = "rgba(255,255,255," + (0.4 + 0.4 * Math.sin(ph * 6)) + ")"
  g.lineWidth = 2
  g.beginPath()
  g.arc(x, 100, 18, 0, 7)
  g.stroke()
}

const replicationPanel: Draw = (g, ph) => {
  bg(g, "#0f2e2a", "#071816")
  const u = Math.floor(((ph * 2) % 18))
  helix(g, 0.3, { unzip: u })
}

const proteinPanel: Draw = (g, ph) => {
  bg(g, "#2e2416", "#140f08")
  // ريبوسوم يتحرك على RNA الرسول وتتكون سلسلة أحماض أمينية
  g.strokeStyle = BASE.U
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(10, 140)
  g.lineTo(290, 140)
  g.stroke()
  const x = 60 + ((ph * 20) % 180)
  g.fillStyle = "#adb5bd"
  g.beginPath()
  g.ellipse(x, 130, 26, 18, 0, 0, 7)
  g.fill()
  g.beginPath()
  g.ellipse(x, 152, 20, 10, 0, 0, 7)
  g.fill()
  const n = Math.floor((x - 40) / 18)
  const cols = ["#ff922b", "#51cf66", "#4dabf7", "#f06595", "#ffd43b"]
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[i % 5]
    g.beginPath()
    g.arc(x - 6 - i * 3, 104 - i * 9 + Math.sin(i + ph) * 2, 6, 0, 7)
    g.fill()
  }
}

const NUCLEIC: CardDef[] = [
  ["dna", "يتكون من سلسلتين", "DNA يتركب من سلسلتين، كل سلسلة تتركب من نيوكليدات."],
  ["dna", "الحلزون المزدوج", "بنى واطسون وكريك نموذجًا لـ DNA عبارة عن خيطين طويلين ملتفين حول بعضهما بطريقة لولبية متوازية أسموه بالحلزون المزدوج."],
  ["dna", "سكر خماسي الكربون منقوص الأكسجين", "كل نيوكليد في DNA مكون من سكر خماسي الكربون منقوص الأكسجين، ومجموعة فوسفات، وقاعدة نيتروجينية."],
  ["dna", "يوجد بشكل ثابت ويمثل المادة الوراثية", "DNA يوجد في النواة بشكل ثابت ويمثل المادة الوراثية، وله نوع واحد."],
  ["dna", "يحتوي على قاعدة الثايمين", "قواعد DNA أربع: الأدنين والجوانين والسايتوسين والثايمين."],
  ["rna", "يتكون من سلسلة واحدة فقط", "RNA يتركب من سلسلة واحدة فقط."],
  ["rna", "يُستبدل فيه الثايمين باليوراسيل", "RNA الحمض النووي الرايبوزي يصنع داخل النواة وتستبدل فيه القاعدة النيتروجينية الثايمين باليوراسيل."],
  ["rna", "يصنع في النواة وينتقل إلى السيتوبلازم", "RNA يصنع في النواة وينتقل إلى السيتوبلازم."],
  ["rna", "يهدم ويعاد بناؤه باستمرار، وله ثلاثة أنواع", "RNA يهدم ويعاد بناؤه باستمرار، وله ثلاثة أنواع، ويقوم بترجمة ونقل وصنع البروتينات."],
]

const BASES: CardDef[] = [
  ["A", "يرتبط دائمًا مع الثايمين", "افترض العلماء أن القواعد تكون على شكل أزواج مرتبطة حيث يرتبط الأدنين دائمًا مع الثايمين."],
  ["A", "كمية الثايمين تساوي كميتها", "لاحظ العلماء أن كمية الثايمين = كمية الأدنين."],
  ["T", "يرتبط دائمًا مع الأدنين", "يرتبط الأدنين دائمًا مع الثايمين."],
  ["T", "يحل محلها اليوراسيل في RNA", "في RNA تستبدل القاعدة النيتروجينية الثايمين باليوراسيل."],
  ["G", "يرتبط مع السايتوسين", "يرتبط الجوانين مع السايتوسين."],
  ["G", "كمية السايتوسين تساوي كميتها", "لاحظ العلماء أن كمية السايتوسين = كمية الجوانين."],
  ["C", "يرتبط مع الجوانين", "يرتبط الجوانين مع السايتوسين."],
  ["C", "كمية الجوانين تساوي كميتها", "لاحظ العلماء أن كمية السايتوسين = كمية الجوانين."],
]

const CONCEPTS: CardDef[] = [
  ["gene", "جزء من DNA مسؤول عن تصنيع بروتين ما", "الجين جزء من DNA مسؤول عن تصنيع بروتين ما."],
  ["gene", "يحتوي كل كروموسوم على المئات منها", "كل كروموسوم يحتوي على المئات من الجينات."],
  ["gene", "يعمل على ترتيب الأحماض الأمينية في البروتين", "يتكون البروتين من سلسلة من الأحماض الأمينية يعمل الجين على ترتيبها، فلو تغير الترتيب لتغير البروتين المتكون."],
  ["mut", "تغير دائم في سلسلة DNA نتيجة انحراف في نسخ DNA", "الطفرة تغير دائم في سلسلة DNA المكون للكروموسوم نتيجة انحراف في نسخ DNA، مما ينتج عنه تصنيع بروتينات غير متطابقة."],
  ["mut", "من أسبابها الأشعة السينية وقطران السجائر", "من أسباب الطفرة: الأشعة السينية، ضوء الشمس، المواد الكيميائية كصبغات الشعر، قطران السجائر."],
  ["mut", "إذا حدثت في الخلايا الجنسية يتأثر بها المخلوق الحي", "إذا حدثت الطفرة في الخلايا الجسدية فإن المخلوق الحي لا يتأثر بها، وإذا حدثت في الخلايا الجنسية فإنه يتأثر بها."],
  ["rep", "تتم في الطور البيني", "عملية نسخ DNA تتم في الطور البيني."],
  ["rep", "تنفصل السلسلتان إحداهما عن الأخرى بواسطة إنزيم فصل", "في نسخ DNA تنفصل السلسلتان إحداهما عن الأخرى بواسطة إنزيم فصل."],
  ["rep", "تتشكل سلسلة جديدة مكملة لكل سلسلة أصلية", "تتشكل سلسلة جديدة لكل منهما بحيث تكون مكملة للسلسلتين الأصليتين عبر اصطفاف القواعد النيتروجينية."],
  ["prot", "تتم في الريبوسومات الموجودة في السيتوبلازم", "تصنيع البروتينات يتم في الريبوسومات الموجودة في السيتوبلازم."],
  ["prot", "تسلسل كل ثلاث قواعد يشكل كلمة تحدد حمضًا أمينيًا", "تسلسل كل ثلاث قواعد يشكل كلمة تحدد حمضًا أمينيًا واحدًا في البروتين."],
  ["prot", "ينقل RNA الشفرة من النواة إلى الريبوسومات", "تنقل شفرة التصنيع عبر RNA الرسول إلى الريبوسومات، وهناك تتم عملية الترجمة."],
]

export const dna: ClassifierConfig = {
  title: ["شيفرة", "الوراثة"],
  intro: {
    big: "افكّي شيفرة المادة الوراثية",
    say: "DNA هو الحمض النووي الرايبوزي منقوص الأكسجين الذي يحمل المادة الوراثية. اختاري اللوحة التي تصفها كل بطاقة. اضغطي على أي لوحة لتتعرّفي عليها قبل البدء.",
  },
  panels: {
    dna: { name: "DNA", hint: "سلسلتان", info: "الحمض النووي الرايبوزي منقوص الأكسجين الذي يحمل المادة الوراثية، ويتركب من سلسلتين.", draw: dnaPanel },
    rna: { name: "RNA", hint: "سلسلة واحدة", info: "الحمض النووي الرايبوزي، يصنع داخل النواة وتستبدل فيه القاعدة النيتروجينية الثايمين باليوراسيل.", draw: rnaPanel },
    A: { name: "الأدنين (A)", hint: "قاعدة نيتروجينية", info: "يرتبط الأدنين دائمًا مع الثايمين.", draw: basePanel("A", "T") },
    T: { name: "الثايمين (T)", hint: "قاعدة نيتروجينية", info: "يرتبط الثايمين مع الأدنين، ويستبدل باليوراسيل في RNA.", draw: basePanel("T", "A") },
    G: { name: "الجوانين (G)", hint: "قاعدة نيتروجينية", info: "يرتبط الجوانين مع السايتوسين.", draw: basePanel("G", "C") },
    C: { name: "السايتوسين (C)", hint: "قاعدة نيتروجينية", info: "يرتبط السايتوسين مع الجوانين.", draw: basePanel("C", "G") },
    gene: { name: "الجين", hint: "جزء من DNA", info: "الجين جزء من DNA مسؤول عن تصنيع بروتين ما.", draw: genePanel },
    mut: { name: "الطفرة", hint: "تغير دائم", info: "تغير دائم في سلسلة DNA المكون للكروموسوم نتيجة انحراف في نسخ DNA.", draw: mutationPanel },
    rep: { name: "نسخ DNA (التضاعف)", hint: "في الطور البيني", info: "تنفصل السلسلتان بواسطة إنزيم فصل، وتتشكل لكل منهما سلسلة جديدة مكملة.", draw: replicationPanel },
    prot: { name: "تصنيع البروتين", hint: "في الريبوسومات", info: "يتم في الريبوسومات الموجودة في السيتوبلازم، ويبدأ بتكوين RNA من DNA في النواة.", draw: proteinPanel },
  },
  rounds: [
    {
      name: "DNA أم RNA؟",
      say: "قارني بين الحمضين النوويين من حيث التركيب والمكان والوظيفة.",
      kind: "DNA أم RNA؟",
      panels: ["dna", "rna"],
      cards: NUCLEIC,
    },
    {
      name: "أزواج القواعد",
      say: "يرتبط الأدنين دائمًا مع الثايمين، والجوانين مع السايتوسين. أي قاعدة تصفها كل بطاقة؟",
      kind: "أي قاعدة نيتروجينية هذه؟",
      panels: ["A", "T", "G", "C"],
      cards: BASES,
    },
    {
      name: "من الجين إلى البروتين",
      say: "الجين والطفرة ونسخ DNA وتصنيع البروتين. أيها تصف كل بطاقة؟",
      kind: "عمّ تتحدث هذه البطاقة؟",
      panels: ["gene", "mut", "rep", "prot"],
      cards: CONCEPTS,
    },
    {
      name: "التحدي السريع",
      say: "عشرة أسئلة: DNA أم RNA؟ ولكل سؤال ١٥ ثانية. الإجابة الأسرع تكسب نقاطًا إضافية.",
      kind: "DNA أم RNA؟",
      panels: ["dna", "rna"],
      cards: NUCLEIC,
      timed: 15,
    },
  ],
  ranks: ["عالِمة وراثة خبيرة", "مستكشفة ماهرة", "بداية جيدة، حاولي من جديد"],
  source: "ملخص التفوق، الصف الثالث المتوسط، الفصل الدراسي الأول، درس «مادة الوراثة DNA» (ص ٣٤–٣٧)",
}
