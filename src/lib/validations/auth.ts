import { z } from "zod"

/**
 * Schema لتسجيل الدخول
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
})

export type SignInInput = z.infer<typeof signInSchema>

/**
 * Schema للتسجيل
 */
export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم طويل جداً"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100, "كلمة المرور طويلة جداً"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
})

export type SignUpInput = z.infer<typeof signUpSchema>

/**
 * Schema للتسجيل في API Route (بدون confirmPassword)
 * يستخدم في API routes حيث يتم التحقق من confirmPassword في client side
 */
export const signUpApiSchema = z.object({
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم طويل جداً"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100, "كلمة المرور طويلة جداً"),
})

export type SignUpApiInput = z.infer<typeof signUpApiSchema>

/**
 * Schema لطلب إعادة تعيين كلمة المرور
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Schema لإعادة تعيين كلمة المرور
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100, "كلمة المرور طويلة جداً"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

