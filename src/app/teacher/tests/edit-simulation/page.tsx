"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPrebuiltTestModels, getQuestionsForModel, type TestModel } from "@/lib/test-models";
import { simulationQuestions, type SimulationQuestion } from "@/lib/simulation-questions";
import { PageBackground } from "@/components/layout/page-background";

type Question = {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: string;
  skill: string;
  points: number;
};

export default function EditSimulationTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("id");

  const [mounted, setMounted] = useState(false);
  const [model, setModel] = useState<TestModel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("علوم الحياة");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>();

  const skillOptions = ["علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"];

  useEffect(() => {
    setMounted(true);
    
    if (modelId) {
      // تحميل النموذج للتعديل
      const allModels = getPrebuiltTestModels();
      const foundModel = allModels.find(m => m.id === modelId);
      
      if (foundModel) {
        setModel(foundModel);
        setTestTitle(foundModel.title);
        setTestDescription(foundModel.description);
        setDuration(foundModel.duration.toString());
        setSelectedSkill(foundModel.skill);
        
        // تحميل الأسئلة
        const modelQuestions = getQuestionsForModel(modelId);
        const formattedQuestions = modelQuestions.map((q: SimulationQuestion) => ({
          id: q.id,
          text: q.text,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          skill: q.skill,
          points: q.points || 1
        }));
        setQuestions(formattedQuestions);
      } else {
        setMessage("لم يتم العثور على النموذج");
        setStatus("error");
      }
    }
  }, [modelId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        text: "",
        choices: ["", "", "", ""],
        correctAnswer: "",
        skill: selectedSkill,
        points: 1
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateChoice = (questionId: string, choiceIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newChoices = [...q.choices];
          newChoices[choiceIndex] = value;
          return { ...q, choices: newChoices };
        }
        return q;
      })
    );
  };

  const handleSave = async () => {
    setStatus("saving");
    setMessage(undefined);

    // التحقق من البيانات
    if (!testTitle.trim()) {
      setStatus("error");
      setMessage("الرجاء إدخال عنوان الاختبار");
      return;
    }

    if (questions.length === 0) {
      setStatus("error");
      setMessage("الرجاء إضافة سؤال واحد على الأقل");
      return;
    }

    const invalidQuestions = questions.filter(
      (q) => !q.text.trim() || q.choices.filter(c => c.trim()).length < 2 || !q.correctAnswer.trim()
    );

    if (invalidQuestions.length > 0) {
      setStatus("error");
      setMessage("الرجاء إكمال جميع الحقول المطلوبة في الأسئلة");
      return;
    }

    try {
      // حفظ النموذج المعدل في localStorage
      const editedModel: TestModel = {
        id: `edited-${modelId}-${Date.now()}`,
        title: testTitle,
        description: testDescription,
        period: model?.period || "الفترة الأولى",
        weeks: model?.weeks || [],
        relatedOutcomes: model?.relatedOutcomes || [],
        questionIds: questions.map(q => q.id),
        duration: parseInt(duration) || 20,
        skill: selectedSkill
      };

      // حفظ الأسئلة
      const customQuestions = localStorage.getItem("customQuestions");
      const allCustomQuestions = customQuestions ? JSON.parse(customQuestions) : [];
      
      questions.forEach(q => {
        const existingIndex = allCustomQuestions.findIndex((cq: any) => cq.id === q.id);
        if (existingIndex >= 0) {
          allCustomQuestions[existingIndex] = q;
        } else {
          allCustomQuestions.push(q);
        }
      });
      
      localStorage.setItem("customQuestions", JSON.stringify(allCustomQuestions));

      // حفظ النموذج
      const savedTests = localStorage.getItem("customTestModels");
      const customTests: TestModel[] = savedTests ? JSON.parse(savedTests) : [];
      customTests.push(editedModel);
      localStorage.setItem("customTestModels", JSON.stringify(customTests));

      setStatus("success");
      setMessage("تم حفظ النموذج المعدل بنجاح!");
      
      setTimeout(() => {
        router.push("/teacher/tests/share");
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("حدث خطأ أثناء حفظ الاختبار");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (!mounted) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center">
            <p className="text-slate-600">جاري التحميل...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!model) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center">
            <p className="text-rose-600">لم يتم العثور على النموذج</p>
            <Link
              href="/teacher/tests/share"
              className="mt-4 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              العودة للنماذج
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        {/* Header */}
        <header className="card bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/teacher/tests/share"
              className="text-blue-600 hover:text-blue-700"
            >
              ← العودة للنماذج
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">✏️ تعديل النموذج المحاكي</h1>
          <p className="mt-2 text-slate-600">
            قومي بتعديل النموذج حسب احتياجاتك. يمكنك إضافة أسئلة أو حذفها أو تعديلها.
          </p>
        </header>

        {/* Test Info */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">معلومات الاختبار</h2>
          
          <div>
            <label className="text-sm font-semibold text-slate-600">عنوان الاختبار</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-300 focus:bg-white focus:outline-none"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">وصف الاختبار</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-300 focus:bg-white focus:outline-none"
              rows={3}
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-600">المجال</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-300 focus:bg-white focus:outline-none"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                {skillOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">المدة (بالدقائق)</label>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-300 focus:bg-white focus:outline-none"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">أسئلة الاختبار ({questions.length})</h2>
            <button
              onClick={addQuestion}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + إضافة سؤال
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">لا توجد أسئلة بعد</p>
              <button
                onClick={addQuestion}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                إضافة أول سؤال
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-3xl border-2 border-blue-200 bg-blue-50 p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      سؤال {index + 1}
                    </h3>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-rose-500 text-sm hover:text-rose-700 font-semibold"
                    >
                      حذف السؤال
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">نص السؤال</label>
                      <textarea
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:outline-none"
                        rows={2}
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex}>
                          <label className="text-sm font-semibold text-slate-600">
                            الخيار {String.fromCharCode(65 + choiceIndex)}
                          </label>
                          <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:outline-none"
                            value={choice}
                            onChange={(e) => updateChoice(question.id, choiceIndex, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-600">
                          الإجابة الصحيحة
                        </label>
                        <select
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:outline-none"
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                          required
                        >
                          <option value="">اختر الإجابة الصحيحة</option>
                          {question.choices.filter(c => c.trim()).map((choice, idx) => (
                            <option key={idx} value={choice}>
                              {String.fromCharCode(65 + idx)}: {choice}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600">النقاط</label>
                        <input
                          type="number"
                          min="1"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:outline-none"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, "points", parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status === "error"
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60 hover:bg-blue-700"
            disabled={status === "saving"}
          >
            {status === "saving" ? "جاري الحفظ..." : "حفظ النموذج المعدل"}
          </button>
          <Link
            href="/teacher/tests/share"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </Link>
        </div>
      </div>
    </main>
  );
}
