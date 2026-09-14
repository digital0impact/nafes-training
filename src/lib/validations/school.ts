import { z } from "zod"

/**
 * Schema لإنشاء مدرسة
 */
export const createSchoolSchema = z.object({
  name: z
    .string()
    .min(1, "اسم المدرسة مطلوب")
    .min(2, "اسم المدرسة يجب أن يكون حرفين على الأقل")
    .max(150, "اسم المدرسة طويل جداً"),
  city: z
    .union([z.string().max(100, "اسم المدينة طويل جداً"), z.literal(""), z.undefined()])
    .optional(),
})

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>

/**
 * Schema لتحديث مدرسة
 */
export const updateSchoolSchema = createSchoolSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>

/**
 * Schema لربط/فك ربط المعلمة بمدرسة (ذاتي الخدمة)
 * schoolId = null لفك الارتباط بالمدرسة
 */
export const setTeacherSchoolSchema = z.object({
  schoolId: z.string().min(1, "معرف المدرسة مطلوب").nullable(),
})

export type SetTeacherSchoolInput = z.infer<typeof setTeacherSchoolSchema>
