"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { learningOutcomes } from "@/lib/data";

const levelOptions = ["متقدمة", "متوسطة", "تحتاج دعم"] as const;
const skillOptions = ["علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"];
const activityTypes = [
  { value: "quiz", label: "اختيار من متعدد" },
  { value: "drag-drop", label: "سحب وإفلات" }
] as const;

type DragPair = {
  id: string;
  label: string;
  image?: string;
  target: string;
  targetImage?: string;
};

const createPair = (): DragPair => ({
  id: Math.random().toString(36).slice(2),
  label: "",
  image: "",
  target: "",
  targetImage: ""
});

export function ActivityForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [skill, setSkill] = useState(skillOptions[0]);
  const [targetLevel, setTargetLevel] = useState<typeof levelOptions[number]>(
    levelOptions[1]
  );
  const [outcomeLesson, setOutcomeLesson] = useState("");
  const [activityType, setActivityType] =
    useState<(typeof activityTypes)[number]["value"]>("quiz");

  // quiz
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizImage, setQuizImage] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [hint, setHint] = useState("");

  // drag drop
  const [dragPrompt, setDragPrompt] = useState("");
  const [dragInstructions, setDragInstructions] = useState("");
  const [dragPairs, setDragPairs] = useState<DragPair[]>([
    createPair(),
    createPair()
  ]);

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>();

  function updatePair(index: number, field: keyof DragPair, value: string) {
    setDragPairs((prev) =>
      prev.map((pair, idx) =>
        idx === index ? { ...pair, [field]: value } : pair
      )
    );
  }

  function addPair() {
    setDragPairs((prev) => [...prev, createPair()]);
  }

  function removePair(index: number) {
    setDragPairs((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(undefined);

    let content: any = undefined;

    if (activityType === "quiz") {
      const options = [optionA, optionB, optionC, optionD].filter(
        (value) => value.trim().length > 0
      );

      if (options.length < 2) {
        setStatus("error");
        setMessage("أدخلي على الأقل خيارين للنشاط التفاعلي.");
        return;
      }

      if (!correctAnswer || !options.includes(correctAnswer)) {
        setStatus("error");
        setMessage("اختاري الإجابة الصحيحة من بين الخيارات.");
        return;
      }

      content = {
        question: quizQuestion,
        options,
        answer: correctAnswer,
        hint: hint || undefined,
        image: quizImage?.trim() || undefined
      };
    } else {
      const pairs = dragPairs
        .filter((pair) => pair.label.trim() && pair.target.trim())
        .map((pair) => ({
          id: pair.id,
          label: pair.label,
          image: pair.image?.trim() || undefined,
          target: pair.target,
          targetImage: pair.targetImage?.trim() || undefined
        }));

      if (pairs.length < 2) {
        setStatus("error");
        setMessage("أدخلي زوجين على الأقل للسحب والإفلات.");
        return;
      }

      content = {
        prompt: dragPrompt,
        instructions: dragInstructions || undefined,
        pairs
      };
    }

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description: "",
          duration,
          skill,
          targetLevel,
          outcomeLesson,
          type: activityType,
          content,
          image: undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.requiresUpgrade) {
          setStatus("error");
          setMessage(data.error + " - يمكنك الترقية من صفحة إدارة الاشتراك");
          return;
        } else {
          throw new Error(data.error ?? "فشل حفظ النشاط");
        }
      }

      setStatus("success");
      setMessage("تم حفظ النشاط بنجاح.");
      setTitle("");
      setDuration("");
      setSkill(skillOptions[0]);
      setTargetLevel(levelOptions[1]);
      setOutcomeLesson("");
      setQuizQuestion("");
      setQuizImage("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("");
      setHint("");
      setDragPrompt("");
      setDragInstructions("");
      setDragPairs([createPair(), createPair()]);
      
      // Redirect to activities management page after 2 seconds
      setTimeout(() => {
        router.push("/teacher/activities");
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء حفظ النشاط."
      );
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-semibold text-slate-600">عنوان النشاط</label>
        <input
          type="text"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
          placeholder="مثال: نشاط: استكشاف الخلية"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-600">
            مرتبط بناتج التعلم
          </label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            value={outcomeLesson}
            onChange={(event) => setOutcomeLesson(event.target.value)}
          >
            <option value="">اختر الناتج المرتبط بهذا النشاط</option>
            {learningOutcomes.map((outcome) => (
              <option key={outcome.lesson} value={outcome.lesson}>
                {outcome.lesson} — {outcome.domain}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            سيساعد ذلك على إظهار النشاط تلقائيًا للطالبة المناسبة.
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">نوع النشاط</label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            value={activityType}
            onChange={(event) =>
              setActivityType(event.target.value as (typeof activityTypes)[number]["value"])
            }
          >
            {activityTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activityType === "quiz" ? (
        <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">
            تفاصيل الاختيار من متعدد
          </p>
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
            placeholder="نص السؤال الذي ستراه الطالبة"
            value={quizQuestion}
            onChange={(event) => setQuizQuestion(event.target.value)}
          />
          <div>
            <label className="text-sm font-semibold text-slate-600">
              صورة السؤال (اختياري)
            </label>
            <input
              type="url"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
              placeholder="https://example.com/question-image.jpg"
              value={quizImage}
              onChange={(event) => setQuizImage(event.target.value)}
            />
            {quizImage && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold text-slate-600">معاينة صورة السؤال:</p>
                <img
                  src={quizImage}
                  alt="معاينة صورة السؤال"
                  className="max-h-48 w-full rounded-2xl border border-slate-200 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
              placeholder="الخيار 1"
              value={optionA}
              onChange={(event) => setOptionA(event.target.value)}
            />
            <input
              type="text"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
              placeholder="الخيار 2"
              value={optionB}
              onChange={(event) => setOptionB(event.target.value)}
            />
            <input
              type="text"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
              placeholder="الخيار 3 (اختياري)"
              value={optionC}
              onChange={(event) => setOptionC(event.target.value)}
            />
            <input
              type="text"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
              placeholder="الخيار 4 (اختياري)"
              value={optionD}
              onChange={(event) => setOptionD(event.target.value)}
            />
          </div>
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
            placeholder="الإجابة الصحيحة (انسخيها من أحد الخيارات)"
            value={correctAnswer}
            onChange={(event) => setCorrectAnswer(event.target.value)}
          />
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
            placeholder="تلميح للطالبة (اختياري)"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">
            تفاصيل نشاط السحب والإفلات
          </p>
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
            placeholder="النص الذي يوضح المطلوب"
            value={dragPrompt}
            onChange={(event) => setDragPrompt(event.target.value)}
          />
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
            placeholder="تعليمات إضافية (اختياري)"
            value={dragInstructions}
            onChange={(event) => setDragInstructions(event.target.value)}
          />

          <div className="space-y-4">
            {dragPairs.map((pair, index) => (
              <div
                key={pair.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span>زوج {index + 1}</span>
                  {dragPairs.length > 2 ? (
                    <button
                      type="button"
                      className="text-rose-500"
                      onClick={() => removePair(index)}
                    >
                      إزالة
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">
                      نص العنصر للسحب
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      placeholder="نص العنصر للسحب"
                      value={pair.label}
                      onChange={(event) =>
                        updatePair(index, "label", event.target.value)
                      }
                    />
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        رابط صورة العنصر (اختياري)
                      </label>
                      <input
                        type="url"
                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                        value={pair.image}
                        onChange={(event) =>
                          updatePair(index, "image", event.target.value)
                        }
                      />
                      {pair.image && (
                        <div className="mt-2">
                          <img
                            src={pair.image}
                            alt="معاينة"
                            className="h-32 w-full rounded-xl border border-slate-200 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">
                      الوصف داخل منطقة الإفلات
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      placeholder="الوصف داخل منطقة الإفلات"
                      value={pair.target}
                      onChange={(event) =>
                        updatePair(index, "target", event.target.value)
                      }
                    />
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        رابط صورة منطقة الإفلات (اختياري)
                      </label>
                      <input
                        type="url"
                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        placeholder="https://example.com/target-image.jpg"
                        value={pair.targetImage}
                        onChange={(event) =>
                          updatePair(index, "targetImage", event.target.value)
                        }
                      />
                      {pair.targetImage && (
                        <div className="mt-2">
                          <img
                            src={pair.targetImage}
                            alt="معاينة"
                            className="h-32 w-full rounded-xl border border-slate-200 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {dragPairs.length < 4 ? (
            <button
              type="button"
              className="w-full rounded-2xl border border-dashed border-slate-300 py-2 text-sm font-semibold text-slate-500"
              onClick={addPair}
            >
              + زوج جديد
            </button>
          ) : null}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-slate-600">المدة</label>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            placeholder="10 دقائق"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">المجال / الوحدة</label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
          >
            {skillOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">الفئة المستهدفة</label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            value={targetLevel}
            onChange={(event) =>
              setTargetLevel(event.target.value as (typeof levelOptions)[number])
            }
          >
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-2xl px-4 py-2 text-sm ${
            status === "error"
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        className="w-full rounded-2xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={status === "saving"}
      >
        {status === "saving" ? "جاري الحفظ..." : "حفظ النشاط"}
      </button>
    </form>
  );
}
