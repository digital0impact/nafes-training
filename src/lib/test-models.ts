import { simulationQuestions, type SimulationQuestion } from "./simulation-questions";
import { learningOutcomes, type LearningOutcome } from "./data";
import prebuiltTestModels from "@/data/prebuilt-test-models.json";
import prebuiltDiagnosticTests from "@/data/prebuilt-diagnostic-tests.json";

export type TestModel = {
  id: string;
  title: string;
  description: string;
  period: string;
  weeks: string[];
  relatedOutcomes: string[]; // عناوين الدروس المرتبطة
  questionIds: string[];
  duration: number; // بالدقائق
  skill: string;
  testType?: "normal" | "diagnostic"; // نوع الاختبار
  year?: string; // السنة الدراسية (للنماذج الجاهزة)
  source?: string; // المصدر (للنماذج الجاهزة)
};

// النماذج الافتراضية - تم حذفها
// يمكن إضافة نماذج مخصصة من خلال واجهة إنشاء الاختبارات
export const testModels: TestModel[] = [];

// النماذج الجاهزة من السنوات السابقة
export const prebuiltModels: TestModel[] = prebuiltTestModels as TestModel[];

// النماذج التشخيصية الجاهزة
export const prebuiltDiagnosticModels: TestModel[] = prebuiltDiagnosticTests as TestModel[];

// دالة للحصول على النماذج الجاهزة (العادية فقط)
export function getPrebuiltTestModels(): TestModel[] {
  return prebuiltModels;
}

// دالة للحصول على النماذج التشخيصية الجاهزة
export function getPrebuiltDiagnosticTests(): TestModel[] {
  return prebuiltDiagnosticModels;
}

// دالة لإضافة نموذج جاهز إلى النماذج المخصصة
export function addPrebuiltModelToCustom(prebuiltId: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    // البحث في النماذج الجاهزة العادية
    let prebuiltModel = prebuiltModels.find(m => m.id === prebuiltId);
    
    // البحث في النماذج التشخيصية الجاهزة
    if (!prebuiltModel) {
      prebuiltModel = prebuiltDiagnosticModels.find(m => m.id === prebuiltId);
    }
    
    if (!prebuiltModel) return false;
    
    // إنشاء نسخة جديدة مع ID جديد لتجنب التعارض
    const newModel: TestModel = {
      ...prebuiltModel,
      id: `custom-${Date.now()}-${prebuiltId}`,
      title: `${prebuiltModel.title} (نسخة)`
    };
    
    // الحصول على النماذج المخصصة الحالية
    const saved = localStorage.getItem("customTestModels");
    const customTests: TestModel[] = saved ? JSON.parse(saved) : [];
    
    // إضافة النموذج الجديد
    customTests.push(newModel);
    
    // حفظ في localStorage
    localStorage.setItem("customTestModels", JSON.stringify(customTests));
    
    return true;
  } catch (e) {
    console.error("Error adding prebuilt model", e);
    return false;
  }
}

// دالة للحصول على جميع النماذج (المخصصة فقط) مع استثناء المخفية
export function getAllTestModels(): TestModel[] {
  if (typeof window === "undefined") return [];
  
  try {
    // Get hidden models
    const hiddenSaved = localStorage.getItem("hiddenTestModels");
    const hiddenModels: string[] = hiddenSaved ? JSON.parse(hiddenSaved) : [];
    const hiddenSet = new Set(hiddenModels);
    
    // Get custom models only (no default models)
    const saved = localStorage.getItem("customTestModels");
    const customTests: TestModel[] = saved ? JSON.parse(saved) : [];
    
    // Filter out hidden models
    const visibleCustomModels = customTests.filter(m => !hiddenSet.has(m.id));
    
    return visibleCustomModels;
  } catch (e) {
    console.error("Error loading test models", e);
    return [];
  }
}

// دالة للحصول على الأسئلة لنموذج معين
export function getQuestionsForModel(modelId: string): SimulationQuestion[] {
  let model: TestModel | undefined;
  
  // البحث في النماذج الجاهزة أولاً
  model = prebuiltModels.find((m) => m.id === modelId);
  
  // البحث في النماذج التشخيصية الجاهزة
  if (!model) {
    model = prebuiltDiagnosticModels.find((m) => m.id === modelId);
  }
  
  // إذا لم يُوجد، البحث في النماذج المخصصة
  if (!model && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("customTestModels");
      const customTests: TestModel[] = saved ? JSON.parse(saved) : [];
      model = customTests.find((m) => m.id === modelId);
    } catch (e) {
      console.error("Error loading custom test models", e);
    }
  }
  
  if (!model) return [];

  // الحصول على الأسئلة المخصصة من localStorage
  let customQuestions: SimulationQuestion[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("customQuestions");
      if (saved) {
        customQuestions = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading custom questions", e);
    }
  }

  // الحصول على الأسئلة المحددة وإعادة ترقيمها
  const questions = model.questionIds
    .map((id) => {
      // البحث في الأسئلة المخصصة أولاً
      const customQ = customQuestions.find((q) => q.id === id);
      if (customQ) return customQ;
      
      // ثم البحث في الأسئلة العادية
      return simulationQuestions.find((q) => q.id === id);
    })
    .filter((q): q is SimulationQuestion => q !== undefined)
    .map((q, index) => ({
      ...q,
      number: index + 1
    }));

  return questions;
}

// دالة للحصول على نواتج التعلم المرتبطة بنموذج
export function getRelatedOutcomes(modelId: string): LearningOutcome[] {
  let model: TestModel | undefined;
  
  // البحث في النماذج الجاهزة أولاً
  model = prebuiltModels.find((m) => m.id === modelId);
  
  // البحث في النماذج التشخيصية الجاهزة
  if (!model) {
    model = prebuiltDiagnosticModels.find((m) => m.id === modelId);
  }
  
  // إذا لم يُوجد، البحث في النماذج المخصصة
  if (!model && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("customTestModels");
      const customTests: TestModel[] = saved ? JSON.parse(saved) : [];
      model = customTests.find((m) => m.id === modelId);
    } catch (e) {
      console.error("Error loading custom test models", e);
    }
  }
  
  if (!model) return [];

  return learningOutcomes.filter((outcome) =>
    model.relatedOutcomes.includes(outcome.lesson)
  );
}

