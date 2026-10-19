import type { ClassifierConfig } from "../types"
import { body } from "./body"
import { cells } from "./cells"
import { linnaeus } from "./linnaeus"
import { plates } from "./plates"

/** سجل ألعاب التصنيف: المفتاح هو قيمة config في بيانات اللعبة (games-data.ts) */
export const CLASSIFIER_CONFIGS: Record<string, ClassifierConfig> = {
  plates,
  cells,
  body,
  linnaeus,
}
