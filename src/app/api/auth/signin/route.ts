import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { signInSchema } from '@/lib/validations'

/**
 * API Route لتسجيل دخول المعلم باستخدام Supabase Auth فقط
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = signInSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: validationResult.error.errors[0]?.message || 'البيانات المدخلة غير صحيحة' 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    const supabase = createClient()

    // تسجيل الدخول باستخدام Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الدخول' },
        { status: 500 }
      )
    }

    // جلب بيانات المستخدم من قاعدة البيانات باستخدام ID من Supabase
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionPlan: true,
      },
    })

    // إذا لم يكن المستخدم موجوداً في قاعدة البيانات، ننشئه
    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
          role: authData.user.user_metadata?.role || 'teacher',
        },
      })

      return NextResponse.json({
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          subscriptionPlan: newUser.subscriptionPlan,
        },
      })
    }

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
    })
  } catch (error) {
    console.error('Error in signin:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}


