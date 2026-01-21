import { z } from "zod"

/**
 * Schema لتسجيل دخول الطالب
 * الطالبة تدخل برقم الطالبة + كلمة المرور
 */
export const studentSignInSchema = z.object({
  studentId: z
    .string()
    .min(1, "رقم الطالبة مطلوب")
    .regex(/^STU-\d+$/i, "رقم الطالبة يجب أن يكون بالصيغة STU-XXX"),
  password: z
    .string()
    .min(4, "كلمة المرور يجب أن تكون 4 أرقام على الأقل")
    .max(50, "كلمة المرور طويلة جداً"),
})

export type StudentSignInInput = z.infer<typeof studentSignInSchema>

/**
 * Schema لإنشاء طالب
 */
export const createStudentSchema = z.object({
  // إذا لم يتم إرسال رقم الطالبة، سيتم توليده في السيرفر لتجنب التكرار
  studentId: z
    .string()
    .min(1, "رقم الطالبة مطلوب")
    .regex(/^STU-\d+$/i, "رقم الطالبة يجب أن يكون بالصيغة STU-XXX")
    .optional(),
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  grade: z.string().min(1, "الصف مطلوب"),
  classCode: z.string().min(1, "رمز الفصل مطلوب"),
  classId: z.string().optional(), // ID الفصل (اختياري)
  password: z
    .string()
    .min(4, "كلمة المرور يجب أن تكون 4 أحرف على الأقل")
    .optional() // كلمة المرور اختيارية - سيتم إنشاء كلمة مرور افتراضية
    .default("1234"), // كلمة مرور افتراضية
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

