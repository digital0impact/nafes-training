import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { signInSchema } from '@/lib/validations'
import { logAudit } from '@/lib/auth-server'

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

    let user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionPlan: true,
      },
    })

    let isDisabled = false
    if (user) {
      try {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isDisabled: true },
        })
        isDisabled = (row as { isDisabled?: boolean } | null)?.isDisabled ?? false
      } catch {
        // عمود isDisabled غير موجود (قبل تشغيل الترحيل)
      }
    }

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
          role: authData.user.user_metadata?.role || 'teacher',
        },
      })
      user = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        subscriptionPlan: newUser.subscriptionPlan,
      }
    }

    if (user.role === 'visitor_reviewer' && isDisabled) {
      return NextResponse.json(
        { error: 'تم تعطيل هذا الحساب. يرجى التواصل مع المعلم.' },
        { status: 403 }
      )
    }

    if (user.role === 'visitor_reviewer') {
      await logAudit({ userId: user.id, action: 'visitor_login' })
    }

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        isDisabled,
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


