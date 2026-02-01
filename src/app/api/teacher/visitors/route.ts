import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireTeacher, VISITOR_SCOPE_KEYS, type VisitorScopeKey } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

const DEFAULT_SCOPE: VisitorScopeKey[] = ['nafes_plan', 'activities', 'results', 'learning_indicators']

/**
 * GET - قائمة الزوار المرتبطين بالمعلم
 */
export async function GET() {
  try {
    const teacher = await requireTeacher()
    const profiles = await prisma.visitorProfile.findMany({
      where: { teacherId: teacher.id },
      include: {
        visitor: {
          select: {
            id: true,
            email: true,
            name: true,
            isDisabled: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    const list = profiles.map((p) => {
      let scope: string[] = []
      try {
        scope = JSON.parse(p.scope) as string[]
      } catch {
        scope = []
      }
      return {
        id: p.id,
        visitorId: p.visitorId,
        email: p.visitor.email,
        name: p.visitor.name,
        isDisabled: p.visitor.isDisabled ?? false,
        isActive: p.isActive,
        scope,
        createdAt: p.createdAt,
      }
    })
    return NextResponse.json({ visitors: list })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message.includes('Teacher')) return NextResponse.json({ error: 'صلاحية معلم مطلوبة' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الزوار' }, { status: 500 })
  }
}

/**
 * POST - إضافة زائر (إنشاء حساب زائر وربطه بالمعلم)
 * body: { name, email, password, scope? }
 */
export async function POST(request: Request) {
  try {
    const teacher = await requireTeacher()
    const body = await request.json()
    const { name, email, password, scope: scopeInput } = body as {
      name?: string
      email?: string
      password?: string
      scope?: string[]
    }
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة' },
        { status: 400 }
      )
    }
    const emailTrim = (email as string).trim().toLowerCase()
    const scope: VisitorScopeKey[] = Array.isArray(scopeInput)
      ? (scopeInput.filter((s) => VISITOR_SCOPE_KEYS.includes(s as VisitorScopeKey)) as VisitorScopeKey[])
      : DEFAULT_SCOPE
    if (scope.length === 0) {
      return NextResponse.json(
        { error: 'يجب تحديد نطاق عرض واحد على الأقل للزائر' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: emailTrim },
    })
    if (existingUser) {
      if (existingUser.role === 'visitor_reviewer') {
        const existingProfile = await prisma.visitorProfile.findUnique({
          where: {
            teacherId_visitorId: { teacherId: teacher.id, visitorId: existingUser.id },
          },
        })
        if (existingProfile) {
          return NextResponse.json(
            { error: 'هذا الزائر مضاف مسبقاً لهذا الحساب' },
            { status: 400 }
          )
        }
        await prisma.visitorProfile.create({
          data: {
            teacherId: teacher.id,
            visitorId: existingUser.id,
            scope: JSON.stringify(scope),
            isActive: true,
          },
        })
        return NextResponse.json({
          message: 'تم ربط الزائر بحسابك',
          visitor: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            scope,
          },
        })
      }
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم لحساب آخر (معلم/مدير)' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTrim,
      password: String(password),
      options: {
        data: {
          name: (name as string).trim(),
          role: 'visitor_reviewer',
        },
      },
    })
    if (authError) {
      let msg = authError.message
      if (msg.includes('already registered') || msg.includes('already exists')) {
        msg = 'البريد الإلكتروني مستخدم بالفعل'
      }
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    if (!authData.user) {
      return NextResponse.json(
        { error: 'لم يتم إنشاء المستخدم في نظام المصادقة' },
        { status: 500 }
      )
    }

    await prisma.user.create({
      data: {
        id: authData.user.id,
        email: emailTrim,
        name: (name as string).trim(),
        role: 'visitor_reviewer',
        isDisabled: false,
      },
    })
    await prisma.visitorProfile.create({
      data: {
        teacherId: teacher.id,
        visitorId: authData.user.id,
        scope: JSON.stringify(scope),
        isActive: true,
      },
    })
    return NextResponse.json({
      message: 'تم إنشاء حساب الزائر وربطه بحسابك. يمكن للزائر تسجيل الدخول بالبريد وكلمة المرور.',
      visitor: {
        id: authData.user.id,
        email: emailTrim,
        name: (name as string).trim(),
        scope,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message.includes('Teacher')) return NextResponse.json({ error: 'صلاحية معلم مطلوبة' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الزائر' }, { status: 500 })
  }
}
