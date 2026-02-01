// واجهات TypeScript لمكونات الألعاب التعليمية

import type { 
  GameData, 
  GameType,
  MultipleChoiceGameData,
  DragDropGameData,
  OrderingGameData,
  MatchingGameData,
  ScenarioChoiceGameData,
  MapSelectionGameData,
  InteractiveCircuitGameData,
  AtomBuilderGameData,
  PeriodicFamilyGameData,
  GameState,
  OrderingGameState,
  MultipleChoiceGameState,
  MatchingGameState,
  DragDropGameState,
  ScenarioChoiceGameState,
  MapSelectionGameState,
  InteractiveCircuitGameState,
  AtomBuilderGameState,
  PeriodicFamilyGameState
} from "./games"

// ============================================
// Props للمكونات العامة
// ============================================

/**
 * Props الأساسية لأي مكون لعبة
 */
export interface BaseGameComponentProps {
  gameData: GameData
  onAnswerChange?: (answer: any) => void
  onComplete?: (isComplete: boolean) => void
  disabled?: boolean
  showFeedback?: boolean
}

// ============================================
// Props لمكونات محددة
// ============================================

/**
 * Props لمكون الاختيار من متعدد
 */
export interface MultipleChoiceComponentProps extends BaseGameComponentProps {
  gameData: MultipleChoiceGameData
  selectedAnswer?: string
  currentQuestionIndex?: number
  onAnswerSelect?: (questionId: string, answer: string) => void
}

/**
 * Props لمكون السحب والإفلات
 */
export interface DragDropComponentProps extends BaseGameComponentProps {
  gameData: DragDropGameData
  itemCategories?: Record<string, string>
  onItemDrop?: (itemId: string, category: string) => void
  onItemDragStart?: (itemId: string) => void
  onItemDragEnd?: (itemId: string) => void
}

/**
 * Props لمكون الترتيب
 */
export interface OrderingComponentProps extends BaseGameComponentProps {
  gameData: OrderingGameData
  selectedOrder?: string[]
  onItemMove?: (itemId: string, newIndex: number) => void
  onItemReorder?: (items: string[]) => void
}

/**
 * Props لمكون المطابقة
 */
export interface MatchingComponentProps extends BaseGameComponentProps {
  gameData: MatchingGameData
  selectedMatches?: Record<string, string>
  selectedLabel?: string | null
  onLabelSelect?: (labelId: string) => void
  onTargetSelect?: (labelId: string, targetId: string) => void
  onMatchClear?: (labelId: string) => void
}

/**
 * Props لمكون اختيار السيناريو
 */
export interface ScenarioChoiceComponentProps extends BaseGameComponentProps {
  gameData: ScenarioChoiceGameData
  currentScenarioIndex?: number
  scenarioAnswers?: Record<string, string>
  onScenarioAnswer?: (scenarioId: string, answer: string) => void
  onNextScenario?: () => void
  onPreviousScenario?: () => void
}

/**
 * Props لمكون اختيار الخريطة
 */
export interface MapSelectionComponentProps extends BaseGameComponentProps {
  gameData: MapSelectionGameData
  selectedRegions?: Set<string>
  onRegionSelect?: (regionId: string) => void
  onRegionDeselect?: (regionId: string) => void
  mapImageUrl?: string
}

/**
 * Props لمكون الدائرة التفاعلية
 */
export interface InteractiveCircuitComponentProps extends BaseGameComponentProps {
  gameData: InteractiveCircuitGameData
  currentScenarioIndex?: number
  circuitStates?: Record<string, Record<string, boolean>>
  onStateChange?: (scenarioId: string, componentId: string, state: boolean) => void
  onNextScenario?: () => void
  onPreviousScenario?: () => void
}

/**
 * Props لمكون مقارنة عناصر العائلة الواحدة
 */
export interface PeriodicFamilyComponentProps extends BaseGameComponentProps {
  gameData: PeriodicFamilyGameData
  currentElementIndex?: number
  electronDistributions?: Record<string, { K: number; L: number; M: number; N: number }>
  onDistributionChange?: (elementId: string, level: "K" | "L" | "M" | "N", delta: number) => void
  comparisonAnswers?: Record<string, string>
  onComparisonAnswer?: (questionId: string, answer: string) => void
}

// ============================================
// Props لمكونات الحالة (State Components)
// ============================================

/**
 * Props لمكون إدارة حالة اللعبة
 */
export interface GameStateManagerProps<T extends GameType = GameType> {
  gameId: string
  gameType: T
  gameData: GameData
  initialState?: GameState
  onStateChange?: (state: GameState) => void
  onComplete?: (state: GameState, score: number) => void
  autoSave?: boolean
  saveInterval?: number // بالمللي ثانية
}

// ============================================
// Props لمكونات التحقق من الإجابات
// ============================================

/**
 * Props لمكون التحقق من الإجابة
 */
export interface AnswerValidatorProps {
  gameData: GameData
  userAnswer: any
  onValidationComplete?: (isCorrect: boolean, feedback: string) => void
}

/**
 * نتيجة التحقق من الإجابة
 */
export interface ValidationResult {
  isCorrect: boolean
  score: number
  maxScore: number
  feedback: string
  explanation?: string
  correctAnswer?: any
  userAnswer?: any
}

// ============================================
// Props لمكونات العرض (Display Components)
// ============================================

/**
 * Props لمكون عرض اللعبة
 */
export interface GameDisplayProps {
  gameId: string
  gameTitle: string
  gameDescription: string
  gameData: GameData
  gameState?: GameState
  onGameStart?: () => void
  onGameEnd?: (result: ValidationResult) => void
  showInstructions?: boolean
  showProgress?: boolean
  currentProgress?: number
  totalProgress?: number
}

/**
 * Props لمكون عرض النتيجة
 */
export interface GameResultDisplayProps {
  gameId: string
  gameTitle: string
  score: number
  maxScore: number
  percentage: number
  timeSpent: number
  feedback: string
  correctAnswers?: any
  userAnswers?: any
  onRetry?: () => void
  onNext?: () => void
  showDetails?: boolean
}

/**
 * Props لمكون عرض التقدم
 */
export interface GameProgressProps {
  current: number
  total: number
  showPercentage?: boolean
  showLabel?: boolean
  label?: string
}

// ============================================
// Props لمكونات التفاعل (Interaction Components)
// ============================================

/**
 * Props لمكون زر الإجابة
 */
export interface SubmitButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  label?: string
  variant?: "primary" | "secondary" | "success" | "danger"
}

/**
 * Props لمكون زر الإعادة
 */
export interface ResetButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

/**
 * Props لمكون عرض الملاحظات
 */
export interface FeedbackDisplayProps {
  message: string
  type?: "success" | "error" | "warning" | "info"
  showIcon?: boolean
  autoHide?: boolean
  hideDelay?: number
  onHide?: () => void
}

// ============================================
// Props لمكونات خاصة بالأنواع المحددة
// ============================================

/**
 * Props لمكون عرض المعادلة الكيميائية (للعبة game_react_001)
 */
export interface ChemicalEquationDisplayProps {
  equation: string
  coefficients?: string[]
  showBalanced?: boolean
  onCoefficientChange?: (position: string, value: string) => void
}

/**
 * Props لمكون بناء الجزيء (للعبة game_chem_006)
 */
export interface MoleculeBuilderProps {
  molecule: string
  atoms: Array<{ element: string; position: string }>
  onAtomPlace?: (element: string, position: string) => void
  onAtomRemove?: (position: string) => void
  correctStructure?: {
    molecule: string
    atoms: Array<{ element: string; position: string }>
  }
}

/**
 * Props لمكون عرض السيناريو (للعبة game_force_003)
 */
export interface ScenarioDisplayProps {
  scenario: string
  onAnswerSelect?: (answer: string) => void
  selectedAnswer?: string
}

// ============================================
// Type Guards للمكونات
// ============================================

export function isMultipleChoiceProps(
  props: BaseGameComponentProps
): props is MultipleChoiceComponentProps {
  return props.gameData.type === "multiple_choice"
}

export function isDragDropProps(
  props: BaseGameComponentProps
): props is DragDropComponentProps {
  return props.gameData.type === "drag_drop"
}

export function isOrderingProps(
  props: BaseGameComponentProps
): props is OrderingComponentProps {
  return props.gameData.type === "ordering"
}

export function isMatchingProps(
  props: BaseGameComponentProps
): props is MatchingComponentProps {
  return props.gameData.type === "matching"
}

export function isScenarioChoiceProps(
  props: BaseGameComponentProps
): props is ScenarioChoiceComponentProps {
  return props.gameData.type === "scenario_choice"
}

export function isMapSelectionProps(
  props: BaseGameComponentProps
): props is MapSelectionComponentProps {
  return props.gameData.type === "map_selection"
}

export function isInteractiveCircuitProps(
  props: BaseGameComponentProps
): props is InteractiveCircuitComponentProps {
  return props.gameData.type === "interactive_circuit"
}

export function isPeriodicFamilyProps(
  props: BaseGameComponentProps
): props is PeriodicFamilyComponentProps {
  return props.gameData.type === "periodic_family_comparison"
}

// ============================================
// Helper Types
// ============================================

/**
 * نوع Props حسب نوع اللعبة
 */
export type ComponentPropsByGameType<T extends GameType> = 
  T extends "multiple_choice" ? MultipleChoiceComponentProps :
  T extends "drag_drop" ? DragDropComponentProps :
  T extends "ordering" ? OrderingComponentProps :
  T extends "matching" ? MatchingComponentProps :
  T extends "scenario_choice" ? ScenarioChoiceComponentProps :
  T extends "map_selection" ? MapSelectionComponentProps :
  T extends "interactive_circuit" ? InteractiveCircuitComponentProps :
  T extends "atom_builder" ? never : // AtomBuilder uses different props structure
  T extends "periodic_family_comparison" ? PeriodicFamilyComponentProps :
  never
