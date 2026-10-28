/**
 * غلاف موحّد يمنح المختبرات المخصصة مظهر ألعاب نافس الجديدة (خلفية داكنة، نفس الألوان والخط).
 * يعيد تلوين أصناف Tailwind الشائعة داخل الحاوية .labx فقط، دون تغيير منطق المختبر أو محتواه.
 */
import type { ReactNode } from "react"

const LAB_STYLES = `
.labx{--abyss:#0b1d2a;--deep:#12303f;--deep2:#173a4b;--ridge:#24536a;--foam:#ecf6f2;--muted:#a5c0c4;--magma:#ff9a2e;--crust:#e6bd63;--sea:#3fbfdc;
background:linear-gradient(180deg,var(--abyss) 0%,#0f2937 60%,#2b1612 100%) var(--abyss);color:var(--foam);border-radius:24px;padding:18px clamp(10px,2.5vw,22px) 24px;line-height:1.6}
.labx .card,.labx .bg-white,.labx .bg-slate-50,.labx .bg-gray-50{background-color:var(--deep)!important;border-color:var(--ridge)}
.labx .card{box-shadow:0 14px 0 -6px rgba(0,0,0,.28);border:2px solid var(--ridge)}
.labx .bg-slate-100,.labx .bg-gray-100{background-color:var(--deep2)!important}
.labx .bg-slate-200,.labx .bg-gray-200,.labx .bg-slate-300{background-color:var(--ridge)!important}
.labx .bg-slate-800,.labx .bg-slate-900{background-color:#07141d!important}
.labx .text-black,.labx .text-slate-900,.labx .text-slate-800,.labx .text-slate-700,.labx .text-gray-900,.labx .text-gray-800,.labx .text-gray-700{color:var(--foam)!important}
.labx .text-slate-600,.labx .text-slate-500,.labx .text-slate-400,.labx .text-gray-600,.labx .text-gray-500{color:var(--muted)!important}
.labx [class*="border-slate-"],.labx [class*="border-gray-"]{border-color:var(--ridge)!important}
.labx .hover\:bg-slate-50:hover,.labx .hover\:bg-slate-100:hover,.labx .hover\:bg-gray-50:hover{background-color:var(--deep2)!important}
.labx .divide-slate-200>*+*{border-color:var(--ridge)!important}
.labx h1,.labx h2{color:var(--crust)}
.labx input,.labx select,.labx textarea{background:var(--abyss);color:var(--foam);border-color:var(--ridge)}
.labx button:focus-visible{outline:3px solid var(--sea);outline-offset:3px}
.labx .from-primary-50,.labx .from-green-50,.labx .from-blue-50{--tw-gradient-from:var(--deep) var(--tw-gradient-from-position)!important;--tw-gradient-to:rgba(18,48,63,0) var(--tw-gradient-to-position)!important;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)!important}
.labx .to-purple-50,.labx .to-blue-50{--tw-gradient-to:var(--deep2) var(--tw-gradient-to-position)!important}
.labx .bg-purple-50{background-color:rgba(192,132,252,0.1)!important}
.labx .bg-purple-100{background-color:rgba(192,132,252,0.16)!important}
.labx .bg-purple-200,.labx .bg-purple-300{background-color:rgba(192,132,252,0.28)!important}
.labx .hover\:bg-purple-50:hover,.labx .hover\:bg-purple-100:hover{background-color:rgba(192,132,252,0.22)!important}
.labx .text-purple-600,.labx .text-purple-700,.labx .text-purple-800,.labx .text-purple-900{color:#d8b4fe!important}
.labx .border-purple-100,.labx .border-purple-200,.labx .border-purple-300{border-color:rgba(192,132,252,0.5)!important}
.labx .bg-violet-50{background-color:rgba(167,139,250,0.1)!important}
.labx .bg-violet-100{background-color:rgba(167,139,250,0.16)!important}
.labx .bg-violet-200,.labx .bg-violet-300{background-color:rgba(167,139,250,0.28)!important}
.labx .hover\:bg-violet-50:hover,.labx .hover\:bg-violet-100:hover{background-color:rgba(167,139,250,0.22)!important}
.labx .text-violet-600,.labx .text-violet-700,.labx .text-violet-800,.labx .text-violet-900{color:#c4b5fd!important}
.labx .border-violet-100,.labx .border-violet-200,.labx .border-violet-300{border-color:rgba(167,139,250,0.5)!important}
.labx .bg-indigo-50{background-color:rgba(129,140,248,0.1)!important}
.labx .bg-indigo-100{background-color:rgba(129,140,248,0.16)!important}
.labx .bg-indigo-200,.labx .bg-indigo-300{background-color:rgba(129,140,248,0.28)!important}
.labx .hover\:bg-indigo-50:hover,.labx .hover\:bg-indigo-100:hover{background-color:rgba(129,140,248,0.22)!important}
.labx .text-indigo-600,.labx .text-indigo-700,.labx .text-indigo-800,.labx .text-indigo-900{color:#a5b4fc!important}
.labx .border-indigo-100,.labx .border-indigo-200,.labx .border-indigo-300{border-color:rgba(129,140,248,0.5)!important}
.labx .bg-blue-50{background-color:rgba(96,165,250,0.1)!important}
.labx .bg-blue-100{background-color:rgba(96,165,250,0.16)!important}
.labx .bg-blue-200,.labx .bg-blue-300{background-color:rgba(96,165,250,0.28)!important}
.labx .hover\:bg-blue-50:hover,.labx .hover\:bg-blue-100:hover{background-color:rgba(96,165,250,0.22)!important}
.labx .text-blue-600,.labx .text-blue-700,.labx .text-blue-800,.labx .text-blue-900{color:#93c5fd!important}
.labx .border-blue-100,.labx .border-blue-200,.labx .border-blue-300{border-color:rgba(96,165,250,0.5)!important}
.labx .bg-sky-50{background-color:rgba(56,189,248,0.1)!important}
.labx .bg-sky-100{background-color:rgba(56,189,248,0.16)!important}
.labx .bg-sky-200,.labx .bg-sky-300{background-color:rgba(56,189,248,0.28)!important}
.labx .hover\:bg-sky-50:hover,.labx .hover\:bg-sky-100:hover{background-color:rgba(56,189,248,0.22)!important}
.labx .text-sky-600,.labx .text-sky-700,.labx .text-sky-800,.labx .text-sky-900{color:#7dd3fc!important}
.labx .border-sky-100,.labx .border-sky-200,.labx .border-sky-300{border-color:rgba(56,189,248,0.5)!important}
.labx .bg-cyan-50{background-color:rgba(34,211,238,0.1)!important}
.labx .bg-cyan-100{background-color:rgba(34,211,238,0.16)!important}
.labx .bg-cyan-200,.labx .bg-cyan-300{background-color:rgba(34,211,238,0.28)!important}
.labx .hover\:bg-cyan-50:hover,.labx .hover\:bg-cyan-100:hover{background-color:rgba(34,211,238,0.22)!important}
.labx .text-cyan-600,.labx .text-cyan-700,.labx .text-cyan-800,.labx .text-cyan-900{color:#67e8f9!important}
.labx .border-cyan-100,.labx .border-cyan-200,.labx .border-cyan-300{border-color:rgba(34,211,238,0.5)!important}
.labx .bg-teal-50{background-color:rgba(45,212,191,0.1)!important}
.labx .bg-teal-100{background-color:rgba(45,212,191,0.16)!important}
.labx .bg-teal-200,.labx .bg-teal-300{background-color:rgba(45,212,191,0.28)!important}
.labx .hover\:bg-teal-50:hover,.labx .hover\:bg-teal-100:hover{background-color:rgba(45,212,191,0.22)!important}
.labx .text-teal-600,.labx .text-teal-700,.labx .text-teal-800,.labx .text-teal-900{color:#5eead4!important}
.labx .border-teal-100,.labx .border-teal-200,.labx .border-teal-300{border-color:rgba(45,212,191,0.5)!important}
.labx .bg-emerald-50{background-color:rgba(52,211,153,0.1)!important}
.labx .bg-emerald-100{background-color:rgba(52,211,153,0.16)!important}
.labx .bg-emerald-200,.labx .bg-emerald-300{background-color:rgba(52,211,153,0.28)!important}
.labx .hover\:bg-emerald-50:hover,.labx .hover\:bg-emerald-100:hover{background-color:rgba(52,211,153,0.22)!important}
.labx .text-emerald-600,.labx .text-emerald-700,.labx .text-emerald-800,.labx .text-emerald-900{color:#6ee7b7!important}
.labx .border-emerald-100,.labx .border-emerald-200,.labx .border-emerald-300{border-color:rgba(52,211,153,0.5)!important}
.labx .bg-green-50{background-color:rgba(74,222,128,0.1)!important}
.labx .bg-green-100{background-color:rgba(74,222,128,0.16)!important}
.labx .bg-green-200,.labx .bg-green-300{background-color:rgba(74,222,128,0.28)!important}
.labx .hover\:bg-green-50:hover,.labx .hover\:bg-green-100:hover{background-color:rgba(74,222,128,0.22)!important}
.labx .text-green-600,.labx .text-green-700,.labx .text-green-800,.labx .text-green-900{color:#86efac!important}
.labx .border-green-100,.labx .border-green-200,.labx .border-green-300{border-color:rgba(74,222,128,0.5)!important}
.labx .bg-lime-50{background-color:rgba(163,230,53,0.1)!important}
.labx .bg-lime-100{background-color:rgba(163,230,53,0.16)!important}
.labx .bg-lime-200,.labx .bg-lime-300{background-color:rgba(163,230,53,0.28)!important}
.labx .hover\:bg-lime-50:hover,.labx .hover\:bg-lime-100:hover{background-color:rgba(163,230,53,0.22)!important}
.labx .text-lime-600,.labx .text-lime-700,.labx .text-lime-800,.labx .text-lime-900{color:#bef264!important}
.labx .border-lime-100,.labx .border-lime-200,.labx .border-lime-300{border-color:rgba(163,230,53,0.5)!important}
.labx .bg-yellow-50{background-color:rgba(250,204,21,0.1)!important}
.labx .bg-yellow-100{background-color:rgba(250,204,21,0.16)!important}
.labx .bg-yellow-200,.labx .bg-yellow-300{background-color:rgba(250,204,21,0.28)!important}
.labx .hover\:bg-yellow-50:hover,.labx .hover\:bg-yellow-100:hover{background-color:rgba(250,204,21,0.22)!important}
.labx .text-yellow-600,.labx .text-yellow-700,.labx .text-yellow-800,.labx .text-yellow-900{color:#fde047!important}
.labx .border-yellow-100,.labx .border-yellow-200,.labx .border-yellow-300{border-color:rgba(250,204,21,0.5)!important}
.labx .bg-amber-50{background-color:rgba(251,191,36,0.1)!important}
.labx .bg-amber-100{background-color:rgba(251,191,36,0.16)!important}
.labx .bg-amber-200,.labx .bg-amber-300{background-color:rgba(251,191,36,0.28)!important}
.labx .hover\:bg-amber-50:hover,.labx .hover\:bg-amber-100:hover{background-color:rgba(251,191,36,0.22)!important}
.labx .text-amber-600,.labx .text-amber-700,.labx .text-amber-800,.labx .text-amber-900{color:#fcd34d!important}
.labx .border-amber-100,.labx .border-amber-200,.labx .border-amber-300{border-color:rgba(251,191,36,0.5)!important}
.labx .bg-orange-50{background-color:rgba(251,146,60,0.1)!important}
.labx .bg-orange-100{background-color:rgba(251,146,60,0.16)!important}
.labx .bg-orange-200,.labx .bg-orange-300{background-color:rgba(251,146,60,0.28)!important}
.labx .hover\:bg-orange-50:hover,.labx .hover\:bg-orange-100:hover{background-color:rgba(251,146,60,0.22)!important}
.labx .text-orange-600,.labx .text-orange-700,.labx .text-orange-800,.labx .text-orange-900{color:#fdba74!important}
.labx .border-orange-100,.labx .border-orange-200,.labx .border-orange-300{border-color:rgba(251,146,60,0.5)!important}
.labx .bg-red-50{background-color:rgba(248,113,113,0.1)!important}
.labx .bg-red-100{background-color:rgba(248,113,113,0.16)!important}
.labx .bg-red-200,.labx .bg-red-300{background-color:rgba(248,113,113,0.28)!important}
.labx .hover\:bg-red-50:hover,.labx .hover\:bg-red-100:hover{background-color:rgba(248,113,113,0.22)!important}
.labx .text-red-600,.labx .text-red-700,.labx .text-red-800,.labx .text-red-900{color:#fca5a5!important}
.labx .border-red-100,.labx .border-red-200,.labx .border-red-300{border-color:rgba(248,113,113,0.5)!important}
.labx .bg-rose-50{background-color:rgba(251,113,133,0.1)!important}
.labx .bg-rose-100{background-color:rgba(251,113,133,0.16)!important}
.labx .bg-rose-200,.labx .bg-rose-300{background-color:rgba(251,113,133,0.28)!important}
.labx .hover\:bg-rose-50:hover,.labx .hover\:bg-rose-100:hover{background-color:rgba(251,113,133,0.22)!important}
.labx .text-rose-600,.labx .text-rose-700,.labx .text-rose-800,.labx .text-rose-900{color:#fda4af!important}
.labx .border-rose-100,.labx .border-rose-200,.labx .border-rose-300{border-color:rgba(251,113,133,0.5)!important}
.labx .bg-pink-50{background-color:rgba(244,114,182,0.1)!important}
.labx .bg-pink-100{background-color:rgba(244,114,182,0.16)!important}
.labx .bg-pink-200,.labx .bg-pink-300{background-color:rgba(244,114,182,0.28)!important}
.labx .hover\:bg-pink-50:hover,.labx .hover\:bg-pink-100:hover{background-color:rgba(244,114,182,0.22)!important}
.labx .text-pink-600,.labx .text-pink-700,.labx .text-pink-800,.labx .text-pink-900{color:#f9a8d4!important}
.labx .border-pink-100,.labx .border-pink-200,.labx .border-pink-300{border-color:rgba(244,114,182,0.5)!important}
.labx .bg-fuchsia-50{background-color:rgba(232,121,249,0.1)!important}
.labx .bg-fuchsia-100{background-color:rgba(232,121,249,0.16)!important}
.labx .bg-fuchsia-200,.labx .bg-fuchsia-300{background-color:rgba(232,121,249,0.28)!important}
.labx .hover\:bg-fuchsia-50:hover,.labx .hover\:bg-fuchsia-100:hover{background-color:rgba(232,121,249,0.22)!important}
.labx .text-fuchsia-600,.labx .text-fuchsia-700,.labx .text-fuchsia-800,.labx .text-fuchsia-900{color:#f0abfc!important}
.labx .border-fuchsia-100,.labx .border-fuchsia-200,.labx .border-fuchsia-300{border-color:rgba(232,121,249,0.5)!important}
.labx .bg-primary-50{background-color:rgba(96,165,250,0.1)!important}
.labx .bg-primary-100{background-color:rgba(96,165,250,0.16)!important}
.labx .bg-primary-200,.labx .bg-primary-300{background-color:rgba(96,165,250,0.28)!important}
.labx .hover\:bg-primary-50:hover,.labx .hover\:bg-primary-100:hover{background-color:rgba(96,165,250,0.22)!important}
.labx .text-primary-600,.labx .text-primary-700,.labx .text-primary-800,.labx .text-primary-900{color:#93c5fd!important}
.labx .border-primary-100,.labx .border-primary-200,.labx .border-primary-300{border-color:rgba(96,165,250,0.5)!important}
.labx .bg-stone-50,.labx .bg-stone-100{background-color:rgba(168,162,158,.16)!important}
.labx .bg-stone-200,.labx .bg-stone-300{background-color:rgba(168,162,158,.30)!important}
.labx .text-stone-600,.labx .text-stone-700,.labx .text-stone-800,.labx .text-stone-900{color:#d6d3d1!important}
.labx .border-stone-100,.labx .border-stone-200,.labx .border-stone-300{border-color:rgba(168,162,158,.5)!important}
`

export default function LabTheme({ children }: { children: ReactNode }) {
  return (
    <div className="labx" dir="rtl">
      <style>{LAB_STYLES}</style>
      {children}
    </div>
  )
}
