# واجهات TypeScript للألعاب التعليمية

هذا الملف يوثق واجهات TypeScript المستخدمة في نظام الألعاب التعليمية.

## البنية

### 1. `games.ts` - واجهات البيانات الأساسية
يحتوي على جميع واجهات البيانات للألعاب التعليمية.

### 2. `game-components.ts` - واجهات المكونات
يحتوي على واجهات Props للمكونات React المستخدمة في عرض الألعاب.

### 3. `games-index.ts` - ملف التصدير الموحد
يصدّر جميع الواجهات من مكان واحد لسهولة الاستيراد.

## الاستخدام

### استيراد الواجهات

```typescript
// استيراد جميع الواجهات من ملف واحد
import type {
  EducationalGame,
  GameData,
  MultipleChoiceGameData,
  DragDropGameData,
  // ... إلخ
} from "@/types/games-index"

// أو استيراد من ملفات محددة
import type { GameData } from "@/types/games"
import type { MultipleChoiceComponentProps } from "@/types/game-components"
```

### استخدام الواجهات في المكونات

```typescript
import type { MultipleChoiceComponentProps } from "@/types/game-components"

function MultipleChoiceGame({ gameData, onAnswerSelect }: MultipleChoiceComponentProps) {
  // استخدام gameData مع type safety كامل
  if (gameData.type === "multiple_choice") {
    const questions = gameData.questions || []
    // ...
  }
}
```

### استخدام Type Guards

```typescript
import { isMultipleChoiceGame, isDragDropGame } from "@/types/games-index"

function GameRenderer({ gameData }: { gameData: GameData }) {
  if (isMultipleChoiceGame(gameData)) {
    // TypeScript يعرف الآن أن gameData هو MultipleChoiceGameData
    return <MultipleChoiceComponent gameData={gameData} />
  }
  
  if (isDragDropGame(gameData)) {
    // TypeScript يعرف الآن أن gameData هو DragDropGameData
    return <DragDropComponent gameData={gameData} />
  }
  
  // ...
}
```

## أنواع الألعاب المدعومة

### 1. Multiple Choice (اختيار من متعدد)
```typescript
const gameData: MultipleChoiceGameData = {
  type: "multiple_choice",
  questions: [
    {
      id: "1",
      question: "السؤال هنا؟",
      options: ["خيار 1", "خيار 2", "خيار 3"],
      correctAnswer: "خيار 1"
    }
  ]
}
```

### 2. Drag & Drop (سحب وإفلات)
```typescript
const gameData: DragDropGameData = {
  type: "drag_drop",
  categories: ["فئة 1", "فئة 2"],
  items: [
    { id: "1", text: "عنصر 1", category: "فئة 1" },
    { id: "2", text: "عنصر 2", category: "فئة 2" }
  ]
}
```

### 3. Ordering (ترتيب)
```typescript
const gameData: OrderingGameData = {
  type: "ordering",
  items: [
    { id: "1", text: "الخطوة الأولى", correctOrder: 1 },
    { id: "2", text: "الخطوة الثانية", correctOrder: 2 }
  ]
}
```

### 4. Matching (مطابقة)
```typescript
const gameData: MatchingGameData = {
  type: "matching",
  pairs: [
    { id: "1", label: "المصطلح", target: "التعريف" },
    { id: "2", label: "مصطلح آخر", target: "تعريف آخر" }
  ]
}
```

### 5. Scenario Choice (اختيار السيناريو)
```typescript
const gameData: ScenarioChoiceGameData = {
  type: "scenario_choice",
  scenarios: [
    {
      id: "1",
      scenario: "وصف السيناريو",
      choices: ["خيار 1", "خيار 2"],
      correctAnswer: "خيار 1"
    }
  ]
}
```

### 6. Map Selection (اختيار الخريطة)
```typescript
const gameData: MapSelectionGameData = {
  type: "map_selection",
  question: "اختر المناطق الصحيحة",
  regions: [
    {
      id: "1",
      name: "منطقة 1",
      x: 10,
      y: 20,
      width: 50,
      height: 50,
      isCorrect: true
    }
  ]
}
```

## أمثلة متقدمة

### استخدام Helper Types

```typescript
import type { GameDataByType } from "@/types/games"

function getGameData<T extends GameType>(
  gameType: T
): GameDataByType<T> {
  // TypeScript سيعرف نوع البيانات الصحيح حسب gameType
  // ...
}
```

### إدارة حالة اللعبة

```typescript
import type { GameStateManagerProps } from "@/types/game-components"

function GameStateManager({ 
  gameId, 
  gameType, 
  gameData,
  onStateChange,
  onComplete 
}: GameStateManagerProps) {
  // إدارة الحالة مع type safety
  // ...
}
```

### التحقق من الإجابات

```typescript
import type { ValidationResult } from "@/types/game-components"

function validateAnswer(
  gameData: GameData,
  userAnswer: any
): ValidationResult {
  // منطق التحقق
  return {
    isCorrect: true,
    score: 10,
    maxScore: 10,
    feedback: "إجابة صحيحة!"
  }
}
```

## ملاحظات مهمة

1. **Type Safety**: جميع الواجهات توفر type safety كامل في TypeScript
2. **Type Guards**: استخدم Type Guards للتحقق من نوع اللعبة في runtime
3. **Union Types**: `GameData` هو union type لجميع أنواع الألعاب
4. **Optional Fields**: بعض الحقول اختيارية حسب نوع اللعبة
5. **Legacy Support**: بعض الحقول موجودة للتوافق مع الكود القديم

## التحديثات المستقبلية

عند إضافة نوع لعبة جديد:
1. أضف النوع إلى `GameType` في `games.ts`
2. أنشئ واجهة البيانات في `games.ts`
3. أضف واجهة Props في `game-components.ts`
4. أضف Type Guard في كلا الملفين
5. حدث `games-index.ts` لتصدير الواجهات الجديدة
