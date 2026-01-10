/**
 * أنواع التقارير
 */

export type StudentReport = {
  nickname: string
  attempts: number
  averageScore: number
  bestScore: number
  lastAttempt: string | null
}

export type ClassReport = {
  classId: string
  className: string
  classCode: string
  grade: string
  totalAttempts: number
  averageScore: number
  studentReports: StudentReport[]
}
