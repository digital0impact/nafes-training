"use client";

import { useState, useMemo } from "react";
import { simulationQuestions } from "@/lib/simulation-questions";
import { learningOutcomes } from "@/lib/data";
import type { SimulationQuestion } from "@/lib/simulation-questions";

interface QuestionSelectorProps {
  selectedQuestionIds: Set<string>;
  onSelect: (questionId: string) => void;
  onDeselect: (questionId: string) => void;
  skill?: string;
  relatedOutcome?: string;
  onClose: () => void;
}

const skillOptions = ["الكل", "علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"];

export function QuestionSelector({
  selectedQuestionIds,
  onSelect,
  onDeselect,
  skill: initialSkill,
  relatedOutcome: initialOutcome,
  onClose
}: QuestionSelectorProps) {
  const [selectedSkill, setSelectedSkill] = useState(initialSkill || "الكل");
  const [selectedOutcome, setSelectedOutcome] = useState(initialOutcome || "الكل");

  // Get unique outcomes for filter
  const uniqueOutcomes = useMemo(() => {
    const outcomes = learningOutcomes.map((outcome) => outcome.lesson);
    return Array.from(new Set(outcomes));
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return simulationQuestions.filter((question) => {
      const skillMatch = selectedSkill === "الكل" || question.skill === selectedSkill;

      // Find related outcome for this question
      let outcomeMatch = true;
      if (selectedOutcome !== "الكل") {
        if (question.relatedOutcome) {
          outcomeMatch = question.relatedOutcome === selectedOutcome;
        } else {
          const relatedOutcomes = learningOutcomes.filter(
            (outcome) =>
              outcome.domain === question.skill &&
              (question.text.includes(outcome.lesson.substring(0, 10)) ||
                outcome.lesson.includes(question.text.substring(0, 10)))
          );
          outcomeMatch = relatedOutcomes.some((outcome) => outcome.lesson === selectedOutcome);
        }
      }

      return skillMatch && outcomeMatch;
    });
  }, [selectedSkill, selectedOutcome]);

  const skillColors: Record<string, string> = {
    "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
    "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card max-h-[90vh] w-full max-w-4xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">اختيار الأسئلة من بنك الأسئلة</h2>
            <p className="mt-1 text-sm text-slate-600">
              {selectedQuestionIds.size} سؤال محدد
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-4 pb-4 border-b border-slate-200">
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
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              النتائج: <strong className="text-slate-900">{filteredQuestions.length}</strong>
            </span>
            <span>
              المحدد: <strong className="text-slate-900">{selectedQuestionIds.size}</strong>
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">لا توجد أسئلة متطابقة</p>
            </div>
          ) : (
            filteredQuestions.map((question) => {
              const isSelected = selectedQuestionIds.has(question.id);
              const skillColor = skillColors[question.skill] || "bg-slate-50 text-slate-700 border-slate-200";
              
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
                  className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      onDeselect(question.id);
                    } else {
                      onSelect(question.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-primary-500 bg-primary-500"
                        : "border-slate-300"
                    }`}>
                      {isSelected && (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`badge border ${skillColor}`}>{question.skill}</span>
                        <span className="text-xs text-slate-500">السؤال {question.number}</span>
                        <span className="text-xs text-slate-500">• {question.points} نقطة</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-2">{question.text}</p>
                      {relatedOutcomes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {relatedOutcomes.slice(0, 2).map((outcome) => (
                            <span
                              key={outcome.lesson}
                              className="rounded-full bg-primary-50 px-2 py-1 text-xs text-primary-700"
                            >
                              {outcome.lesson}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            إضافة {selectedQuestionIds.size} سؤال
          </button>
        </div>
      </div>
    </div>
  );
}



