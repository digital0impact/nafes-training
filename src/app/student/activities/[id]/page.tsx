"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Activity, QuizContent } from "@/lib/activities";

type ActivityPageProps = {
  params: {
    id: string;
  };
};

type DragPair = {
  id: string;
  label: string;
  image?: string;
  target: string;
  targetImage?: string;
};

type BankQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  skill: string;
  points: number;
};

export default function ActivityPage({ params }: ActivityPageProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  
  // Multiple questions from bank state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [showFinalResult, setShowFinalResult] = useState(false);
  
  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showDragResult, setShowDragResult] = useState(false);

  useEffect(() => {
    async function loadActivity() {
      try {
        const response = await fetch("/api/activities");
        const data = await response.json();
        const allActivities = data.activities || [];
        const foundActivity = allActivities.find((a: Activity) => a.id === params.id);
        setActivity(foundActivity || null);
      } catch (error) {
        console.error("Error loading activity", error);
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [params.id]);

  const bankQuestions = (activity?.content as any)?.fromBank 
    ? ((activity?.content as any)?.questions as BankQuestion[]) || []
    : [];

  const isMultiQuestion = bankQuestions.length > 0;
  const currentQuestion = isMultiQuestion ? bankQuestions[currentQuestionIndex] : null;
  const currentAnswer = isMultiQuestion 
    ? questionAnswers[currentQuestion?.id || ""] || ""
    : selectedAnswer;

  const handleCheckAnswer = () => {
    if (isMultiQuestion && currentQuestion) {
      // Save answer for current question
      setQuestionAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: currentAnswer
      }));
      setShowResult(true);
    } else if (selectedAnswer) {
      setShowResult(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < bankQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(false);
      setSelectedAnswer("");
    } else {
      // Show final results
      setShowFinalResult(true);
    }
  };

  const getFinalScore = (): { correct: number; total: number; percentage: number; earnedPoints: number; totalPoints: number } | null => {
    if (!isMultiQuestion) return null;
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    bankQuestions.forEach((q) => {
      totalPoints += q.points;
      const userAnswer = questionAnswers[q.id];
      if (userAnswer === q.answer) {
        correct++;
        earnedPoints += q.points;
      }
    });
    
    return {
      correct,
      total: bankQuestions.length,
      percentage: Math.round((correct / bankQuestions.length) * 100),
      earnedPoints,
      totalPoints
    };
  };

  // Type guard to check if content is QuizContent
  const isQuizContent = (content: any): content is QuizContent => {
    return content && ('answer' in content || 'question' in content);
  };

  const isCorrect = isMultiQuestion && currentQuestion
    ? currentAnswer === currentQuestion.answer
    : activity?.content && isQuizContent(activity.content)
      ? selectedAnswer === activity.content.answer
      : false;

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-slate-500">جاري تحميل النشاط...</p>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="space-y-6">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-slate-900">النشاط غير متوفر</h1>
          <p className="mt-3 text-slate-600">
            لم نتمكن من العثور على النشاط المطلوب. تأكدي من الرابط أو تواصلي مع
            معلمتك.
          </p>
          <Link
            href="/student/activities"
            className="mt-4 inline-flex rounded-2xl bg-primary-600 px-6 py-2 font-semibold text-white"
          >
            عودي لقائمة الأنشطة
          </Link>
        </div>
      </main>
    );
  }

  // Drag and Drop handlers
  const handleDragStart = (pairId: string) => {
    setDraggedItem(pairId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetPairId: string) => {
    if (draggedItem) {
      setMatches((prev) => ({
        ...prev,
        [targetPairId]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const handleCheckDragDrop = () => {
    setShowDragResult(true);
  };

  const handleResetDragDrop = () => {
    setMatches({});
    setShowDragResult(false);
  };

  const getDragDropScore = () => {
    if (!activity.content || activity.type !== "drag-drop") return 0;
    const pairs = (activity.content as any).pairs as DragPair[];
    let correct = 0;
    pairs.forEach((pair) => {
      if (matches[pair.id] === pair.id) {
        correct++;
      }
    });
    return Math.round((correct / pairs.length) * 100);
  };

  const isDragDropComplete = () => {
    if (!activity.content || activity.type !== "drag-drop") return false;
    const pairs = (activity.content as any).pairs as DragPair[];
    return Object.keys(matches).length === pairs.length;
  };

  return (
    <main className="space-y-6">
      {/* Back Button */}
      <Link
        href="/student/activities"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        العودة لقائمة الأنشطة
      </Link>

      {activity.type === "quiz" ? (
        showFinalResult ? (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="card bg-gradient-to-br from-white to-primary-50">
              <div className="mb-3 flex items-center gap-3">
                <span className="badge bg-primary-100 text-primary-700">{activity.skill}</span>
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {activity.duration}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{activity.title}</h1>
            </div>

            {/* Final Results */}
            {(() => {
              const score = getFinalScore();
              if (!score) {
                return null;
              }
              return (
                <>
                  <div className={`card ${score.percentage === 100 ? "bg-emerald-50 border-emerald-200" : score.percentage >= 70 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{score.percentage === 100 ? "🎉" : score.percentage >= 70 ? "👏" : "📊"}</span>
                      <div className="flex-1">
                        <h2 className={`text-2xl font-bold ${score.percentage === 100 ? "text-emerald-900" : score.percentage >= 70 ? "text-blue-900" : "text-amber-900"}`}>
                          {score.percentage === 100 
                            ? "ممتاز! جميع الإجابات صحيحة" 
                            : `درجتك: ${score.percentage}%`}
                        </h2>
                        <p className="mt-2 text-sm text-slate-700">
                          {score.correct} من {score.total} إجابة صحيحة
                        </p>
                        {score.totalPoints > 0 && (
                          <p className="mt-1 text-sm text-slate-600">
                            النقاط: {score.earnedPoints} / {score.totalPoints}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Questions Review */}
                  <div className="card">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">مراجعة الإجابات</h3>
                    <div className="space-y-4">
                      {bankQuestions.map((q, index) => {
                        const userAnswer = questionAnswers[q.id];
                        const isCorrect = userAnswer === q.answer;
                        return (
                          <div
                            key={q.id}
                            className={`rounded-xl border-2 p-4 ${
                              isCorrect ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
                            }`}
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <span className={`text-2xl ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                                {isCorrect ? "✓" : "✗"}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900">سؤال {index + 1}</p>
                                <p className="mt-1 text-slate-700">{q.question}</p>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              {q.options.map((opt) => {
                                const isUserAnswer = opt === userAnswer;
                                const isCorrectAnswer = opt === q.answer;
                                return (
                                  <div
                                    key={opt}
                                    className={`rounded-lg px-3 py-2 text-sm ${
                                      isCorrectAnswer
                                        ? "bg-emerald-100 text-emerald-900 font-semibold"
                                        : isUserAnswer
                                          ? "bg-rose-100 text-rose-900"
                                          : "bg-slate-50 text-slate-600"
                                    }`}
                                  >
                                    {opt} {isCorrectAnswer && "✓"} {isUserAnswer && !isCorrectAnswer && "✗"}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/student/activities"
                    className="flex rounded-2xl bg-primary-600 py-4 text-center font-semibold text-white transition hover:bg-primary-700"
                  >
                    العودة للأنشطة
                  </Link>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="card bg-gradient-to-br from-white to-primary-50">
              <div className="mb-3 flex items-center gap-3">
                <span className="badge bg-primary-100 text-primary-700">{activity.skill}</span>
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {activity.duration}
                </span>
                {isMultiQuestion && (
                  <span className="badge bg-slate-100 text-slate-700">
                    سؤال {currentQuestionIndex + 1} من {bankQuestions.length}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{activity.title}</h1>
              {activity.image && (
                <div className="mt-4 overflow-hidden rounded-2xl">
                  <img src={activity.image} alt={activity.title} className="w-full object-cover" />
                </div>
              )}
            </div>

            {/* Question Card */}
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                {isMultiQuestion ? `السؤال ${currentQuestionIndex + 1}` : "السؤال"}
              </h2>
              {!isMultiQuestion && activity.content && isQuizContent(activity.content) && activity.content.image && (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  <img src={activity.content.image} alt="صورة السؤال" className="w-full object-cover" />
                </div>
              )}
              <p className="text-xl leading-relaxed text-slate-700">
                {isMultiQuestion && currentQuestion
                  ? currentQuestion.question
                  : (activity.content && isQuizContent(activity.content) && activity.content.question) || activity.description}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {((isMultiQuestion && currentQuestion
                ? currentQuestion.options
                : (activity.content && isQuizContent(activity.content) && activity.content.options) || []
              )).map((option: string, index: number) => {
                const isSelected = (isMultiQuestion ? currentAnswer : selectedAnswer) === option;
                const isAnswer = isMultiQuestion && currentQuestion
                  ? option === currentQuestion.answer
                  : activity.content && isQuizContent(activity.content)
                    ? option === activity.content.answer
                    : false;
                const showAnswer = showResult && isAnswer;

                return (
                  <label
                    key={`${option}-${index}`}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-all ${
                      showResult
                        ? showAnswer
                          ? "border-emerald-500 bg-emerald-50"
                          : isSelected
                            ? "border-rose-500 bg-rose-50"
                            : "border-slate-200 bg-white"
                        : isSelected
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name={isMultiQuestion ? `quiz-option-${currentQuestion?.id}` : "quiz-option"}
                      className="h-5 w-5 text-primary-600"
                      value={option}
                      checked={isSelected}
                      onChange={(e) => {
                        if (isMultiQuestion) {
                          setQuestionAnswers((prev) => ({
                            ...prev,
                            [currentQuestion?.id || ""]: e.target.value
                          }));
                        } else {
                          setSelectedAnswer(e.target.value);
                        }
                      }}
                      disabled={showResult}
                    />
                    <span className="flex-1 text-slate-700">{option}</span>
                    {showResult && showAnswer && (
                      <span className="text-2xl">✓</span>
                    )}
                    {showResult && isSelected && !showAnswer && (
                      <span className="text-2xl text-rose-500">✗</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Hint */}
            {(() => {
              const quizContent = activity.content && isQuizContent(activity.content) ? activity.content : null;
              return !isMultiQuestion && quizContent?.hint && !showResult && (
                <div className="card bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-semibold text-amber-900">تلميح</p>
                      <p className="mt-1 text-sm text-amber-800">{quizContent.hint}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Result Message */}
            {showResult && (
              <div className={`card ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{isCorrect ? "🎉" : "😔"}</span>
                  <div>
                    <p className={`font-bold ${isCorrect ? "text-emerald-900" : "text-rose-900"}`}>
                      {isCorrect ? "إجابة صحيحة! ممتاز!" : "إجابة غير صحيحة"}
                    </p>
                    {!isCorrect && (
                      <p className="mt-1 text-sm text-rose-800">
                        الإجابة الصحيحة هي: {isMultiQuestion && currentQuestion
                          ? currentQuestion.answer
                          : activity.content && isQuizContent(activity.content)
                            ? activity.content.answer || ''
                            : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex gap-3">
              {!showResult ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!currentAnswer && !selectedAnswer}
                  className="flex-1 rounded-2xl bg-primary-600 py-4 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تحقق من الإجابة
                </button>
              ) : isMultiQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 rounded-2xl bg-primary-600 py-4 font-semibold text-white transition hover:bg-primary-700"
                >
                  {currentQuestionIndex < bankQuestions.length - 1 ? "السؤال التالي" : "عرض النتيجة النهائية"}
                </button>
              ) : (
                <Link
                  href="/student/activities"
                  className="flex-1 rounded-2xl bg-primary-600 py-4 text-center font-semibold text-white transition hover:bg-primary-700"
                >
                  العودة للأنشطة
                </Link>
              )}
            </div>
          </div>
        )
      ) : activity.type === "drag-drop" ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="card bg-gradient-to-br from-white to-primary-50">
            <div className="mb-3 flex items-center gap-3">
              <span className="badge bg-primary-100 text-primary-700">{activity.skill}</span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {activity.duration}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{activity.title}</h1>
            {activity.image && (
              <div className="mt-4 overflow-hidden rounded-2xl">
                <img src={activity.image} alt={activity.title} className="w-full object-cover" />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="card bg-blue-50 border-blue-200">
            <h2 className="mb-2 text-lg font-semibold text-blue-900">
              {(activity.content as any)?.prompt || "اسحبي العناصر إلى الأماكن المناسبة"}
            </h2>
            {(activity.content as any)?.instructions && (
              <p className="text-sm text-blue-800">{(activity.content as any).instructions}</p>
            )}
          </div>

          {/* Drag and Drop Area */}
          {!showDragResult ? (
            <div className="space-y-6">
              {/* Draggable Items */}
              <div className="card">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span>📌</span>
                  <span>المصطلحات (اسحبيها إلى التعريفات)</span>
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {((activity.content as any)?.pairs as DragPair[])?.map((pair) => {
                    const isMatched = Object.values(matches).includes(pair.id);
                    const isDragging = draggedItem === pair.id;
                    
                    return (
                      <div
                        key={pair.id}
                        draggable={!isMatched}
                        onDragStart={() => !isMatched && handleDragStart(pair.id)}
                        className={`group rounded-2xl border-2 p-4 transition-all ${
                          isMatched
                            ? "border-emerald-500 bg-emerald-50 opacity-60 cursor-not-allowed"
                            : isDragging
                              ? "border-primary-500 bg-primary-100 scale-95 cursor-grabbing"
                              : "border-primary-300 bg-primary-50 cursor-grab hover:border-primary-500 hover:shadow-md active:cursor-grabbing"
                        }`}
                      >
                        {pair.image ? (
                          <div className="mb-3 overflow-hidden rounded-xl">
                            <img
                              src={pair.image}
                              alt={pair.label}
                              className="h-24 w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : null}
                        <p className="text-center text-base font-bold text-slate-900">{pair.label}</p>
                        {isMatched && (
                          <div className="mt-2 text-center text-xl text-emerald-600">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drop Zones */}
              <div className="card">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span>📝</span>
                  <span>التعريفات (أسقطي المصطلح المناسب هنا)</span>
                </h3>
                <div className="space-y-3">
                  {((activity.content as any)?.pairs as DragPair[])?.map((pair) => {
                    const matchedItemId = matches[pair.id];
                    const matchedPair = ((activity.content as any)?.pairs as DragPair[])?.find(
                      (p) => p.id === matchedItemId
                    );
                    const isCorrect = matchedItemId === pair.id;
                    
                    return (
                      <div
                        key={pair.id}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(pair.id)}
                        className={`group rounded-2xl border-2 p-5 transition-all ${
                          matchedItemId
                            ? isCorrect
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-rose-500 bg-rose-50"
                            : "border-dashed border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/30"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {matchedPair ? (
                            <>
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white ${
                                isCorrect ? "bg-emerald-500" : "bg-rose-500"
                              }`}>
                                {matchedPair.label.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <p className="font-bold text-slate-900">{matchedPair.label}</p>
                                  {showDragResult && (
                                    <span className={`text-xl ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                                      {isCorrect ? "✓" : "✗"}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-slate-600">{pair.target}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                                ?
                              </div>
                              <div className="flex-1">
                                <p className="mb-1 font-medium text-slate-700">{pair.target}</p>
                                <p className="text-sm text-slate-400">
                                  اسحبي المصطلح المناسب هنا
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        {matchedPair?.image && (
                          <div className="mt-4 overflow-hidden rounded-xl">
                            <img
                              src={matchedPair.image}
                              alt={matchedPair.label}
                              className="h-32 w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        {pair.targetImage && (
                          <div className="mt-4 overflow-hidden rounded-xl">
                            <img
                              src={pair.targetImage}
                              alt={pair.target}
                              className="h-32 w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleCheckDragDrop}
                  disabled={!isDragDropComplete()}
                  className="flex-1 rounded-2xl bg-primary-600 py-4 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تحقق من الإجابات
                </button>
                {Object.keys(matches).length > 0 && (
                  <button
                    onClick={handleResetDragDrop}
                    className="rounded-2xl border-2 border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    إعادة المحاولة
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results */}
              <div className={`card ${getDragDropScore() === 100 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{getDragDropScore() === 100 ? "🎉" : "📊"}</span>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${getDragDropScore() === 100 ? "text-emerald-900" : "text-amber-900"}`}>
                      {getDragDropScore() === 100 ? "ممتاز! جميع الإجابات صحيحة" : `درجتك: ${getDragDropScore()}%`}
                    </h3>
                    <p className="mt-2 text-sm text-slate-700">
                      {getDragDropScore() === 100
                        ? "لقد أتممت النشاط بنجاح!"
                        : "جربي مرة أخرى لتحسين النتيجة"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Correct Answers Display */}
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">الإجابات الصحيحة</h3>
                <div className="space-y-3">
                  {((activity.content as any)?.pairs as DragPair[])?.map((pair) => {
                    const isCorrect = matches[pair.id] === pair.id;
                    return (
                      <div
                        key={pair.id}
                        className={`rounded-xl border-2 p-4 ${
                          isCorrect ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                            {isCorrect ? "✓" : "✗"}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{pair.label}</p>
                            <p className="text-sm text-slate-600">→ {pair.target}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleResetDragDrop}
                  className="flex-1 rounded-2xl border-2 border-primary-600 bg-white py-4 font-semibold text-primary-600 transition hover:bg-primary-50"
                >
                  إعادة المحاولة
                </button>
                <Link
                  href="/student/activities"
                  className="flex-1 rounded-2xl bg-primary-600 py-4 text-center font-semibold text-white transition hover:bg-primary-700"
                >
                  العودة للأنشطة
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900">{activity.title}</h1>
          <p className="mt-3 text-slate-600">
            هذا النشاط لم يحصل بعد على واجهة تفاعلية. سيتم إتاحته قريباً.
          </p>
        </div>
      )}
    </main>
  );
}
