/**
 * RPC Functions للطلاب (بدون auth)
 * تستخدم Supabase RPC Functions مع service role
 */

import { createClient } from "./client"

type Student = {
  id: string
  nickname: string
  created_at: string
}

type Enrollment = {
  enrollment_id: string
  student_id: string
  class_id: string
  enrolled_at: string
}

type Attempt = {
  id: string
  student_id: string
  class_id: string
  score: number
  total: number
  percentage: number
  created_at: string
}

type ClassValidation = {
  is_valid: boolean
  class_id: string | null
  class_name: string | null
  teacher_name: string | null
}

/**
 * إنشاء طالب جديد أو إرجاع الموجود
 */
export async function createOrGetStudent(
  nickname: string
): Promise<Student> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("create_or_get_student", {
    p_nickname: nickname.trim(),
  })

  if (error) {
    throw new Error(`Failed to create/get student: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error("No student data returned")
  }

  return data[0]
}

/**
 * التسجيل في فصل
 */
export async function enrollStudentInClass(
  studentId: string,
  classCode: string
): Promise<Enrollment> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("enroll_student_in_class", {
    p_student_id: studentId,
    p_class_code: classCode.toUpperCase(),
  })

  if (error) {
    throw new Error(`Failed to enroll student: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error("No enrollment data returned")
  }

  return data[0]
}

/**
 * حفظ محاولة تدريب
 */
export async function createTrainingAttempt(params: {
  studentId: string
  classCode: string
  score: number
  total: number
  answers?: Record<string, string>
  timeSpent?: number
}): Promise<Attempt> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("create_training_attempt", {
    p_student_id: params.studentId,
    p_class_code: params.classCode.toUpperCase(),
    p_score: params.score,
    p_total: params.total,
    p_answers: params.answers || null,
    p_time_spent: params.timeSpent || 0,
  })

  if (error) {
    throw new Error(`Failed to create attempt: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error("No attempt data returned")
  }

  return data[0]
}

/**
 * الحصول على محاولات طالب في فصل
 */
export async function getStudentAttempts(
  studentId: string,
  classCode: string
): Promise<Attempt[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_student_attempts", {
    p_student_id: studentId,
    p_class_code: classCode.toUpperCase(),
  })

  if (error) {
    throw new Error(`Failed to get attempts: ${error.message}`)
  }

  return data || []
}

/**
 * التحقق من صحة كود الفصل
 */
export async function validateClassCode(
  classCode: string
): Promise<ClassValidation> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("validate_class_code", {
    p_class_code: classCode.toUpperCase(),
  })

  if (error) {
    throw new Error(`Failed to validate class code: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return {
      is_valid: false,
      class_id: null,
      class_name: null,
      teacher_name: null,
    }
  }

  return data[0]
}
