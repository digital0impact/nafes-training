// بيانات جميع الألعاب التعليمية

// إعادة تصدير الواجهات من types/games.ts للتوافق مع الكود القديم
export type {
  OrderingItem as GameItem,
  MultipleChoiceQuestion,
  MatchingPair,
  DragDropItem,
  Scenario,
  MapRegion,
  GameData,
  MultipleChoiceGameData,
  DragDropGameData,
  OrderingGameData,
  MatchingGameData,
  ScenarioChoiceGameData,
  MapSelectionGameData,
  AtomBuilderGameData,
  AtomScenario,
  PeriodicFamilyGameData,
  PeriodicFamilyElement
} from "@/types/games"

import type { GameData } from "@/types/games"
import { chemicalPhysicsGamesData } from "./chemical-physics-games-data"

const baseGamesData: Record<string, GameData> = {
  // game_001: ترتيب خطوات المنهج العلمي (ordering)
  game_001: {
    type: "ordering",
    items: [
      { id: "1", text: "الملاحظة", correctOrder: 1 },
      { id: "2", text: "طرح السؤال", correctOrder: 2 },
      { id: "3", text: "صياغة الفرضية", correctOrder: 3 },
      { id: "4", text: "التجربة", correctOrder: 4 },
      { id: "5", text: "تحليل النتائج", correctOrder: 5 },
      { id: "6", text: "الاستنتاج", correctOrder: 6 }
    ]
  },

  // game_002: تمييز مهارات العلم (matching)
  game_002: {
    type: "matching",
    pairs: [
      { id: "1", label: "الملاحظة", target: "استخدام الحواس لجمع المعلومات" },
      { id: "2", label: "القياس", target: "استخدام أدوات لقياس الكميات" },
      { id: "3", label: "التصنيف", target: "تنظيم الأشياء في مجموعات" },
      { id: "4", label: "الاستدلال", target: "استنتاج معلومات من الملاحظات" },
      { id: "5", label: "التنبؤ", target: "توقع ما سيحدث في المستقبل" }
    ]
  },

  // game_003: أسباب حدوث الزلازل (multiple_choice)
  game_003: {
    type: "multiple_choice",
    question: "ما هو السبب الرئيسي لحدوث الزلازل؟",
    options: [
      "حركة الصفائح التكتونية",
      "البراكين",
      "الرياح القوية",
      "الأمطار الغزيرة"
    ],
    correctAnswer: "حركة الصفائح التكتونية"
  },

  // game_004: تصنيف أنواع البراكين (drag_drop)
  game_004: {
    type: "drag_drop",
    categories: ["بركان نشط", "بركان خامد", "بركان منقرض"],
    items: [
      { id: "1", text: "بركان كيلاويا", category: "بركان نشط" },
      { id: "2", text: "بركان فيزوف", category: "بركان خامد" },
      { id: "3", text: "بركان إتنا", category: "بركان نشط" },
      { id: "4", text: "بركان كراكاتوا", category: "بركان منقرض" }
    ]
  },

  // game_005: ربط حدود الصفائح بنتائجها (matching)
  game_005: {
    type: "matching",
    pairs: [
      { id: "1", label: "حدود متباعدة", target: "تشكل أعراف وسط المحيط" },
      { id: "2", label: "حدود متقاربة", target: "تشكل الجبال والبراكين" },
      { id: "3", label: "حدود متحولة", target: "تسبب الزلازل" },
      { id: "4", label: "حدود متصادمة", target: "تشكل الخنادق المحيطية" }
    ]
  },

  // game_006: تحديد مناطق النشاط الزلزالي (map_selection)
  game_006: {
    type: "map_selection",
    question: "اختر المناطق الأكثر نشاطاً زلزالياً",
    regions: [
      { id: "1", name: "حزام النار في المحيط الهادئ", x: 20, y: 30, width: 60, height: 40, isCorrect: true },
      { id: "2", name: "حزام الألب", x: 45, y: 50, width: 10, height: 15, isCorrect: true },
      { id: "3", name: "منطقة الصحراء الكبرى", x: 15, y: 60, width: 25, height: 20, isCorrect: false }
    ]
  },

  // game_007: اختيار نوع النقل عبر الغشاء (scenario_choice)
  game_007: {
    type: "scenario_choice",
    scenarios: [
      {
        id: "1",
        scenario: "انتقال الأكسجين من الدم إلى الخلايا",
        choices: ["النقل النشط", "الانتشار البسيط", "الانتشار المسهل", "البلعمة"],
        correctAnswer: "الانتشار البسيط"
      },
      {
        id: "2",
        scenario: "انتقال الجلوكوز ضد تدرج التركيز",
        choices: ["النقل النشط", "الانتشار البسيط", "الانتشار المسهل", "البلعمة"],
        correctAnswer: "النقل النشط"
      },
      {
        id: "3",
        scenario: "انتقال الأيونات عبر القنوات",
        choices: ["النقل النشط", "الانتشار البسيط", "الانتشار المسهل", "البلعمة"],
        correctAnswer: "الانتشار المسهل"
      }
    ]
  },

  // game_008: تصنيف النقل النشط والسلبي (drag_drop)
  game_008: {
    type: "drag_drop",
    categories: ["نقل نشط", "نقل سلبي"],
    items: [
      { id: "1", text: "انتقال الصوديوم ضد التدرج", category: "نقل نشط" },
      { id: "2", text: "انتشار الأكسجين", category: "نقل سلبي" },
      { id: "3", text: "انتقال الجلوكوز مع التدرج", category: "نقل سلبي" },
      { id: "4", text: "انتقال البوتاسيوم ضد التدرج", category: "نقل نشط" },
      { id: "5", text: "انتشار ثاني أكسيد الكربون", category: "نقل سلبي" }
    ]
  },

  // game_009: تصنيف الصفات الوراثية والمكتسبة (matching)
  game_009: {
    type: "matching",
    pairs: [
      { id: "1", label: "لون العينين", target: "صفة وراثية" },
      { id: "2", label: "لون الشعر", target: "صفة وراثية" },
      { id: "3", label: "مهارة القراءة", target: "صفة مكتسبة" },
      { id: "4", label: "الطول", target: "صفة وراثية" },
      { id: "5", label: "مهارة الرسم", target: "صفة مكتسبة" },
      { id: "6", label: "شكل الأنف", target: "صفة وراثية" }
    ]
  },

  // game_010: ربط الصفات بين الآباء والأبناء (scenario_choice)
  game_010: {
    type: "scenario_choice",
    scenarios: [
      {
        id: "1",
        scenario: "الأب لديه عيون بنية (سائد) والأم لديها عيون زرقاء (متنحي). ما لون عيون الابن؟",
        choices: ["بني", "أزرق", "أخضر", "رمادي"],
        correctAnswer: "بني"
      },
      {
        id: "2",
        scenario: "الأب طويل القامة والأم قصيرة القامة. ما هو الطول المتوقع للابن؟",
        choices: ["طويل", "قصير", "متوسط", "لا يمكن التنبؤ"],
        correctAnswer: "متوسط"
      }
    ]
  },

  // game_011: ترتيب مراحل دورة الحياة (ordering)
  game_011: {
    type: "ordering",
    items: [
      { id: "1", text: "البويضة المخصبة", correctOrder: 1 },
      { id: "2", text: "الجنين", correctOrder: 2 },
      { id: "3", text: "الطفولة", correctOrder: 3 },
      { id: "4", text: "المراهقة", correctOrder: 4 },
      { id: "5", text: "البلوغ", correctOrder: 5 },
      { id: "6", text: "الشيخوخة", correctOrder: 6 }
    ]
  },

  // game_012: تصنيف التكاثر الجنسي واللاجنسي (drag_drop)
  game_012: {
    type: "drag_drop",
    categories: ["تكاثر جنسي", "تكاثر لاجنسي"],
    items: [
      { id: "1", text: "الإنسان", category: "تكاثر جنسي" },
      { id: "2", text: "البكتيريا", category: "تكاثر لاجنسي" },
      { id: "3", text: "الفراشة", category: "تكاثر جنسي" },
      { id: "4", text: "الهيدرا", category: "تكاثر لاجنسي" },
      { id: "5", text: "الأسماك", category: "تكاثر جنسي" },
      { id: "6", text: "النجم البحر", category: "تكاثر لاجنسي" }
    ]
  },

  // game_atom_001: مهندس الذرّة (atom_builder)
  // اللعبة تغطي المؤشر التعليمي: "يصف كيفية ترتيب الإلكترونات داخل الذرة، وعلاقته بموقعها في الجدول الدوري، ويقارن بين أعداد الإلكترونات التي تستوعبها مستويات الطاقة، ويحدد المستويات الأقل والأعلى طاقة لعنصرٍ ما."
  game_atom_001: {
    type: "atom_builder",
    instruction: "قم بتوزيع الإلكترونات في مستويات الطاقة الصحيحة. تذكر: K = 2، L = 8، M = 18، N = 32",
    energyLevelCapacities: {
      K: 2,
      L: 8,
      M: 18,
      N: 32
    },
    scenarios: [
      // السيناريو 1: الصوديوم (Na)
      // التركيز التعليمي: تحديد المستويات الأقل والأعلى طاقة، ربط الإلكترونات الخارجية بالمجموعة، ربط عدد المستويات بالدورة
      {
        id: "sodium",
        elementName: "الصوديوم",
        elementSymbol: "Na",
        atomicNumber: 11,
        totalElectrons: 11,
        correctDistribution: { K: 2, L: 8, M: 1, N: 0 },
        period: 3, // 3 مستويات مشغولة (K, L, M)
        group: 1, // إلكترون واحد في المستوى الخارجي (M)
        learningFocus: "تحديد المستويات الأقل والأعلى طاقة، ربط الإلكترونات الخارجية بالمجموعة، ربط عدد المستويات بالدورة"
      },
      // السيناريو 2: الأكسجين (O)
      // التركيز التعليمي: مقارنة الإلكترونات الفعلية مع السعة القصوى لمستويات الطاقة، فهم المستويات الخارجية غير المكتملة، تحديد المجموعة والدورة
      {
        id: "oxygen",
        elementName: "الأكسجين",
        elementSymbol: "O",
        atomicNumber: 8,
        totalElectrons: 8,
        correctDistribution: { K: 2, L: 6, M: 0, N: 0 },
        period: 2, // مستويان مشغولان (K, L)
        group: 6, // 6 إلكترونات في المستوى الخارجي (L)
        learningFocus: "مقارنة الإلكترونات الفعلية مع السعة القصوى لمستويات الطاقة، فهم المستويات الخارجية غير المكتملة، تحديد المجموعة والدورة"
      },
      // السيناريو 3: الكالسيوم (Ca)
      // التركيز التعليمي: ترتيب مستويات الطاقة من الأقل إلى الأعلى طاقة، مقارنة مستويات الطاقة المتعددة، ربط التوزيع الإلكتروني بموقع الجدول الدوري
      {
        id: "calcium",
        elementName: "الكالسيوم",
        elementSymbol: "Ca",
        atomicNumber: 20,
        totalElectrons: 20,
        correctDistribution: { K: 2, L: 8, M: 8, N: 2 },
        period: 4, // 4 مستويات مشغولة (K, L, M, N)
        group: 2, // إلكترونان في المستوى الخارجي (N)
        learningFocus: "ترتيب مستويات الطاقة من الأقل إلى الأعلى طاقة، مقارنة مستويات الطاقة المتعددة، ربط التوزيع الإلكتروني بموقع الجدول الدوري"
      }
    ]
  },

  // game_periodic_family_001: مقارنة عناصر الفلزات القلوية
  game_periodic_family_001: {
    type: "periodic_family_comparison",
    familyName: "الفلزات القلوية",
    familyDescription: "عناصر المجموعة الأولى في الجدول الدوري. جميعها لها إلكترون تكافؤ واحد في المستوى الخارجي، مما يجعلها نشطة كيميائياً.",
    instruction: "قم ببناء ذرة كل عنصر من عناصر الفلزات القلوية، ولاحظ كيف تتغير الخصائص مع زيادة عدد مستويات الطاقة مع ثبات عدد إلكترونات التكافؤ.",
    energyLevelCapacities: {
      K: 2,
      L: 8,
      M: 8,
      N: 18
    },
    elements: [
      {
        id: "li",
        elementName: "الليثيوم",
        elementSymbol: "Li",
        atomicNumber: 3,
        period: 2,
        group: 1,
        totalElectrons: 3,
        correctDistribution: { K: 2, L: 1, M: 0, N: 0 },
        properties: {
          atomicRadius: 152, // نصف القطر الذري بالبيكومتر
          ionizationEnergy: 520, // طاقة التأين بالكيلوجول/مول
          reactivity: "عالية"
        },
        description: "أخف الفلزات القلوية، يستخدم في البطاريات",
        hint: "الليثيوم له مستويان طاقة فقط (K و L)"
      },
      {
        id: "na",
        elementName: "الصوديوم",
        elementSymbol: "Na",
        atomicNumber: 11,
        period: 3,
        group: 1,
        totalElectrons: 11,
        correctDistribution: { K: 2, L: 8, M: 1, N: 0 },
        properties: {
          atomicRadius: 186,
          ionizationEnergy: 496,
          reactivity: "عالية"
        },
        description: "عنصر شائع في ملح الطعام، شديد التفاعل مع الماء",
        hint: "الصوديوم له ثلاثة مستويات طاقة (K و L و M)"
      },
      {
        id: "k",
        elementName: "البوتاسيوم",
        elementSymbol: "K",
        atomicNumber: 19,
        period: 4,
        group: 1,
        totalElectrons: 19,
        correctDistribution: { K: 2, L: 8, M: 8, N: 1 },
        properties: {
          atomicRadius: 227,
          ionizationEnergy: 419,
          reactivity: "عالية"
        },
        description: "أكثر الفلزات القلوية تفاعلاً، ضروري للنباتات",
        hint: "البوتاسيوم له أربعة مستويات طاقة (K و L و M و N)"
      }
    ],
    comparisonQuestions: [
      {
        id: "q1",
        question: "ما هو عدد إلكترونات التكافؤ في جميع عناصر الفلزات القلوية؟",
        type: "valence",
        correctAnswer: "1",
        explanation: "جميع عناصر الفلزات القلوية لها إلكترون تكافؤ واحد في المستوى الخارجي، وهذا يفسر تشابه خصائصها الكيميائية."
      },
      {
        id: "q2",
        question: "كيف يتغير نصف القطر الذري عند الانتقال من الليثيوم إلى البوتاسيوم؟",
        type: "trend",
        correctAnswer: "يزداد",
        explanation: "يزداد نصف القطر الذري مع زيادة عدد مستويات الطاقة. البوتاسيوم له 4 مستويات بينما الليثيوم له مستويان فقط."
      },
      {
        id: "q3",
        question: "كيف تتغير طاقة التأين عند الانتقال من الليثيوم إلى البوتاسيوم؟",
        type: "trend",
        correctAnswer: "تقل",
        explanation: "تقل طاقة التأين مع زيادة عدد مستويات الطاقة لأن الإلكترون الخارجي يكون أبعد عن النواة وأسهل في إزالته."
      }
    ]
  }
}

// دمج جميع الألعاب في كائن واحد
export const gamesData: Record<string, GameData> = {
  ...baseGamesData,
  ...chemicalPhysicsGamesData
}
