import { z } from "zod"

/**
 * Schema لبدء سنة دراسية جديدة
 */
export const startNewAcademicYearSchema = z.object({
  label: z
    .string()
    .min(1, "اسم السنة الدراسية مطلوب")
    .max(50, "اسم السنة الدراسية طويل جداً"),
})

export type StartNewAcademicYearInput = z.infer<typeof startNewAcademicYearSchema>
