"use client";

import { useState } from "react";

export type ActivityTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "quiz" | "drag-drop" | "ordering" | "fill-blank";
  color: string;
};

const templates: ActivityTemplate[] = [
  {
    id: "quiz",
    name: "اختبار اختيار من متعدد",
    description: "نشاط أسئلة باختيار الإجابة الصحيحة من عدة خيارات",
    icon: "📝",
    type: "quiz",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
  },
  {
    id: "drag-drop",
    name: "سحب وإفلات - مطابقة",
    description: "نشاط مطابقة العناصر مع بعضها البعض",
    icon: "🔗",
    type: "drag-drop",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
  },
  {
    id: "ordering",
    name: "ترتيب العناصر",
    description: "نشاط ترتيب العناصر بالترتيب الصحيح",
    icon: "🔢",
    type: "ordering",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
  },
  {
    id: "fill-blank",
    name: "ملء الفراغات",
    description: "نشاط ملء الفراغات بالإجابات الصحيحة",
    icon: "✏️",
    type: "fill-blank",
    color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
  }
];

interface ActivityTemplateSelectorProps {
  onSelect: (template: ActivityTemplate) => void;
  onClose: () => void;
}

export function ActivityTemplateSelector({ onSelect, onClose }: ActivityTemplateSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">اختر قالب النشاط</h2>
            <p className="mt-1 text-sm text-slate-600">
              اختري نوع النشاط الذي تريدين إنشاءه
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

        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`rounded-2xl border-2 p-6 text-right transition-all hover:shadow-lg ${template.color}`}
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-bold mb-2">{template.name}</h3>
              <p className="text-sm opacity-80">{template.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export { templates };



