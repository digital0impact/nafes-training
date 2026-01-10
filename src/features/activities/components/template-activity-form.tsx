"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { learningOutcomes } from "@/lib/data";
import { QuestionSelector } from "@/components/tests/question-selector";
import { simulationQuestions } from "@/lib/simulation-questions";
import type { ActivityTemplate } from "./activity-template-selector";
import type { SimulationQuestion } from "@/lib/simulation-questions";

const levelOptions = ["متقدمة", "متوسطة", "تحتاج دعم"] as const;
const skillOptions = ["علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"];

type DragPair = {
  id: string;
  label: string;
  image?: string;
  target: string;
  targetImage?: string;
};

type OrderingItem = {
  id: string;
  text: string;
  order: number;
};

type FillBlankItem = {
  id: string;
  text: string;
  blank: string;
  answer: string;
};

interface TemplateActivityFormProps {
  template: ActivityTemplate;
  onCancel: () => void;
  onSuccess: () => void;
}

export function TemplateActivityForm({ template, onCancel, onSuccess }: TemplateActivityFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [skill, setSkill] = useState(skillOptions[0]);
  const [targetLevel, setTargetLevel] = useState<typeof levelOptions[number]>(levelOptions[1]);
  const [outcomeLesson, setOutcomeLesson] = useState("");
  const [activityImage, setActivityImage] = useState("");

  // Quiz fields
  const [useQuestionBank, setUseQuestionBank] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizImage, setQuizImage] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [hint, setHint] = useState("");

  // Drag-drop fields
  const [dragPrompt, setDragPrompt] = useState("");
  const [dragInstructions, setDragInstructions] = useState("");
  const [dragPairs, setDragPairs] = useState<DragPair[]>([
    { id: "1", label: "", target: "" },
    { id: "2", label: "", target: "" }
  ]);

  // Ordering fields
  const [orderingPrompt, setOrderingPrompt] = useState("");
  const [orderingItems, setOrderingItems] = useState<OrderingItem[]>([
    { id: "1", text: "", order: 1 },
    { id: "2", text: "", order: 2 }
  ]);

  // Fill-blank fields
  const [fillBlankPrompt, setFillBlankPrompt] = useState("");
  const [fillBlankItems, setFillBlankItems] = useState<FillBlankItem[]>([
    { id: "1", text: "", blank: "", answer: "" }
  ]);

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>();

  const createPair = (): DragPair => ({
    id: Math.random().toString(36).slice(2),
    label: "",
    image: "",
    target: "",
    targetImage: ""
  });

  function updatePair(index: number, field: keyof DragPair, value: string) {
    setDragPairs((prev) =>
      prev.map((pair, idx) => (idx === index ? { ...pair, [field]: value } : pair))
    );
  }

  function addPair() {
    setDragPairs((prev) => [...prev, createPair()]);
  }

  function removePair(index: number) {
    setDragPairs((prev) => prev.filter((_, idx) => idx !== index));
  }

  function addOrderingItem() {
    setOrderingItems((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), text: "", order: prev.length + 1 }
    ]);
  }

  function updateOrderingItem(index: number, field: keyof OrderingItem, value: string | number) {
    setOrderingItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  }

  function removeOrderingItem(index: number) {
    setOrderingItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  function addFillBlankItem() {
    setFillBlankItems((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), text: "", blank: "", answer: "" }
    ]);
  }

  function updateFillBlankItem(index: number, field: keyof FillBlankItem, value: string) {
    setFillBlankItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  }

  function removeFillBlankItem(index: number) {
    setFillBlankItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(undefined);

    if (!title.trim() || !description.trim() || !duration.trim()) {
      setStatus("error");
      setMessage("الرجاء إدخال جميع الحقول المطلوبة");
      return;
    }

    let content: any = {};

    switch (template.type) {
      case "quiz":
        if (useQuestionBank) {
          if (selectedQuestionIds.size === 0) {
            setStatus("error");
            setMessage("الرجاء اختيار سؤال واحد على الأقل من بنك الأسئلة");
            return;
          }
          // Use questions from bank
          const selectedQuestions = Array.from(selectedQuestionIds)
            .map((id) => simulationQuestions.find((q) => q.id === id))
            .filter((q): q is SimulationQuestion => q !== undefined);
          
          content = {
            questions: selectedQuestions.map((q) => ({
              id: q.id,
              question: q.text,
              options: q.choices,
              answer: q.correctAnswer,
              skill: q.skill,
              points: q.points
            })),
            fromBank: true
          };
        } else {
          if (!quizQuestion.trim() || !optionA.trim() || !optionB.trim() || !correctAnswer.trim()) {
            setStatus("error");
            setMessage("الرجاء إكمال جميع حقول السؤال");
            return;
          }
          content = {
            question: quizQuestion,
            options: [optionA, optionB, optionC, optionD].filter((opt) => opt.trim()),
            answer: correctAnswer,
            hint: hint.trim() || undefined,
            image: quizImage.trim() || undefined,
            fromBank: false
          };
        }
        break;

      case "drag-drop":
        if (!dragPrompt.trim() || dragPairs.some((p) => !p.label.trim() || !p.target.trim())) {
          setStatus("error");
          setMessage("الرجاء إكمال جميع أزواج المطابقة");
          return;
        }
        content = {
          prompt: dragPrompt,
          instructions: dragInstructions.trim() || undefined,
          pairs: dragPairs
        };
        break;

      case "ordering":
        if (!orderingPrompt.trim() || orderingItems.some((item) => !item.text.trim())) {
          setStatus("error");
          setMessage("الرجاء إكمال جميع عناصر الترتيب");
          return;
        }
        content = {
          prompt: orderingPrompt,
          items: orderingItems.map((item) => ({
            id: item.id,
            text: item.text,
            order: item.order
          }))
        };
        break;

      case "fill-blank":
        if (!fillBlankPrompt.trim() || fillBlankItems.some((item) => !item.text.trim() || !item.answer.trim())) {
          setStatus("error");
          setMessage("الرجاء إكمال جميع عناصر ملء الفراغات");
          return;
        }
        content = {
          prompt: fillBlankPrompt,
          items: fillBlankItems
        };
        break;
    }

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          duration,
          skill,
          targetLevel,
          outcomeLesson: outcomeLesson.trim() || undefined,
          type: template.type,
          content,
          image: activityImage.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "فشل حفظ النشاط");
      }

      setStatus("success");
      setMessage("تم حفظ النشاط بنجاح!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ النشاط.");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إنشاء نشاط: {template.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{template.description}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          إلغاء
        </button>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">معلومات النشاط</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-600">عنوان النشاط *</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">المدة *</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              placeholder="مثال: 10 دقائق"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">وصف النشاط *</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-slate-600">المجال</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            >
              {skillOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">المستوى</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value as typeof levelOptions[number])}
            >
              {levelOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">ناتج التعلم</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={outcomeLesson}
              onChange={(e) => setOutcomeLesson(e.target.value)}
            >
              <option value="">اختر ناتج التعلم</option>
              {learningOutcomes
                .filter((outcome) => outcome.domain === skill)
                .map((outcome) => (
                  <option key={outcome.lesson} value={outcome.lesson}>
                    {outcome.lesson}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">صورة النشاط (رابط)</label>
          <input
            type="url"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            placeholder="https://example.com/image.jpg"
            value={activityImage}
            onChange={(e) => setActivityImage(e.target.value)}
          />
        </div>
      </div>

      {/* Template-specific content */}
      <div className="space-y-4 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900">محتوى النشاط</h3>

        {template.type === "quiz" && (
          <div className="space-y-4">
            {/* Question Bank Option */}
            <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">استخدام بنك الأسئلة</h4>
                  <p className="text-sm text-slate-600">استخدمي أسئلة جاهزة من بنك الأسئلة</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useQuestionBank}
                    onChange={(e) => {
                      setUseQuestionBank(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedQuestionIds(new Set());
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {useQuestionBank && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowQuestionSelector(true)}
                    className="w-full rounded-2xl border-2 border-primary-500 bg-white px-4 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
                  >
                    📚 اختيار الأسئلة من بنك الأسئلة ({selectedQuestionIds.size} محدد)
                  </button>
                  {selectedQuestionIds.size > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">الأسئلة المختارة:</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Array.from(selectedQuestionIds).map((qId) => {
                          const question = simulationQuestions.find((q) => q.id === qId);
                          if (!question) return null;
                          return (
                            <div
                              key={qId}
                              className="flex items-center justify-between rounded-xl bg-white p-2 border border-slate-200"
                            >
                              <div className="flex-1">
                                <p className="text-sm text-slate-900">{question.text}</p>
                                <p className="text-xs text-slate-500">{question.skill}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSet = new Set(selectedQuestionIds);
                                  newSet.delete(qId);
                                  setSelectedQuestionIds(newSet);
                                }}
                                className="text-rose-500 hover:text-rose-700 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!useQuestionBank && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">السؤال *</label>
                  <textarea
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                    rows={2}
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">صورة السؤال (رابط)</label>
                  <input
                    type="url"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                    value={quizImage}
                    onChange={(e) => setQuizImage(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">الخيار أ *</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">الخيار ب *</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">الخيار ج</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">الخيار د</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">الإجابة الصحيحة *</label>
                    <select
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      required
                    >
                      <option value="">اختر الإجابة</option>
                      {optionA && <option value={optionA}>أ: {optionA}</option>}
                      {optionB && <option value={optionB}>ب: {optionB}</option>}
                      {optionC && <option value={optionC}>ج: {optionC}</option>}
                      {optionD && <option value={optionD}>د: {optionD}</option>}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">تلميح</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={hint}
                      onChange={(e) => setHint(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {template.type === "drag-drop" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">السؤال/التعليمات *</label>
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                value={dragPrompt}
                onChange={(e) => setDragPrompt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">تعليمات إضافية</label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                rows={2}
                value={dragInstructions}
                onChange={(e) => setDragInstructions(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-600">أزواج المطابقة *</label>
                <button
                  type="button"
                  onClick={addPair}
                  className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  + إضافة زوج
                </button>
              </div>
              {dragPairs.map((pair, index) => (
                <div key={pair.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">زوج {index + 1}</span>
                    {dragPairs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePair(index)}
                        className="text-rose-500 text-sm"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">العنصر</label>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        value={pair.label}
                        onChange={(e) => updatePair(index, "label", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">المطابق</label>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        value={pair.target}
                        onChange={(e) => updatePair(index, "target", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {template.type === "ordering" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">السؤال/التعليمات *</label>
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                value={orderingPrompt}
                onChange={(e) => setOrderingPrompt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-600">عناصر الترتيب *</label>
                <button
                  type="button"
                  onClick={addOrderingItem}
                  className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  + إضافة عنصر
                </button>
              </div>
              {orderingItems.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">عنصر {index + 1}</span>
                    {orderingItems.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOrderingItem(index)}
                        className="text-rose-500 text-sm"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">النص *</label>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        value={item.text}
                        onChange={(e) => updateOrderingItem(index, "text", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">الترتيب الصحيح *</label>
                      <input
                        type="number"
                        min="1"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        value={item.order}
                        onChange={(e) => updateOrderingItem(index, "order", parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {template.type === "fill-blank" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">السؤال/النص *</label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                rows={3}
                value={fillBlankPrompt}
                onChange={(e) => setFillBlankPrompt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-600">عناصر ملء الفراغات *</label>
                <button
                  type="button"
                  onClick={addFillBlankItem}
                  className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  + إضافة عنصر
                </button>
              </div>
              {fillBlankItems.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">عنصر {index + 1}</span>
                    {fillBlankItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFillBlankItem(index)}
                        className="text-rose-500 text-sm"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">النص *</label>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        value={item.text}
                        onChange={(e) => updateFillBlankItem(index, "text", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-600">الفراغ *</label>
                        <input
                          type="text"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                          placeholder="النص الذي سيظهر كفراغ"
                          value={item.blank}
                          onChange={(e) => updateFillBlankItem(index, "blank", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600">الإجابة الصحيحة *</label>
                        <input
                          type="text"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                          value={item.answer}
                          onChange={(e) => updateFillBlankItem(index, "answer", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      <div className="flex gap-3 border-t border-slate-200 pt-4">
        <button
          type="submit"
          className="flex-1 rounded-2xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
          disabled={status === "saving"}
        >
          {status === "saving" ? "جاري الحفظ..." : "حفظ النشاط"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600"
        >
          إلغاء
        </button>
      </div>

      {/* Question Selector Modal */}
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
          skill={skill}
          relatedOutcome={outcomeLesson}
          onClose={() => setShowQuestionSelector(false)}
        />
      )}
    </form>
  );
}
