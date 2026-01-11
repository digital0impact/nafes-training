import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const resetPasswordApiSchema = z.object({
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100, "كلمة المرور طويلة جداً"),
  token: z.string().min(1, "رمز إعادة التعيين مطلوب"),
})

/**
 * API Route لإعادة تعيين كلمة المرور
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = resetPasswordApiSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: validationResult.error.errors[0]?.message || 'البيانات المدخلة غير صحيحة' 
        },
        { status: 400 }
      )
    }

    const { password, token } = validationResult.data

    let supabase
    try {
      supabase = createClient()
    } catch (clientError: any) {
      console.error("Supabase client creation error:", clientError)
      return NextResponse.json(
        { error: clientError.message || "خطأ في إعدادات Supabase. يرجى التحقق من ملف .env" },
        { status: 500 }
      )
    }

    // تحديث كلمة المرور باستخدام token
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error("Password update error:", updateError)
      
      // إذا كان الخطأ متعلقاً بـ session، نحاول استخدام exchangeCodeForSession
      if (updateError.message.includes("session") || updateError.message.includes("token")) {
        // نحاول استخراج session من token
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !sessionData.session) {
            return NextResponse.json(
              { error: "رابط إعادة التعيين منتهي الصلاحية أو غير صحيح. يرجى طلب رابط جديد." },
              { status: 400 }
            )
          }
          
          // إذا كانت الجلسة موجودة، نحاول تحديث كلمة المرور مرة أخرى
          const { error: retryError } = await supabase.auth.updateUser({
            password: password,
          })
          
          if (retryError) {
            return NextResponse.json(
              { error: "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى." },
              { status: 400 }
            )
          }
        } catch (err) {
          return NextResponse.json(
            { error: "رابط إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد من صفحة نسيت كلمة المرور." },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: updateError.message || "حدث خطأ أثناء تحديث كلمة المرور" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        message: "تم تحديث كلمة المرور بنجاح" 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Reset password API error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث كلمة المرور" },
      { status: 500 }
    )
  }
}
