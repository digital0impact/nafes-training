import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { signUpApiSchema } from "@/lib/validations"

/**
 * API Route لتسجيل المعلم باستخدام Supabase Auth
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = signUpApiSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors)
      const firstError = validationResult.error.errors[0]
      
      let errorMessage = "البيانات المدخلة غير صحيحة"
      
      if (firstError) {
        const fieldName = firstError.path[0] as string
        const fieldLabel = 
          fieldName === "name" ? "الاسم" :
          fieldName === "email" ? "البريد الإلكتروني" :
          fieldName === "password" ? "كلمة المرور" :
          fieldName
        
        if (firstError.message.includes("مطلوب") || firstError.message.includes("required")) {
          errorMessage = `${fieldLabel} مطلوب`
        } else {
          errorMessage = `${fieldLabel}: ${firstError.message}`
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: validationResult.error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data

    // التحقق من وجود المستخدم في قاعدة البيانات
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      )
    }

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

    // إنشاء المستخدم في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "teacher",
        },
        emailRedirectTo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signin`,
      },
    })

    if (authError) {
      console.error("Error signing up in Supabase:", authError)
      let errorMessage = authError.message || "حدث خطأ أثناء إنشاء الحساب"
      
      // ترجمة أخطاء شائعة
      if (authError.message.includes("User already registered") || 
          authError.message.includes("already registered")) {
        errorMessage = "البريد الإلكتروني مستخدم بالفعل في Supabase"
      } else if (authError.message.includes("Password") || 
                 authError.message.includes("password")) {
        errorMessage = "كلمة المرور غير صحيحة. يجب أن تكون 6 أحرف على الأقل"
      } else if (authError.message.includes("Email") || 
                 authError.message.includes("email")) {
        errorMessage = "البريد الإلكتروني غير صحيح أو غير مدعوم"
      } else if (authError.message.includes("signup_disabled")) {
        errorMessage = "إنشاء الحسابات معطل حالياً. يرجى التواصل مع الدعم"
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error("No user data returned from Supabase signup")
      return NextResponse.json(
        { error: "حدث خطأ أثناء إنشاء الحساب - لم يتم إرجاع بيانات المستخدم" },
        { status: 500 }
      )
    }

    // التحقق من حالة المستخدم
    const emailConfirmed = authData.user.email_confirmed_at !== null
    const needsConfirmation = !emailConfirmed && authData.session === null

    // إنشاء المستخدم في قاعدة البيانات
    let user
    try {
      user = await prisma.user.create({
        data: {
          id: authData.user.id,
          name,
          email,
          role: "teacher",
        },
      })
    } catch (dbError: any) {
      console.error("Error creating user in database:", dbError)
      
      // إذا فشل إنشاء المستخدم في قاعدة البيانات، نحاول حذفه من Supabase
      // (لكن لا يمكننا حذفه من Supabase بدون service_role key)
      
      if (dbError.code === "P2002") {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل في قاعدة البيانات" },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "تم إنشاء الحساب في Supabase لكن فشل حفظه في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم",
          userId: authData.user.id, // لإصلاح المشكلة يدوياً
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: needsConfirmation 
          ? "تم إنشاء الحساب بنجاح. يرجى تأكيد البريد الإلكتروني من الرسالة المرسلة إليك"
          : "تم إنشاء الحساب بنجاح",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        needsEmailConfirmation: needsConfirmation,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating user:", error)
    
    // معالجة أخطاء محددة
    let errorMessage = "حدث خطأ أثناء إنشاء الحساب"
    
    if (error?.code === "P2002") {
      errorMessage = "البريد الإلكتروني مستخدم بالفعل"
    } else if (error?.message) {
      errorMessage = error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}











