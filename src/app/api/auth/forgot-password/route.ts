import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/lib/validations'

/**
 * API Route لطلب إعادة تعيين كلمة المرور
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = forgotPasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: validationResult.error.errors[0]?.message || 'البريد الإلكتروني غير صحيح' 
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    let supabase
    try {
      supabase = await createClient()
    } catch (clientError: any) {
      console.error("Supabase client creation error:", clientError)
      return NextResponse.json(
        { error: clientError.message || "خطأ في إعدادات Supabase. يرجى التحقق من ملف .env" },
        { status: 500 }
      )
    }

    // إرسال رابط إعادة تعيين كلمة المرور
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password`,
    })

    if (resetError) {
      console.error("Password reset error:", resetError)
      // حتى لو كان البريد غير موجود، لا نكشف ذلك للأمان
      // نرسل رسالة نجاح في جميع الحالات
      return NextResponse.json(
        { 
          message: "إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين إليه" 
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Forgot password API error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال رابط إعادة التعيين" },
      { status: 500 }
    )
  }
}
