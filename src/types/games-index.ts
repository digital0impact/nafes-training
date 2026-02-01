// ملف تصدير موحد لجميع واجهات الألعاب التعليمية

// ============================================
// تصدير واجهات البيانات الأساسية
// ============================================
export type {
  // واجهات عامة
  EducationalGame,
  GameType,
  GameData,
  
  // واجهات لعبة الاختيار من متعدد
  MultipleChoiceQuestion,
  MultipleChoiceGameData,
  
  // واجهات لعبة السحب والإفلات
  DragDropItem,
  DragDropGameData,
  CorrectMoleculeStructure,
  
  // واجهات لعبة الترتيب
  OrderingItem,
  OrderingGameData,
  
  // واجهات لعبة المطابقة
  MatchingPair,
  MatchingGameData,
  
  // واجهات لعبة اختيار السيناريو
  Scenario,
  ScenarioChoiceGameData,
  
  // واجهات لعبة اختيار الخريطة
  MapRegion,
  MapSelectionGameData,
  
  // واجهات لعبة الدائرة التفاعلية
  CircuitComponent,
  CircuitScenario,
  InteractiveCircuitGameData,
  
  // واجهات الحالة
  GameState,
  OrderingGameState,
  MultipleChoiceGameState,
  MatchingGameState,
  DragDropGameState,
  ScenarioChoiceGameState,
  MapSelectionGameState,
  InteractiveCircuitGameState,
  
  // واجهات النتائج
  GameAttemptResult,
  AnswerFeedback,
  
  // Helper Types
  GameDataByType,
  GameStateByType
} from "./games"

// ============================================
// تصدير Type Guards
// ============================================
export {
  isMultipleChoiceGame,
  isDragDropGame,
  isOrderingGame,
  isMatchingGame,
  isScenarioChoiceGame,
  isMapSelectionGame,
  isInteractiveCircuitGame
} from "./games"

// ============================================
// تصدير واجهات المكونات
// ============================================
export type {
  // Props الأساسية
  BaseGameComponentProps,
  
  // Props للمكونات المحددة
  MultipleChoiceComponentProps,
  DragDropComponentProps,
  OrderingComponentProps,
  MatchingComponentProps,
  ScenarioChoiceComponentProps,
  MapSelectionComponentProps,
  InteractiveCircuitComponentProps,
  
  // Props لمكونات الحالة
  GameStateManagerProps,
  
  // Props لمكونات التحقق
  AnswerValidatorProps,
  ValidationResult,
  
  // Props لمكونات العرض
  GameDisplayProps,
  GameResultDisplayProps,
  GameProgressProps,
  
  // Props لمكونات التفاعل
  SubmitButtonProps,
  ResetButtonProps,
  FeedbackDisplayProps,
  
  // Props للمكونات الخاصة
  ChemicalEquationDisplayProps,
  MoleculeBuilderProps,
  ScenarioDisplayProps,
  
  // Helper Types
  ComponentPropsByGameType
} from "./game-components"

// ============================================
// تصدير Type Guards للمكونات
// ============================================
export {
  isMultipleChoiceProps,
  isDragDropProps,
  isOrderingProps,
  isMatchingProps,
  isScenarioChoiceProps,
  isMapSelectionProps,
  isInteractiveCircuitProps
} from "./game-components"
