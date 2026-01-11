import { z } from "zod"

/**
 * Schema لإنشاء فصل
 */
export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, "اسم الفصل مطلوب")
    .min(2, "اسم الفصل يجب أن يكون حرفين على الأقل")
    .max(100, "اسم الفصل طويل جداً"),
  grade: z.string().min(1, "الصف مطلوب"),
  code: z
    .union([
      z.string().regex(/^[A-Z0-9]+$/i, "رمز الفصل يجب أن يحتوي على أحرف وأرقام فقط").max(20, "رمز الفصل طويل جداً"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(), // رمز الفصل اختياري - يمكن توليده تلقائياً
})

export type CreateClassInput = z.infer<typeof createClassSchema>

/**
 * Schema لتحديث فصل
 */
export const updateClassSchema = createClassSchema.partial()

export type UpdateClassInput = z.infer<typeof updateClassSchema>

