// بيانات جميع الألعاب التعليمية

export type GameItem = {
  id: string
  text: string
  correctOrder?: number
}

export type MultipleChoiceQuestion = {
  question: string
  options: string[]
  correctAnswer: string
}

export type MatchingPair = {
  id: string
  label: string
  target: string
}

export type DragDropItem = {
  id: string
  text: string
  category: string
}

export type Scenario = {
  id: string
  scenario: string
  choices: string[]
  correctAnswer: string
}

export type MapRegion = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
}

export const gamesData: Record<string, any> = {
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
  }
}
