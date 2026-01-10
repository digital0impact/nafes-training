import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/validations"

/**
 * API Route لتسجيل المعلم باستخدام Supabase Auth
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = signUpSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: validationResult.error.errors[0]?.message || "البيانات المدخلة غير صحيحة" 
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

    const supabase = createClient()

    // إنشاء المستخدم في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "teacher",
        },
      },
    })

    if (authError) {
      console.error("Error signing up in Supabase:", authError)
      return NextResponse.json(
        { error: authError.message || "حدث خطأ أثناء إنشاء الحساب" },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "حدث خطأ أثناء إنشاء الحساب" },
        { status: 500 }
      )
    }

    // إنشاء المستخدم في قاعدة البيانات
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        role: "teacher",
      },
    })

    return NextResponse.json(
      {
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    )
  }
}











