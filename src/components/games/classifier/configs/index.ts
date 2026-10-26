import type { ClassifierConfig } from "../types"
import { newton } from "./newton"
import { motion } from "./motion"
import { reactions } from "./reactions"
import { bonds } from "./bonds"
import { periodic } from "./periodic"
import { states } from "./states"
import { acids } from "./acids"
import { mixtures } from "./mixtures"
import { mendel } from "./mendel"
import { dna } from "./dna"
import { division } from "./division"
import { body } from "./body"
import { cells } from "./cells"
import { cycles } from "./cycles"
import { linnaeus } from "./linnaeus"
import { plates } from "./plates"

/** سجل ألعاب التصنيف: المفتاح هو قيمة config في بيانات اللعبة (games-data.ts) */
export const CLASSIFIER_CONFIGS: Record<string, ClassifierConfig> = {
  plates,
  newton,
  motion,
  reactions,
  bonds,
  periodic,
  states,
  acids,
  mixtures,
  mendel,
  dna,
  division,
  cells,
  body,
  linnaeus,
  cycles,
}
