import { z } from "zod"

/**
 * Schema لتسجيل دخول الطالب
 * الطالب يدخل باسم مستعار + كود الفصل بدون إنشاء حساب
 */
export const studentSignInSchema = z.object({
  nickname: z
    .string()
    .min(1, "الاسم المستعار مطلوب")
    .min(2, "الاسم المستعار يجب أن يكون حرفين على الأقل")
    .max(50, "الاسم المستعار طويل جداً"),
  classCode: z
    .string()
    .min(1, "كود الفصل مطلوب")
    .regex(/^[A-Z0-9]+$/i, "كود الفصل يجب أن يحتوي على أحرف وأرقام فقط")
    .max(20, "كود الفصل طويل جداً"),
})

export type StudentSignInInput = z.infer<typeof studentSignInSchema>

/**
 * Schema لإنشاء طالب
 */
export const createStudentSchema = z.object({
  studentId: z
    .string()
    .min(1, "رقم الطالبة مطلوب")
    .regex(/^STU-\d{3}$/i, "رقم الطالبة يجب أن يكون بالصيغة STU-XXX"),
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  grade: z.string().min(1, "الصف مطلوب"),
  classCode: z.string().min(1, "رمز الفصل مطلوب"),
  classId: z.string().optional(), // ID الفصل (اختياري)
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(4, "كلمة المرور يجب أن تكون 4 أحرف على الأقل"),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

