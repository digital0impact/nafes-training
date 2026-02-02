import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * API Route لمزامنة بيانات المستخدم بعد تسجيل الدخول
 * يتم استدعاؤها بعد تسجيل الدخول الناجح لضمان وجود المستخدم في قاعدة البيانات
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // التحقق من أن المستخدم مسجل دخول
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionPlan: true,
      },
    })

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          role: user.user_metadata?.role || 'teacher',
        },
      })

      return NextResponse.json({
        message: 'User created successfully',
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
      message: 'User already exists',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        subscriptionPlan: existingUser.subscriptionPlan,
      },
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء مزامنة بيانات المستخدم' },
      { status: 500 }
    )
  }
}
