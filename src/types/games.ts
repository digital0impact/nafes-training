// واجهات TypeScript للألعاب التعليمية

// ============================================
// واجهات عامة
// ============================================

/**
 * واجهة اللعبة التعليمية الأساسية
 */
export interface EducationalGame {
  game_id: string
  game_title: string
  chapter: string
  learning_outcome: string
  nafs_indicator: string
  game_type: GameType
  game_description: string
  difficulty: "easy" | "medium" | "hard"
  objective: string
  level: string
  difficulty_num: number
  remedial: boolean
  points: number
}

/**
 * أنواع الألعاب المتاحة
 */
export type GameType = 
  | "multiple_choice" 
  | "drag_drop" 
  | "ordering" 
  | "matching"
  | "scenario_choice"
  | "map_selection"
  | "interactive_circuit"
  | "atom_builder"
  | "periodic_family_comparison"

// ============================================
// واجهات لعبة الاختيار من متعدد (Multiple Choice)
// ============================================

/**
 * سؤال اختيار من متعدد
 */
export interface MultipleChoiceQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

/**
 * بيانات لعبة الاختيار من متعدد
 */
export interface MultipleChoiceGameData {
  type: "multiple_choice"
  question?: string // للأسئلة المفردة (legacy)
  options?: string[] // للأسئلة المفردة (legacy)
  correctAnswer?: string // للأسئلة المفردة (legacy)
  questions?: MultipleChoiceQuestion[] // للأسئلة المتعددة
}

// ============================================
// واجهات لعبة السحب والإفلات (Drag & Drop)
// ============================================

/**
 * عنصر قابل للسحب
 */
export interface DragDropItem {
  id: string
  text: string
  category: string
  position?: string // موضع العنصر (left, center, right, etc.)
}

/**
 * بنية صحيحة للجزيء (للعبة game_chem_006)
 */
export interface CorrectMoleculeStructure {
  molecule: string
  atoms: Array<{
    element: string
    position: string
  }>
}

/**
 * بيانات لعبة السحب والإفلات
 */
export interface DragDropGameData {
  type: "drag_drop"
  categories: string[]
  items: DragDropItem[]
  instruction?: string // تعليمات خاصة
  equation?: string // للمعادلات الكيميائية
  correctStructure?: CorrectMoleculeStructure // لبناء الجزيئات
}

// ============================================
// واجهات لعبة الترتيب (Ordering)
// ============================================

/**
 * عنصر قابل للترتيب
 */
export interface OrderingItem {
  id: string
  text: string
  correctOrder: number
  position?: string // موضع العنصر في المعادلة (legacy)
}

/**
 * بيانات لعبة الترتيب
 */
export interface OrderingGameData {
  type: "ordering"
  items: OrderingItem[]
  instruction?: string // تعليمات خاصة
  correctEquation?: string // للمعادلات الكيميائية
}

// ============================================
// واجهات لعبة المطابقة (Matching)
// ============================================

/**
 * زوج مطابقة
 */
export interface MatchingPair {
  id: string
  label: string
  target: string
}

/**
 * بيانات لعبة المطابقة
 */
export interface MatchingGameData {
  type: "matching"
  pairs: MatchingPair[]
}

// ============================================
// واجهات لعبة اختيار السيناريو (Scenario Choice)
// ============================================

/**
 * سيناريو مع خيارات
 */
export interface Scenario {
  id: string
  scenario: string
  choices: string[]
  correctAnswer: string
  explanation?: string
}

/**
 * بيانات لعبة اختيار السيناريو
 */
export interface ScenarioChoiceGameData {
  type: "scenario_choice"
  scenarios: Scenario[]
}

// ============================================
// واجهات لعبة اختيار الخريطة (Map Selection)
// ============================================

/**
 * منطقة قابلة للاختيار على الخريطة
 */
export interface MapRegion {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  isCorrect: boolean
}

/**
 * بيانات لعبة اختيار الخريطة
 */
export interface MapSelectionGameData {
  type: "map_selection"
  question: string
  regions: MapRegion[]
}

// ============================================
// واجهات لعبة الدائرة التفاعلية (Interactive Circuit)
// ============================================

/**
 * مكون في الدائرة الكهربائية
 */
export interface CircuitComponent {
  id: string
  type: "battery" | "switch" | "bulb" | "wire"
  position: { x: number; y: number }
  label?: string
  initialState?: boolean // للحالة الأولية (للمفاتيح)
}

/**
 * سيناريو دائرة تفاعلية
 */
export interface CircuitScenario {
  id: string
  question: string
  components: CircuitComponent[]
  correctState: Record<string, boolean> // حالة المفاتيح الصحيحة
  description?: string
}

/**
 * بيانات لعبة الدائرة التفاعلية
 */
export interface InteractiveCircuitGameData {
  type: "interactive_circuit"
  scenarios: CircuitScenario[]
  instruction?: string
}

// ============================================
// واجهات لعبة بناء الذرة (Atom Builder)
// ============================================

/**
 * سيناريو بناء ذرة
 */
export interface AtomScenario {
  id: string
  elementName: string
  elementSymbol: string
  atomicNumber: number
  totalElectrons: number
  correctDistribution: {
    K: number
    L: number
    M: number
    N: number
  }
  question?: string
  hint?: string
  // معلومات إضافية للتعلم
  period: number // الدورة = عدد مستويات الطاقة المشغولة
  group: number // المجموعة = عدد الإلكترونات في المستوى الخارجي
  learningFocus: string // التركيز التعليمي
}

/**
 * بيانات لعبة بناء الذرة
 */
export interface AtomBuilderGameData {
  type: "atom_builder"
  scenarios: AtomScenario[]
  instruction?: string
  energyLevelCapacities: {
    K: number
    L: number
    M: number
    N: number
  }
}

// ============================================
// واجهات لعبة مقارنة عناصر العائلة الواحدة (Periodic Family Comparison)
// ============================================

/**
 * عنصر في العائلة الكيميائية
 */
export interface PeriodicFamilyElement {
  id: string
  elementName: string
  elementSymbol: string
  atomicNumber: number
  period: number // الدورة
  group: number // المجموعة
  totalElectrons: number
  correctDistribution: {
    K: number
    L: number
    M: number
    N: number
  }
  // الخصائص الكيميائية للعنصر
  properties: {
    atomicRadius: number // نصف القطر الذري (بالبيكومتر)
    ionizationEnergy: number // طاقة التأين (بالكيلوجول/مول)
    reactivity: "عالية" | "متوسطة" | "منخفضة" // النشاط الكيميائي
  }
  // معلومات تعليمية
  description?: string
  hint?: string
}

/**
 * بيانات لعبة مقارنة عناصر العائلة الواحدة
 */
export interface PeriodicFamilyGameData {
  type: "periodic_family_comparison"
  familyName: string // اسم العائلة (مثل: الفلزات القلوية)
  familyDescription: string // وصف العائلة
  elements: PeriodicFamilyElement[] // عناصر العائلة
  instruction?: string
  energyLevelCapacities: {
    K: number
    L: number
    M: number
    N: number
  }
  // أسئلة المقارنة
  comparisonQuestions?: Array<{
    id: string
    question: string
    type: "trend" | "property" | "valence" // نوع السؤال
    correctAnswer: string
    explanation?: string
  }>
}

// ============================================
// واجهة موحدة لبيانات الألعاب
// ============================================

/**
 * بيانات أي لعبة (Union Type)
 */
export type GameData = 
  | MultipleChoiceGameData
  | DragDropGameData
  | OrderingGameData
  | MatchingGameData
  | ScenarioChoiceGameData
  | MapSelectionGameData
  | InteractiveCircuitGameData
  | AtomBuilderGameData
  | PeriodicFamilyGameData

// ============================================
// واجهات إضافية للبيانات المعقدة
// ============================================

/**
 * سيناريو إضافي للعبة السحب والإفلات (game_force_003)
 */
export interface AdditionalDragDropScenario {
  scenario: string
  answer: string
}

/**
 * بيانات لعبة السحب والإفلات مع سيناريوهات إضافية
 */
export interface DragDropWithScenarios extends DragDropGameData {
  scenario?: string
  additionalScenarios?: AdditionalDragDropScenario[]
}

// ============================================
// واجهات حالة اللعبة (Game State)
// ============================================

/**
 * حالة لعبة الترتيب
 */
export interface OrderingGameState {
  items: OrderingItem[]
  selectedOrder: string[]
  isComplete: boolean
}

/**
 * حالة لعبة الاختيار من متعدد
 */
export interface MultipleChoiceGameState {
  currentQuestionIndex: number
  selectedAnswers: Record<string, string>
  isComplete: boolean
}

/**
 * حالة لعبة المطابقة
 */
export interface MatchingGameState {
  pairs: MatchingPair[]
  selectedMatches: Record<string, string>
  selectedLabel: string | null
  isComplete: boolean
}

/**
 * حالة لعبة السحب والإفلات
 */
export interface DragDropGameState {
  items: DragDropItem[]
  categories: string[]
  itemCategories: Record<string, string>
  isComplete: boolean
}

/**
 * حالة لعبة اختيار السيناريو
 */
export interface ScenarioChoiceGameState {
  currentScenarioIndex: number
  scenarioAnswers: Record<string, string>
  isComplete: boolean
}

/**
 * حالة لعبة اختيار الخريطة
 */
export interface MapSelectionGameState {
  selectedRegions: Set<string>
  isComplete: boolean
}

/**
 * حالة لعبة الدائرة التفاعلية
 */
export interface InteractiveCircuitGameState {
  currentScenarioIndex: number
  circuitStates: Record<string, Record<string, boolean>> // scenarioId -> componentId -> state
  isComplete: boolean
}

/**
 * حالة لعبة بناء الذرة
 */
export interface AtomBuilderGameState {
  currentScenarioIndex: number
  electronDistributions: Record<string, { K: number; L: number; M: number; N: number }> // scenarioId -> distribution
  isComplete: boolean
}

/**
 * حالة لعبة مقارنة عناصر العائلة الواحدة
 */
export interface PeriodicFamilyGameState {
  currentElementIndex: number
  electronDistributions: Record<string, { K: number; L: number; M: number; N: number }> // elementId -> distribution
  comparisonAnswers: Record<string, string> // questionId -> answer
  isComplete: boolean
}

/**
 * حالة موحدة لأي لعبة
 */
export type GameState = 
  | OrderingGameState
  | MultipleChoiceGameState
  | MatchingGameState
  | DragDropGameState
  | ScenarioChoiceGameState
  | MapSelectionGameState
  | InteractiveCircuitGameState
  | AtomBuilderGameState
  | PeriodicFamilyGameState

// ============================================
// واجهات النتائج والملاحظات
// ============================================

/**
 * نتيجة محاولة لعبة
 */
export interface GameAttemptResult {
  gameId: string
  score: number
  maxScore: number
  percentage: number
  timeSpent: number // بالثواني
  answers: Record<string, any>
  correctAnswers: Record<string, any>
  feedback: string
  completedAt: Date
}

/**
 * ملاحظات على الإجابة
 */
export interface AnswerFeedback {
  isCorrect: boolean
  message: string
  explanation?: string
}

// ============================================
// Type Guards - للتحقق من نوع اللعبة
// ============================================

export function isMultipleChoiceGame(data: GameData): data is MultipleChoiceGameData {
  return data.type === "multiple_choice"
}

export function isDragDropGame(data: GameData): data is DragDropGameData {
  return data.type === "drag_drop"
}

export function isOrderingGame(data: GameData): data is OrderingGameData {
  return data.type === "ordering"
}

export function isMatchingGame(data: GameData): data is MatchingGameData {
  return data.type === "matching"
}

export function isScenarioChoiceGame(data: GameData): data is ScenarioChoiceGameData {
  return data.type === "scenario_choice"
}

export function isMapSelectionGame(data: GameData): data is MapSelectionGameData {
  return data.type === "map_selection"
}

export function isInteractiveCircuitGame(data: GameData): data is InteractiveCircuitGameData {
  return data.type === "interactive_circuit"
}

export function isAtomBuilderGame(data: GameData): data is AtomBuilderGameData {
  return data.type === "atom_builder"
}

export function isPeriodicFamilyGame(data: GameData): data is PeriodicFamilyGameData {
  return data.type === "periodic_family_comparison"
}

// ============================================
// Helper Types
// ============================================

/**
 * نوع البيانات حسب نوع اللعبة
 */
export type GameDataByType<T extends GameType> = 
  T extends "multiple_choice" ? MultipleChoiceGameData :
  T extends "drag_drop" ? DragDropGameData :
  T extends "ordering" ? OrderingGameData :
  T extends "matching" ? MatchingGameData :
  T extends "scenario_choice" ? ScenarioChoiceGameData :
  T extends "map_selection" ? MapSelectionGameData :
  T extends "interactive_circuit" ? InteractiveCircuitGameData :
  T extends "atom_builder" ? AtomBuilderGameData :
  T extends "periodic_family_comparison" ? PeriodicFamilyGameData :
  never

/**
 * نوع الحالة حسب نوع اللعبة
 */
export type GameStateByType<T extends GameType> = 
  T extends "multiple_choice" ? MultipleChoiceGameState :
  T extends "drag_drop" ? DragDropGameState :
  T extends "ordering" ? OrderingGameState :
  T extends "matching" ? MatchingGameState :
  T extends "scenario_choice" ? ScenarioChoiceGameState :
  T extends "map_selection" ? MapSelectionGameState :
  T extends "interactive_circuit" ? InteractiveCircuitGameState :
  T extends "atom_builder" ? AtomBuilderGameState :
  T extends "periodic_family_comparison" ? PeriodicFamilyGameState :
  never
