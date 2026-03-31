"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getQuestionsForModel,
  getQuestionsFromIds,
  getRelatedOutcomes,
  getPrebuiltTestModels,
  getPrebuiltDiagnosticTests,
  getAllTestModels,
  type TestModel,
} from "@/lib/test-models";
import { type SimulationQuestion } from "@/lib/simulation-questions";
import { getInfographicsForLesson } from "@/lib/learning-outcome-infographics";
import { useStudentStore } from "@/store/student-store";

export default function SimulationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const student = useStudentStore((state) => state.student);
  const modelId = searchParams.get("model");
  
  const [currentModel, setCurrentModel] = useState<TestModel | null>(null);
  const [questions, setQuestions] = useState<SimulationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewLater, setReviewLater] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [initialTime, setInitialTime] = useState(20 * 60);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load model and questions (من النماذج المحلية أو من API إن كان الاختبار مُشاراً)
  useEffect(() => {
    if (!modelId) {
      router.push("/student/simulation/select");
      return;
    }

    const prebuilt = getPrebuiltTestModels();
    const diagnostic = getPrebuiltDiagnosticTests();
    const custom = getAllTestModels();
    const localModel = [...prebuilt, ...diagnostic, ...custom].find((m) => m.id === modelId);

    if (localModel) {
      setCurrentModel(localModel);
      setQuestions(getQuestionsForModel(modelId));
      setTimeRemaining(localModel.duration * 60);
      setInitialTime(localModel.duration * 60);
      return;
    }

    if (!student?.id) {
      router.push("/student/simulation/select");
      return;
    }

    let cancelled = false;
    fetch(`/api/student/test-model/${encodeURIComponent(modelId)}?studentId=${encodeURIComponent(student.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (cancelled || !raw) {
          if (!raw) router.push("/student/simulation/select");
          return;
        }
        const model: TestModel = {
          id: raw.id,
          title: raw.title,
          description: raw.description ?? "",
          period: raw.period,
          weeks: Array.isArray(raw.weeks) ? raw.weeks : [],
          relatedOutcomes: Array.isArray(raw.relatedOutcomes) ? raw.relatedOutcomes : [],
          questionIds: Array.isArray(raw.questionIds) ? raw.questionIds : [],
          duration: raw.duration ?? 20,
          skill: raw.skill,
          testType: raw.testType ?? "normal",
          year: raw.year,
        };
        setCurrentModel(model);
        setQuestions(getQuestionsFromIds(model.questionIds));
        const duration = model.duration * 60;
        setTimeRemaining(duration);
        setInitialTime(duration);
      })
      .catch(() => {
        if (!cancelled) router.push("/student/simulation/select");
      });

    return () => { cancelled = true; };
  }, [modelId, student?.id, router]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Timer effect
  useEffect(() => {
    if (!isTestComplete && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestComplete, showResults]);

  // Load saved answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(answers[currentQuestion.id] || "");
    }
  }, [currentQuestion?.id, answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReviewLater = () => {
    const newReview = new Set(reviewLater);
    if (newReview.has(currentQuestion.id)) {
      newReview.delete(currentQuestion.id);
    } else {
      newReview.add(currentQuestion.id);
    }
    setReviewLater(newReview);
  };

  const handleFinishTest = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTestComplete(true);
    
    // حساب النتيجة
    const score = calculateScore();
    const timeSpent = initialTime - timeRemaining;
    
    // حفظ النتيجة في قاعدة البيانات
    if (student) {
      setSaving(true);
      try {
        await fetch("/api/training-attempts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: student.name,
            classCode: student.classCode,
            studentDbId: student.id,
            testModelId: currentModel?.id,
            testModelTitle: currentModel?.title,
            skill: currentModel?.skill,
            answers,
            score: score.correct,
            totalQuestions: score.total,
            percentage: score.percentage,
            timeSpent,
          }),
        });
      } catch (error) {
        console.error("Error saving training attempt:", error);
      } finally {
        setSaving(false);
      }
    }
    
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100)
    };
  };

  const getQuestionStatus = (questionIndex: number) => {
    const q = questions[questionIndex];
    if (answers[q.id]) return "answered";
    if (reviewLater.has(q.id)) return "review";
    return "unanswered";
  };

  if (!currentModel || questions.length === 0) {
    return (
      <main className="space-y-6">
        <div className="card text-center">
          <p className="text-slate-600">جاري تحميل الاختبار...</p>
        </div>
      </main>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const relatedOutcomes = getRelatedOutcomes(currentModel.id);
    const timeSpent = initialTime - timeRemaining;
    const missingOutcomeSet = new Set(
      questions
        .filter((q) => answers[q.id] !== q.correctAnswer)
        .map((q) => q.relatedOutcome)
        .filter((outcome): outcome is string => Boolean(outcome))
    );
    const missingOutcomes = relatedOutcomes.filter((outcome) =>
      missingOutcomeSet.has(outcome.lesson)
    );
    
    return (
      <main className="space-y-6">
        <div className="card bg-gradient-to-br from-white to-primary-50">
          <div className="text-center">
            <div className="mb-4 text-6xl">
              {score.percentage >= 80 ? "🎉" : score.percentage >= 60 ? "👍" : "📚"}
            </div>
            <h1 className="text-4xl font-bold text-slate-900">تم إنهاء الاختبار</h1>
            <p className="mt-2 text-slate-600">{currentModel.title}</p>
            {saving && (
              <p className="mt-2 text-sm text-slate-500">جاري حفظ النتيجة...</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card text-center">
            <p className="text-sm text-slate-500">الدرجة</p>
            <p className="text-4xl font-bold text-primary-600">
              {score.correct} / {score.total}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-500">النسبة المئوية</p>
            <p className="text-4xl font-bold text-primary-600">{score.percentage}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-500">الوقت المستخدم</p>
            <p className="text-4xl font-bold text-primary-600">
              {formatTime(timeSpent)}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">تفاصيل الإجابات</h2>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const linkedOutcome = q.relatedOutcome;
              const infographics = getInfographicsForLesson(linkedOutcome);
              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border-2 p-4 ${
                    isCorrect ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      السؤال {index + 1}: {q.text}
                    </span>
                    <span className={`text-2xl ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">إجابتك:</span>{" "}
                      <span className={isCorrect ? "text-emerald-700" : "text-rose-700"}>
                        {userAnswer || "لم تجيبي"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <>
                        <p>
                          <span className="font-semibold">الإجابة الصحيحة:</span>{" "}
                          <span className="text-emerald-700">{q.correctAnswer}</span>
                        </p>
                        <p>
                          <span className="font-semibold">المهارة المرتبطة:</span>{" "}
                          <span className="rounded-md bg-primary-100 px-2 py-0.5 text-primary-700">
                            {q.skill}
                          </span>
                        </p>
                        {linkedOutcome && (
                          <p>
                            <span className="font-semibold">ناتج التعلم:</span>{" "}
                            <span className="text-slate-700">{linkedOutcome}</span>
                          </p>
                        )}
                        {infographics.length > 0 && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                              الإنفوجرافيك المرتبط بالمهارة
                            </p>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                              {infographics.map((infographic, infographicIndex) => (
                                <a
                                  key={`${q.id}-${infographic.url}-${infographicIndex}`}
                                  href={infographic.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                                  title={infographic.title}
                                >
                                  <img
                                    src={infographic.url}
                                    alt={infographic.title}
                                    className="h-24 w-full object-cover transition group-hover:scale-[1.02]"
                                    loading="lazy"
                                    onError={(event) => {
                                      event.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <div className="border-t border-slate-200 px-2 py-1 text-center text-[11px] text-slate-600">
                                    {infographic.title}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing Learning Outcomes Only */}
        {missingOutcomes.length > 0 && (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">نواتج التعلم التي تحتاج مراجعة</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {missingOutcomes.map((outcome) => {
                const outcomeInfographics = getInfographicsForLesson(outcome.lesson);
                const firstInfographic = outcomeInfographics[0];
                return (
                <div key={outcome.lesson} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="badge bg-primary-100 text-primary-700">{outcome.domain}</span>
                    <span className="text-xs text-slate-500">{outcome.week}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">{outcome.lesson}</h4>
                  <p className="mt-1 text-sm text-slate-600">{outcome.outcome}</p>
                  {firstInfographic && (
                    <a
                      href={firstInfographic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block overflow-hidden rounded-lg border border-slate-200 bg-white"
                      title={firstInfographic.title}
                    >
                      <img
                        src={firstInfographic.url}
                        alt={firstInfographic.title}
                        className="h-24 w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  )}
                </div>
              )})}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/student/simulation/select"
            className="flex-1 rounded-2xl bg-primary-600 py-4 text-center font-semibold text-white transition hover:bg-primary-700"
          >
            اختيار نموذج آخر
          </Link>
          <Link
            href="/student"
            className="rounded-2xl border-2 border-primary-600 bg-white px-6 py-4 font-semibold text-primary-600 transition hover:bg-primary-50"
          >
            العودة للصفحة الرئيسية
          </Link>
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setReviewLater(new Set());
              setTimeRemaining(currentModel.duration * 60);
              setIsTestComplete(false);
            }}
            className="rounded-2xl border-2 border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-primary-600">محاكاة اختبار نافس</p>
          <h1 className="text-3xl font-bold text-slate-900">{currentModel.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{currentModel.description}</p>
        </div>
        <div className="flex gap-4">
          <div
            className={`rounded-2xl px-6 py-3 text-center ${
              timeRemaining < 300 ? "bg-rose-50" : "bg-primary-50"
            }`}
          >
            <p className={`text-xs ${timeRemaining < 300 ? "text-rose-600" : "text-primary-600"}`}>
              الوقت المتبقي
            </p>
            <p
              className={`text-2xl font-bold ${
                timeRemaining < 300 ? "text-rose-700" : "text-primary-700"
              }`}
            >
              {formatTime(timeRemaining)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-6 py-3 text-center">
            <p className="text-xs text-slate-500">التقدم</p>
            <p className="text-2xl font-bold text-slate-900">
              {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>
        </div>
      </header>

      {currentQuestion && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Question Section */}
          <section className="card space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">
                السؤال {currentQuestion.number} من {totalQuestions}
              </p>
              <div className="flex items-center gap-2">
                <span className="badge bg-primary-100 text-primary-700">{currentQuestion.skill}</span>
                {reviewLater.has(currentQuestion.id) && (
                  <span className="badge bg-amber-100 text-amber-700">مراجعة لاحقاً</span>
                )}
              </div>
            </div>

            <p className="text-xl font-semibold leading-relaxed text-slate-900">
              {currentQuestion.text}
            </p>

            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
              const isSelected = selectedAnswer === choice;
              return (
                <label
                  key={choice}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-5 py-4 transition-all ${
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    className="h-5 w-5 text-primary-600"
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(choice)}
                  />
                  <span className="flex-1 text-slate-700">{choice}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <button
              onClick={handleReviewLater}
              className={`rounded-2xl border-2 px-5 py-2 font-semibold transition ${
                reviewLater.has(currentQuestion.id)
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {reviewLater.has(currentQuestion.id) ? "إلغاء المراجعة" : "مراجعة لاحقاً"}
            </button>
            <div className="flex gap-3">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  السابق
                </button>
              )}
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="rounded-2xl bg-primary-600 px-6 py-2 font-semibold text-white transition hover:bg-primary-700"
                >
                  التالي
                </button>
              ) : (
                <button
                  onClick={handleFinishTest}
                  className="rounded-2xl bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700"
                >
                  إنهاء الاختبار
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Questions Navigator */}
        <aside className="card">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">قائمة الأسئلة</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
              const status = getQuestionStatus(index);
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-primary-600 text-white ring-2 ring-primary-300"
                      : status === "answered"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : status === "review"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-emerald-100"></div>
              <span>مُجاب</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-amber-100"></div>
              <span>مراجعة لاحقاً</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-slate-100"></div>
              <span>غير مُجاب</span>
            </div>
          </div>
          <button
            onClick={handleFinishTest}
            className="mt-4 w-full rounded-2xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700"
          >
            إنهاء الاختبار الآن
          </button>
        </aside>
        </div>
      )}
    </main>
  );
}
