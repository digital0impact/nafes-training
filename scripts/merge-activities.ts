import { readFile, writeFile } from "fs/promises";
import path from "path";

type Activity = {
  id: string;
  title: string;
  description: string;
  duration: string;
  skill: string;
  targetLevel?: "متقدمة" | "متوسطة" | "تحتاج دعم";
  outcomeLesson?: string;
  type?: "quiz" | "drag-drop" | "ordering" | "fill-blank";
  content?: any;
  image?: string;
};

async function mergeActivities() {
  const activitiesFile = path.join(process.cwd(), "src", "data", "activities.json");
  const fileContent = await readFile(activitiesFile, "utf-8");
  const activities: Activity[] = JSON.parse(fileContent);

  // فصل الأنشطة حسب النوع
  const quizActivities = activities.filter(a => a.type === "quiz");
  const dragDropActivities = activities.filter(a => a.type === "drag-drop");
  const otherActivities = activities.filter(a => a.type !== "quiz" && a.type !== "drag-drop");

  // دمج أنشطة الاختيار من متعدد
  const mergedQuiz: Activity = {
    id: "SCI-U1-QUIZ-MERGED",
    title: "اختبار شامل: طبيعة العلم",
    description: "اختبار شامل يتضمن عدة أسئلة عن طبيعة العلم والمنهج العلمي",
    duration: `${quizActivities.length * 2} دقائق`,
    skill: "علوم ثالث متوسط",
    type: "quiz",
    content: {
      questions: quizActivities.map((activity, index) => {
        const content = activity.content || {};
        return {
          id: activity.id,
          question: content.question || activity.title,
          options: content.options || [],
          answer: content.answer || "",
          skill: activity.skill || "علوم ثالث متوسط",
          points: 1,
        };
      }).filter(q => q.question && q.options.length > 0),
      fromBank: true,
    },
  };

  // دمج أنشطة السحب والإفلات
  const allDragDropPairs: any[] = [];
  let mergedDragDropPrompt = "اسحب كل عنصر وضعه في المكان المناسب.";

  dragDropActivities.forEach((activity) => {
    const content = activity.content || {};
    if (content.pairs && Array.isArray(content.pairs)) {
      // إضافة جميع الأزواج مع الحفاظ على الهوية الفريدة
      content.pairs.forEach((pair: any) => {
        allDragDropPairs.push({
          ...pair,
          id: `${activity.id}-${pair.id}`, // جعل ID فريد
        });
      });
      
      // استخدام أول prompt كعنوان رئيسي
      if (content.prompt && dragDropActivities.indexOf(activity) === 0) {
        mergedDragDropPrompt = content.prompt;
      }
    }
  });

  const mergedDragDrop: Activity = {
    id: "SCI-U1-DRAGDROP-MERGED",
    title: "نشاط شامل: المطابقة والتصنيف",
    description: "نشاط شامل يتضمن عدة أنشطة مطابقة وتصنيف",
    duration: `${Math.ceil(allDragDropPairs.length / 2)} دقائق`,
    skill: "علوم ثالث متوسط",
    type: "drag-drop",
    content: {
      prompt: mergedDragDropPrompt,
      instructions: "اسحب كل عنصر وضعه في المكان المناسب له.",
      pairs: allDragDropPairs,
    },
  };

  // إنشاء قائمة جديدة بالأنشطة المدمجة
  const mergedActivities: Activity[] = [
    ...otherActivities, // الاحتفاظ بالأنشطة الأخرى (ordering)
    mergedQuiz,
    mergedDragDrop,
  ];

  // حفظ الأنشطة المدمجة
  await writeFile(activitiesFile, JSON.stringify(mergedActivities, null, 2), "utf-8");

  console.log("✅ تم دمج الأنشطة بنجاح!");
  console.log(`\n📊 ملخص الدمج:`);
  console.log(`  - أنشطة الاختيار من متعدد: ${quizActivities.length} → 1 نشاط (${mergedQuiz.content.questions.length} سؤال)`);
  console.log(`  - أنشطة السحب والإفلات: ${dragDropActivities.length} → 1 نشاط (${allDragDropPairs.length} زوج)`);
  console.log(`  - الأنشطة الأخرى: ${otherActivities.length} (تم الاحتفاظ بها)`);
  console.log(`  - المجموع: ${activities.length} → ${mergedActivities.length} نشاط`);

  return mergedActivities;
}

// تشغيل السكريبت
if (require.main === module) {
  mergeActivities()
    .then(() => {
      console.log("\n✅ اكتمل الدمج بنجاح!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ فشل الدمج:", error);
      process.exit(1);
    });
}

export { mergeActivities };
