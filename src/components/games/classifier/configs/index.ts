import type { ClassifierConfig } from "../types"
import { balance } from "./balance"
import { ecosystem } from "./ecosystem"
import { lifecycle } from "./lifecycle"
import { membrane } from "./membrane"
import { light } from "./light"
import { sound } from "./sound"
import { heat } from "./heat"
import { energy } from "./energy"
import { magnets } from "./magnets"
import { circuits } from "./circuits"
import { atoms } from "./atoms"
import { resources } from "./resources"
import { planet } from "./planet"
import { space } from "./space"
import { orbits } from "./orbits"
import { rocks } from "./rocks"
import { quakes } from "./quakes"
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
  balance,
  ecosystem,
  lifecycle,
  membrane,
  light,
  sound,
  heat,
  energy,
  magnets,
  circuits,
  atoms,
  resources,
  planet,
  space,
  orbits,
  rocks,
  quakes,
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
