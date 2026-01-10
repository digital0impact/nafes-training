/**
 * تنسيق الأرقام
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toFixed(decimals)
}

/**
 * تنسيق النسبة المئوية
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * تنسيق الوقت (ثواني إلى MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * تنسيق التاريخ
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "لا يوجد"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * تنسيق التاريخ والوقت
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "لا يوجد"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
