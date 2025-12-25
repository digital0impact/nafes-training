"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { learningOutcomes } from "@/lib/data";
import { simulationQuestions } from "@/lib/simulation-questions";
import { QuestionSelector } from "@/components/tests/question-selector";
import { SectionHeader } from "@/components/ui/section-header";
import type { SimulationQuestion } from "@/lib/simulation-questions";
import type { TestModel } from "@/lib/test-models";

const skillOptions = ["علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"];
const difficultyOptions = ["سهل", "متوسط", "صعب"] as const;

type Question = {
  id: string;
  type: "bank" | "manual"; // نوع السؤال: من بنك الأسئلة أو يدوي
  bankQuestionId?: string; // ID السؤال من بنك الأسئلة
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  points: number;
};

export default function CreateTestPage() {
  const router = useRouter();
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(skillOptions[0]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [period, setPeriod] = useState("الفترة الأولى");
  const [duration, setDuration] = useState("");
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>();

  // إضافة أسئلة من بنك الأسئلة
  function addQuestionsFromBank(questionIds: Set<string>) {
    const newQuestions: Question[] = Array.from(questionIds)
      .map((qId) => {
        const bankQuestion = simulationQuestions.find((q) => q.id === qId);
        if (!bankQuestion) return null;

        return {
          id: `bank-${qId}`,
          type: "bank" as const,
          bankQuestionId: qId,
          question: bankQuestion.text,
          optionA: bankQuestion.choices[0] || "",
          optionB: bankQuestion.choices[1] || "",
          optionC: bankQuestion.choices[2] || "",
          optionD: bankQuestion.choices[3] || "",
          correctAnswer: bankQuestion.correctAnswer,
          points: bankQuestion.points
        };
      })
      .filter((q): q is Question => q !== null);

    setQuestions([...questions, ...newQuestions]);
    setSelectedQuestionIds(new Set());
    setShowQuestionSelector(false);
  }

  function addManualQuestion() {
    setQuestions([
      ...questions,
      {
        id: `manual-${Date.now()}`,
        type: "manual",
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        points: 1
      }
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
    // إزالة من selectedQuestionIds إذا كان من بنك الأسئلة
    const question = questions.find((q) => q.id === id);
    if (question?.type === "bank" && question.bankQuestionId) {
      const newSet = new Set(selectedQuestionIds);
      newSet.delete(question.bankQuestionId);
      setSelectedQuestionIds(newSet);
    }
  }

  function updateQuestion(id: string, field: keyof Question, value: string | number) {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      (q) =>
        !q.question.trim() ||
        !q.optionA.trim() ||
        !q.optionB.trim() ||
        !q.correctAnswer.trim()
    );

    if (invalidQuestions.length > 0) {
      setStatus("error");
      setMessage("الرجاء إكمال جميع الحقول المطلوبة في الأسئلة");
      return;
    }

    try {
      // إنشاء نموذج اختبار جديد
      const bankQuestionIds = questions
        .filter((q) => q.type === "bank" && q.bankQuestionId)
        .map((q) => q.bankQuestionId!);

      // جمع نواتج التعلم من الأسئلة المختارة
      const outcomesFromQuestions = new Set<string>();
      bankQuestionIds.forEach((qId) => {
        const q = simulationQuestions.find((sq) => sq.id === qId);
        if (q?.relatedOutcome) {
          outcomesFromQuestions.add(q.relatedOutcome);
        }
      });

      const allOutcomes = Array.from(new Set([...selectedOutcomes, ...Array.from(outcomesFromQuestions)]));

      const newTestModel: TestModel = {
        id: `model-custom-${Date.now()}`,
        title: testTitle,
        description: testDescription,
        period: period,
        weeks: [],
        relatedOutcomes: allOutcomes,
        questionIds: bankQuestionIds.length > 0 ? bankQuestionIds : [],
        duration: parseInt(duration) || 20,
        skill: selectedSkill
      };

      // حفظ في localStorage
      const savedTests = localStorage.getItem("customTestModels");
      const customTests: TestModel[] = savedTests ? JSON.parse(savedTests) : [];
      customTests.push(newTestModel);
      localStorage.setItem("customTestModels", JSON.stringify(customTests));

      setStatus("success");
      setMessage("تم إنشاء الاختبار بنجاح!");
      
      setTimeout(() => {
        router.push("/teacher/tests");
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("حدث خطأ أثناء حفظ الاختبار");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  // الحصول على معلومات السؤال من بنك الأسئلة
  function getBankQuestionInfo(question: Question): SimulationQuestion | null {
    if (question.type === "bank" && question.bankQuestionId) {
      return simulationQuestions.find((q) => q.id === question.bankQuestionId) || null;
    }
    return null;
  }

  const skillColors: Record<string, string> = {
    "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
    "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <main className="space-y-6">
      <header className="card">
        <p className="text-sm text-slate-500">إنشاء اختبار جديد</p>
        <h1 className="text-3xl font-bold text-slate-900">إنشاء اختبار جديد</h1>
        <p className="mt-2 text-slate-600">
          أنشئي اختباراً جديداً للطالبات من بنك الأسئلة أو أضيفي أسئلة يدوية.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card space-y-4">
          <SectionHeader title="معلومات الاختبار" />
          
          <div>
            <label className="text-sm font-semibold text-slate-600">عنوان الاختبار</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              placeholder="مثال: اختبار الوحدة الأولى - الخلايا"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">وصف الاختبار</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              placeholder="وصف مختصر للاختبار..."
              rows={3}
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-600">المجال / الوحدة</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
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
              <label className="text-sm font-semibold text-slate-600">الفترة</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="الفترة الأولى">الفترة الأولى</option>
                <option value="الفترة الثانية">الفترة الثانية</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">المدة (بالدقائق)</label>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">
              نواتج التعلم المرتبطة (اختياري)
            </label>
            <select
              multiple
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={selectedOutcomes}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedOutcomes(values);
              }}
              size={5}
            >
              {learningOutcomes
                .filter((outcome) => outcome.domain === selectedSkill)
                .map((outcome) => (
                  <option key={outcome.lesson} value={outcome.lesson}>
                    {outcome.lesson}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              اضغطي Ctrl (أو Cmd على Mac) لاختيار أكثر من ناتج
            </p>
          </div>
        </section>

        <section className="card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SectionHeader title="أسئلة الاختبار" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQuestionSelector(true)}
                className="rounded-2xl border-2 border-primary-500 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
              >
                📚 إضافة من بنك الأسئلة
              </button>
              <button
                type="button"
                onClick={addManualQuestion}
                className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                + إضافة سؤال يدوي
              </button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">لا توجد أسئلة بعد</p>
              <p className="text-sm text-slate-400">
                ابدأي بإضافة أسئلة من بنك الأسئلة أو أضيفي سؤالاً يدوياً
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => {
                const bankQuestion = getBankQuestionInfo(question);
                return (
                  <div
                    key={question.id}
                    className={`rounded-3xl border p-6 ${
                      question.type === "bank"
                        ? "border-primary-200 bg-primary-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          سؤال {index + 1}
                        </h3>
                        {question.type === "bank" && bankQuestion && (
                          <span className={`badge border ${skillColors[bankQuestion.skill] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                            من بنك الأسئلة • {bankQuestion.skill}
                          </span>
                        )}
                        {question.type === "manual" && (
                          <span className="badge border bg-slate-100 text-slate-700 border-slate-200">
                            سؤال يدوي
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-rose-500 text-sm hover:text-rose-700"
                      >
                        حذف السؤال
                      </button>
                    </div>

                    {question.type === "bank" && bankQuestion && (
                      <div className="mb-4 rounded-xl bg-white p-3 border border-primary-200">
                        <p className="text-xs text-slate-500 mb-1">ناتج التعلم المرتبط:</p>
                        {bankQuestion.relatedOutcome ? (
                          <span className="text-xs text-primary-700 font-medium">
                            {bankQuestion.relatedOutcome}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">غير محدد</span>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-600">نص السؤال</label>
                        <textarea
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                          placeholder="اكتبي نص السؤال هنا..."
                          rows={2}
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(question.id, "question", e.target.value)
                          }
                          required
                          disabled={question.type === "bank"}
                        />
                        {question.type === "bank" && (
                          <p className="mt-1 text-xs text-slate-500">
                            يمكن تعديل السؤال من بنك الأسئلة
                          </p>
                        )}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-slate-600">الخيار أ</label>
                          <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                            placeholder="الخيار الأول"
                            value={question.optionA}
                            onChange={(e) =>
                              updateQuestion(question.id, "optionA", e.target.value)
                            }
                            required
                            disabled={question.type === "bank"}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-600">الخيار ب</label>
                          <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                            placeholder="الخيار الثاني"
                            value={question.optionB}
                            onChange={(e) =>
                              updateQuestion(question.id, "optionB", e.target.value)
                            }
                            required
                            disabled={question.type === "bank"}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-600">الخيار ج</label>
                          <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                            placeholder="الخيار الثالث (اختياري)"
                            value={question.optionC}
                            onChange={(e) =>
                              updateQuestion(question.id, "optionC", e.target.value)
                            }
                            disabled={question.type === "bank"}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-600">الخيار د</label>
                          <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                            placeholder="الخيار الرابع (اختياري)"
                            value={question.optionD}
                            onChange={(e) =>
                              updateQuestion(question.id, "optionD", e.target.value)
                            }
                            disabled={question.type === "bank"}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-slate-600">
                            الإجابة الصحيحة
                          </label>
                          <select
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                            value={question.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(question.id, "correctAnswer", e.target.value)
                            }
                            required
                            disabled={question.type === "bank"}
                          >
                            <option value="">اختر الإجابة الصحيحة</option>
                            {question.optionA && (
                              <option value={question.optionA}>أ: {question.optionA}</option>
                            )}
                            {question.optionB && (
                              <option value={question.optionB}>ب: {question.optionB}</option>
                            )}
                            {question.optionC && (
                              <option value={question.optionC}>ج: {question.optionC}</option>
                            )}
                            {question.optionD && (
                              <option value={question.optionD}>د: {question.optionD}</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-600">النقاط</label>
                          <input
                            type="number"
                            min="1"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(question.id, "points", parseInt(e.target.value) || 1)
                            }
                            disabled={question.type === "bank"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
            type="submit"
            className="flex-1 rounded-2xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={status === "saving"}
          >
            {status === "saving" ? "جاري الحفظ..." : "حفظ الاختبار"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/teacher/tests")}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600"
          >
            إلغاء
          </button>
        </div>
      </form>

      {showQuestionSelector && (
        <QuestionSelector
          selectedQuestionIds={selectedQuestionIds}
          onSelect={(id) => {
            const newSet = new Set(selectedQuestionIds);
            newSet.add(id);
            setSelectedQuestionIds(newSet);
          }}
          onDeselect={(id) => {
            const newSet = new Set(selectedQuestionIds);
            newSet.delete(id);
            setSelectedQuestionIds(newSet);
          }}
          skill={selectedSkill}
          relatedOutcome={selectedOutcomes[0]}
          onClose={() => {
            if (selectedQuestionIds.size > 0) {
              addQuestionsFromBank(selectedQuestionIds);
            } else {
              setShowQuestionSelector(false);
            }
          }}
        />
      )}
    </main>
  );
}
