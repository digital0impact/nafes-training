/**
 * أنواع محرّك ألعاب التصنيف (ClassifierGame).
 * كل لعبة = مجموعة لوحات متحركة (فئات) + بطاقات تُصنَّف إلى تلك اللوحات على عدة جولات.
 */

export type G = CanvasRenderingContext2D

/** دالة رسم لوحة على مساحة منطقية 300×200؛ ph زمن متراكم بالثواني يحرّك الرسم */
export type Draw = (g: G, ph: number) => void

export type PanelDef = {
  /** اسم الفئة الظاهر تحت اللوحة */
  name: string
  /** سطر قصير يصف اللوحة */
  hint: string
  /** شرح يظهر عند الضغط على اللوحة قبل بدء اللعب */
  info: string
  draw: Draw
  /** تهتز اللوحة عند الإجابة (مثل الزلازل) */
  shake?: boolean
}

/** [معرّف اللوحة الصحيحة، نص البطاقة، التفسير العلمي] */
export type CardDef = [panel: string, text: string, exp: string]

export type RoundDef = {
  name: string
  /** وصف الجولة قبل بدئها */
  say: string
  /** السؤال الظاهر فوق كل بطاقة */
  kind: string
  /** معرّفات اللوحات المعروضة في هذه الجولة بالترتيب */
  panels: string[]
  cards: CardDef[]
  /** عدد الثواني لكل سؤال؛ وجوده يجعل الجولة تحدّيًا سريعًا بعشر بطاقات عشوائية */
  timed?: number
}

export type ClassifierConfig = {
  /** جزءا العنوان: الأول بلون مميز والثاني بلون النص */
  title: [string, string]
  intro: { big: string; say: string }
  panels: Record<string, PanelDef>
  rounds: RoundDef[]
  /** ألقاب النهاية: ثلاث نجوم، نجمتان، نجمة */
  ranks: [string, string, string]
}
