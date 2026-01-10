/**
 * أنواع التدريب
 */

export type TrainingAttempt = {
  id: string
  nickname: string
  classCode: string
  classId?: string | null
  testModelId?: string | null
  testModelTitle?: string | null
  answers: Record<string, string>
  score: number
  totalQuestions: number
  percentage: number
  timeSpent: number
  completedAt: Date | string
}

export type CreateTrainingAttemptInput = {
  nickname: string
  classCode: string
  testModelId?: string
  testModelTitle?: string
  answers: Record<string, string>
  score: number
  totalQuestions: number
  percentage: number
  timeSpent: number
}

export type TrainingScore = {
  correct: number
  total: number
  percentage: number
}
