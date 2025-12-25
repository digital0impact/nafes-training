"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { simulationQuestions } from "@/lib/simulation-questions";
import { learningOutcomes } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { PageBackground } from "@/components/layout/page-background";
import { TeacherHeader } from "@/components/teacher/teacher-header";

const skillOptions = ["الكل", "علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"];

type TabType = "all" | "by-skill" | "by-outcome" | "add";

export default function QuestionsBankPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedSkill, setSelectedSkill] = useState("الكل");
  const [selectedOutcome, setSelectedOutcome] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique outcomes for filter
  const uniqueOutcomes = useMemo(() => {
    const outcomes = learningOutcomes.map((outcome) => outcome.lesson);
    return Array.from(new Set(outcomes));
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return simulationQuestions.filter((question) => {
      const skillMatch = selectedSkill === "الكل" || question.skill === selectedSkill;
      const searchMatch =
        searchQuery === "" ||
        question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.choices.some((choice) =>
          choice.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Find related outcome for this question
      let outcomeMatch = true;
      if (selectedOutcome !== "الكل") {
        if (question.relatedOutcome) {
          // Use direct relationship if available
          outcomeMatch = question.relatedOutcome === selectedOutcome;
        } else {
          // Try to match question with outcome based on keywords
          const relatedOutcomes = learningOutcomes.filter(
            (outcome) =>
              outcome.domain === question.skill &&
              (question.text.includes(outcome.lesson.substring(0, 10)) ||
                outcome.lesson.includes(question.text.substring(0, 10)))
          );
          outcomeMatch = relatedOutcomes.some((outcome) => outcome.lesson === selectedOutcome);
        }
      }

      return skillMatch && searchMatch && outcomeMatch;
    });
  }, [selectedSkill, selectedOutcome, searchQuery]);

  // Group questions by skill
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof simulationQuestions> = {};
    filteredQuestions.forEach((question) => {
      if (!groups[question.skill]) {
        groups[question.skill] = [];
      }
      groups[question.skill].push(question);
    });
    return groups;
  }, [filteredQuestions]);

  const skillColors: Record<string, string> = {
    "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
    "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <TeacherHeader />
        
        <header className="card bg-gradient-to-br from-white to-primary-50">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900">بنك الأسئلة</h1>
            <p className="mt-2 text-slate-600">
              إدارة وتنظيم جميع الأسئلة المتاحة للاختبارات والأنشطة
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-primary-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "text-primary-700 border-primary-600"
                  : "text-slate-500 border-transparent hover:text-primary-600"
              }`}
            >
              جميع الأسئلة ({simulationQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab("by-skill")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "by-skill"
                  ? "text-blue-700 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-blue-600"
              }`}
            >
              حسب المجال
            </button>
            <button
              onClick={() => setActiveTab("by-outcome")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "by-outcome"
                  ? "text-emerald-700 border-emerald-600"
                  : "text-slate-500 border-transparent hover:text-emerald-600"
              }`}
            >
              حسب ناتج التعلم
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "add"
                  ? "text-amber-700 border-amber-600"
                  : "text-slate-500 border-transparent hover:text-amber-600"
              }`}
            >
              إضافة سؤال جديد
            </button>
          </div>
        </header>

      {/* All Questions Tab */}
      {activeTab === "all" && (
        <>
          {/* Filters */}
          <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">تصفية الأسئلة</h2>
        
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">البحث</label>
          <input
            type="text"
            placeholder="ابحثي في نص السؤال أو الخيارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Skill Filter */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">المجال</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedSkill === skill
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Filter */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              ناتج التعلم
            </label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
            >
              <option value="الكل">الكل</option>
              {uniqueOutcomes.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-600">
            إجمالي الأسئلة: <strong className="text-slate-900">{simulationQuestions.length}</strong>
          </span>
          <span className="text-sm text-slate-600">
            النتائج المفلترة: <strong className="text-slate-900">{filteredQuestions.length}</strong>
          </span>
        </div>
      </div>

      {/* Questions by Skill */}
      {Object.keys(groupedQuestions).length === 0 ? (
        <div className="card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">لا توجد أسئلة متطابقة</h3>
          <p className="mt-2 text-slate-600">جربي تغيير الفلاتر للعثور على أسئلة أخرى</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedQuestions).map(([skill, questions]) => {
            const skillColor = skillColors[skill] || "bg-slate-50 text-slate-700 border-slate-200";
            
            return (
              <div key={skill} className="card">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`badge border ${skillColor}`}>{skill}</span>
                    <span className="text-sm text-slate-500">
                      {questions.length} سؤال
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => {
                    // Find related outcomes
                    const relatedOutcomes = question.relatedOutcome
                      ? learningOutcomes.filter((outcome) => outcome.lesson === question.relatedOutcome)
                      : learningOutcomes.filter(
                          (outcome) =>
                            outcome.domain === question.skill &&
                            (question.text.includes(outcome.lesson.substring(0, 15)) ||
                              outcome.lesson.includes(question.text.substring(0, 15)))
                        );

                    return (
                      <div
                        key={question.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                السؤال {question.number}
                              </span>
                              <span className="text-xs text-slate-500">({question.id})</span>
                            </div>
                            <p className="text-base font-medium leading-relaxed text-slate-900">
                              {question.text}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            {question.points} نقطة
                          </span>
                        </div>

                        {/* Choices */}
                        <div className="mb-3 space-y-2">
                          {question.choices.map((choice, choiceIndex) => {
                            const isCorrect = choice === question.correctAnswer;
                            return (
                              <div
                                key={choiceIndex}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                                  isCorrect
                                    ? "bg-emerald-50 border border-emerald-200"
                                    : "bg-white border border-slate-200"
                                }`}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isCorrect
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {String.fromCharCode(1571 + choiceIndex)} {/* أ, ب, ج, د */}
                                </span>
                                <span className="flex-1 text-slate-700">{choice}</span>
                                {isCorrect && (
                                  <span className="text-emerald-600 font-bold">✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Related Outcomes */}
                        {relatedOutcomes.length > 0 && (
                          <div className="border-t border-slate-200 pt-3">
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                              نواتج التعلم المرتبطة:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {relatedOutcomes.map((outcome) => (
                                <span
                                  key={outcome.lesson}
                                  className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700"
                                >
                                  {outcome.lesson}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* By Skill Tab */}
      {activeTab === "by-skill" && (
        <div className="space-y-6">
          <div className="card bg-blue-50 border-blue-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">الأسئلة حسب المجال</h2>
            <p className="text-slate-600">
              عرض الأسئلة منظمة حسب المجال العلمي
            </p>
          </div>
          {Object.keys(groupedQuestions).map((skill) => {
            const skillColor = skillColors[skill] || "bg-slate-50 text-slate-700 border-slate-200";
            const questions = groupedQuestions[skill];
            
            return (
              <div key={skill} className="card">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`badge border ${skillColor}`}>{skill}</span>
                    <span className="text-sm text-slate-500">
                      {questions.length} سؤال
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {questions.slice(0, 5).map((question) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              السؤال {question.number}
                            </span>
                            <span className="text-xs text-slate-500">({question.id})</span>
                          </div>
                          <p className="text-base font-medium leading-relaxed text-slate-900">
                            {question.text}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {question.points} نقطة
                        </span>
                      </div>
                    </div>
                  ))}
                  {questions.length > 5 && (
                    <p className="text-center text-sm text-slate-500">
                      و {questions.length - 5} سؤال آخر...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* By Outcome Tab */}
      {activeTab === "by-outcome" && (
        <div className="space-y-6">
          <div className="card bg-emerald-50 border-emerald-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">الأسئلة حسب ناتج التعلم</h2>
            <p className="text-slate-600">
              عرض الأسئلة منظمة حسب نواتج التعلم المرتبطة
            </p>
          </div>
          <div className="card">
            <p className="text-slate-600">سيتم عرض الأسئلة منظمة حسب نواتج التعلم</p>
          </div>
        </div>
      )}

      {/* Add Question Tab */}
      {activeTab === "add" && (
        <div className="space-y-6">
          <div className="card bg-amber-50 border-amber-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">إضافة سؤال جديد</h2>
            <p className="text-slate-600 mb-4">
              أضيفي سؤال جديد إلى بنك الأسئلة
            </p>
            <Link
              href="/teacher/tests/create"
              className="inline-block rounded-2xl bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
            >
              الانتقال إلى صفحة إنشاء الاختبار
            </Link>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

