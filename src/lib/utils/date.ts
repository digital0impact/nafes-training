/**
 * الحصول على التاريخ الحالي بصيغة ISO
 */
export function getCurrentDate(): string {
  return new Date().toISOString()
}

/**
 * التحقق من أن التاريخ في الماضي
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  return d < new Date()
}

/**
 * التحقق من أن التاريخ في المستقبل
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  return d > new Date()
}

/**
 * حساب الفرق بين تاريخين بالأيام
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1
  const d2 = typeof date2 === "string" ? new Date(date2) : date2
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
