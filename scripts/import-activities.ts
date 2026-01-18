import { readFile, writeFile } from "fs/promises";
import path from "path";

// أنواع البيانات الواردة
type IncomingActivity = {
  id: string;
  title: string;
  type: "drag_and_drop" | "multiple_choice" | "ordering" | "multiple_choice_with_reason";
  prompt: string;
  nafs_indicator?: {
    kind: string;
    code: string;
    name: string;
    alignment_reason: string;
  };
  // للـ drag_and_drop
  dragItems?: Array<{ id: string; text: string }>;
  dropZones?: Array<{ id: string; label: string }>;
  correctMapping?: Record<string, string>;
  // للـ multiple_choice
  choices?: Array<{ id: string; text: string }>;
  correctAnswer?: string;
  // للـ ordering
  items?: Array<{ id: string; text: string }>;
  correctOrder?: string[];
  // للـ multiple_choice_with_reason
  reasonPrompt?: string;
  expectedReasonKeywords?: string[];
};

// أنواع الأنشطة في التطبيق
type QuizContent = {
  question?: string;
  options?: string[];
  answer?: string;
  hint?: string;
  image?: string;
  reasonPrompt?: string;
  expectedReasonKeywords?: string[];
};

type DragDropContent = {
  prompt: string;
  instructions?: string;
  pairs: Array<{
    id: string;
    label: string;
    image?: string;
    target: string;
    targetImage?: string;
  }>;
};

type OrderingContent = {
  prompt: string;
  items: Array<{
    id: string;
    text: string;
    order: number;
  }>;
};

type ActivityContent = QuizContent | DragDropContent | OrderingContent;

type Activity = {
  id: string;
  title: string;
  description: string;
  duration: string;
  skill: string;
  targetLevel?: "متقدمة" | "متوسطة" | "تحتاج دعم";
  outcomeLesson?: string;
  type?: "quiz" | "drag-drop" | "ordering" | "fill-blank";
  content?: ActivityContent;
  image?: string;
};

// دالة تحويل النشاط
function convertActivity(incoming: IncomingActivity, courseName: string): Activity {
  const baseActivity: Activity = {
    id: incoming.id,
    title: incoming.title,
    description: `نشاط تفاعلي من ${courseName}`,
    duration: "10 دقائق",
    skill: courseName.split(" - ")[0] || "علوم",
    type: undefined,
    content: undefined,
  };

  let content: ActivityContent;

  switch (incoming.type) {
    case "drag_and_drop": {
      if (!incoming.dragItems || !incoming.dropZones || !incoming.correctMapping) {
        throw new Error(`النشاط ${incoming.id} يحتوي على بيانات ناقصة للـ drag_and_drop`);
      }

      // تحويل dragItems و dropZones و correctMapping إلى pairs
      const pairs = incoming.dragItems.map((dragItem) => {
        const targetZoneId = incoming.correctMapping![dragItem.id];
        const targetZone = incoming.dropZones!.find((z) => z.id === targetZoneId);
        if (!targetZone) {
          throw new Error(`لا يوجد dropZone مطابق لـ ${dragItem.id} في النشاط ${incoming.id}`);
        }
        return {
          id: dragItem.id,
          label: dragItem.text,
          target: targetZone.label,
        };
      });

      content = {
        prompt: incoming.prompt,
        pairs,
      } as DragDropContent;

      baseActivity.type = "drag-drop";
      break;
    }

    case "multiple_choice": {
      if (!incoming.choices || !incoming.correctAnswer) {
        throw new Error(`النشاط ${incoming.id} يحتوي على بيانات ناقصة للـ multiple_choice`);
      }

      const correctChoice = incoming.choices.find((c) => c.id === incoming.correctAnswer);
      if (!correctChoice) {
        throw new Error(`لا توجد إجابة صحيحة مطابقة في النشاط ${incoming.id}`);
      }

      content = {
        question: incoming.prompt,
        options: incoming.choices.map((c) => c.text),
        answer: correctChoice.text,
      } as QuizContent;

      baseActivity.type = "quiz";
      break;
    }

    case "multiple_choice_with_reason": {
      if (!incoming.choices || !incoming.correctAnswer) {
        throw new Error(`النشاط ${incoming.id} يحتوي على بيانات ناقصة للـ multiple_choice_with_reason`);
      }

      const correctChoice = incoming.choices.find((c) => c.id === incoming.correctAnswer);
      if (!correctChoice) {
        throw new Error(`لا توجد إجابة صحيحة مطابقة في النشاط ${incoming.id}`);
      }

      content = {
        question: incoming.prompt,
        options: incoming.choices.map((c) => c.text),
        answer: correctChoice.text,
        reasonPrompt: incoming.reasonPrompt,
        expectedReasonKeywords: incoming.expectedReasonKeywords,
      } as QuizContent;

      baseActivity.type = "quiz";
      break;
    }

    case "ordering": {
      if (!incoming.items || !incoming.correctOrder) {
        throw new Error(`النشاط ${incoming.id} يحتوي على بيانات ناقصة للـ ordering`);
      }

      const items = incoming.items.map((item, index) => {
        const orderIndex = incoming.correctOrder!.indexOf(item.id);
        if (orderIndex === -1) {
          throw new Error(`العنصر ${item.id} غير موجود في correctOrder في النشاط ${incoming.id}`);
        }
        return {
          id: item.id,
          text: item.text,
          order: orderIndex + 1, // الترتيب يبدأ من 1
        };
      });

      content = {
        prompt: incoming.prompt,
        items,
      } as OrderingContent;

      baseActivity.type = "ordering";
      break;
    }

    default:
      throw new Error(`نوع النشاط غير معروف: ${(incoming as any).type}`);
  }

  baseActivity.content = content;
  return baseActivity;
}

// الدالة الرئيسية
async function importActivities() {
  const inputData = {
    course: {
      name: "علوم ثالث متوسط - الفصل الأول (طبيعة العلم)",
      content_source: "ملخص التفوق - الفصل الاول.pdf"
    },
    activities: [
      {
        "id": "SCI-U1-A01",
        "title": "صنّف المهارة العلمية",
        "type": "drag_and_drop",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-A",
          "name": "التطبيق",
          "alignment_reason": "تطبيق مهارات العلم على مواقف جديدة (ملاحظة/قياس/استنتاج/مقارنة)."
        },
        "prompt": "اسحب كل موقف وضعه تحت المهارة المناسبة.",
        "dragItems": [
          { "id": "d1", "text": "استخدم أحمد الميزان لقياس كتلة جسم." },
          { "id": "d2", "text": "لاحظت سارة أن لون المحلول تغيّر." },
          { "id": "d3", "text": "قال خالد: زيادة الضوء أدت إلى زيادة نمو النبات." },
          { "id": "d4", "text": "قارن الطالب بين طول نباتين في نفس العمر." }
        ],
        "dropZones": [
          { "id": "z1", "label": "ملاحظة" },
          { "id": "z2", "label": "قياس" },
          { "id": "z3", "label": "استنتاج" },
          { "id": "z4", "label": "مقارنة" }
        ],
        "correctMapping": { "d2": "z1", "d1": "z2", "d3": "z3", "d4": "z4" }
      },
      {
        "id": "SCI-U1-A02",
        "title": "كيف يمارس العالم العلم؟ (استخدام الأدلة)",
        "type": "multiple_choice",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-R",
          "name": "الاستدلال",
          "alignment_reason": "التركيز على استخدام الأدلة لاتخاذ قرار علمي."
        },
        "prompt": "أي مما يلي يُعد مثالًا على استخدام الأدلة؟",
        "choices": [
          { "id": "a", "text": "تخمين النتيجة دون بيانات." },
          { "id": "b", "text": "جمع البيانات وتحليلها قبل الحكم." },
          { "id": "c", "text": "تغيير عوامل متعددة عشوائيًا." },
          { "id": "d", "text": "تجاهل النتائج غير المتوقعة." }
        ],
        "correctAnswer": "b"
      },
      {
        "id": "SCI-U1-A03",
        "title": "رتّب خطوات المنهج العلمي",
        "type": "ordering",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-A",
          "name": "التطبيق",
          "alignment_reason": "تطبيق تسلسل خطوات حل المشكلات العلمية."
        },
        "prompt": "رتب الخطوات التالية بالترتيب الصحيح:",
        "items": [
          { "id": "s1", "text": "تحديد المشكلة" },
          { "id": "s2", "text": "صياغة فرضية قابلة للاختبار" },
          { "id": "s3", "text": "إجراء تجربة/استقصاء" },
          { "id": "s4", "text": "تحليل البيانات" },
          { "id": "s5", "text": "استخلاص النتائج" }
        ],
        "correctOrder": ["s1", "s2", "s3", "s4", "s5"]
      },
      {
        "id": "SCI-U1-A04",
        "title": "بحث وصفي أم تجريبي؟",
        "type": "multiple_choice",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-A",
          "name": "التطبيق",
          "alignment_reason": "تطبيق تعريفات نوعي البحث على موقف جديد."
        },
        "prompt": "دراسة تسجل عدد الطلاب الذين يستخدمون الحاسب يوميًا تُعد:",
        "choices": [
          { "id": "a", "text": "بحث تجريبي" },
          { "id": "b", "text": "بحث وصفي" },
          { "id": "c", "text": "تجربة مضبوطة" },
          { "id": "d", "text": "نموذج فكري" }
        ],
        "correctAnswer": "b"
      },
      {
        "id": "SCI-U1-A05",
        "title": "اختر الأداة المناسبة (نماذج وتمثيل البيانات)",
        "type": "drag_and_drop",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-A",
          "name": "التطبيق",
          "alignment_reason": "اختيار تمثيل/نموذج مناسب وفق الهدف."
        },
        "prompt": "اسحب كل أداة وضعها أمام الاستخدام الأنسب لها.",
        "dragItems": [
          { "id": "t1", "text": "جدول بيانات" },
          { "id": "t2", "text": "رسم بياني" },
          { "id": "t3", "text": "نموذج مادي" },
          { "id": "t4", "text": "نموذج حاسوبي" }
        ],
        "dropZones": [
          { "id": "u1", "label": "تلخيص بيانات رقمية منظمة" },
          { "id": "u2", "label": "إظهار علاقة/اتجاه في البيانات" },
          { "id": "u3", "label": "محاكاة شيء يمكن لمسه ورؤيته" },
          { "id": "u4", "label": "محاكاة عبر برنامج/خريطة طقس" }
        ],
        "correctMapping": { "t1": "u1", "t2": "u2", "t3": "u3", "t4": "u4" }
      },
      {
        "id": "SCI-U1-A06",
        "title": "تنظيم البيانات: جداول معنونة",
        "type": "multiple_choice",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-A",
          "name": "التطبيق",
          "alignment_reason": "تطبيق قواعد تنظيم البيانات قبل التجربة."
        },
        "prompt": "لماذا يُفضل إعداد جدول البيانات قبل بدء البحث؟",
        "choices": [
          { "id": "a", "text": "لتغيير النتائج حسب الرغبة." },
          { "id": "b", "text": "لتسجيل البيانات بشكل منظم وصحيح." },
          { "id": "c", "text": "لزيادة عدد المتغيرات." },
          { "id": "d", "text": "لتقليل زمن التجربة فقط." }
        ],
        "correctAnswer": "b"
      },
      {
        "id": "SCI-U1-A07",
        "title": "حدّد المتغيرات (مستقل/تابع/ثوابت)",
        "type": "multiple_choice",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-R",
          "name": "الاستدلال",
          "alignment_reason": "تصميم استقصاء مضبوطة وتمييز المتغيرات لاتخاذ حكم علمي."
        },
        "prompt": "في تجربة لدراسة تأثير كمية الضوء على نمو النبات، ما المتغير المستقل؟",
        "choices": [
          { "id": "a", "text": "طول النبات (النمو)" },
          { "id": "b", "text": "نوع التربة" },
          { "id": "c", "text": "كمية الضوء" },
          { "id": "d", "text": "عدد الأوراق" }
        ],
        "correctAnswer": "c"
      },
      {
        "id": "SCI-U1-A08",
        "title": "هل تدعم النتائج الفرضية؟",
        "type": "multiple_choice_with_reason",
        "nafs_indicator": {
          "kind": "NAFS_COG_LEVEL",
          "code": "NAFS-R",
          "name": "الاستدلال",
          "alignment_reason": "تحليل بيانات واستخلاص نتيجة مدعومة بالأدلة."
        },
        "prompt": "فرضية: زيادة الضوء تزيد نمو النبات. بعد أسبوع: نبات (A) بضياء أعلى نما 12 سم، نبات (B) بضياء أقل نما 7 سم. هل تدعم النتائج الفرضية؟",
        "choices": [
          { "id": "a", "text": "نعم" },
          { "id": "b", "text": "لا" }
        ],
        "correctAnswer": "a",
        "reasonPrompt": "اكتب سببًا مختصرًا اعتمادًا على البيانات:",
        "expectedReasonKeywords": ["12", "7", "أعلى", "أكثر", "نمو"]
      }
    ]
  };

  try {
    // تحويل الأنشطة
    const convertedActivities: Activity[] = inputData.activities.map((activity) =>
      convertActivity(activity as IncomingActivity, inputData.course.name)
    );

    // حفظ في ملف JSON
    const outputPath = path.join(process.cwd(), "src", "data", "activities.json");
    await writeFile(outputPath, JSON.stringify(convertedActivities, null, 2), "utf-8");

    console.log(`✅ تم تحويل وإضافة ${convertedActivities.length} نشاط بنجاح!`);
    console.log(`📁 تم الحفظ في: ${outputPath}`);
    
    // طباعة ملخص
    console.log("\n📊 ملخص الأنشطة:");
    convertedActivities.forEach((activity) => {
      console.log(`  - ${activity.id}: ${activity.title} (${activity.type})`);
    });

    return convertedActivities;
  } catch (error) {
    console.error("❌ حدث خطأ أثناء استيراد الأنشطة:", error);
    throw error;
  }
}

// تشغيل السكريبت
if (require.main === module) {
  importActivities()
    .then(() => {
      console.log("\n✅ اكتمل الاستيراد بنجاح!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ فشل الاستيراد:", error);
      process.exit(1);
    });
}

export { importActivities, convertActivity };
