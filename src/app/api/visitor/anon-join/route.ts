import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  ANON_VISITOR_COOKIE_NAME,
  encodeAnonVisitorSession,
} from '@/lib/anon-visitor-session'

/**
 * POST - الانضمام كزائر باستخدام رمز الدعوة فقط (بدون تسجيل دخول)
 * body: { token: string }
 * ينشئ مستخدم زائر مجهول + VisitorProfile، ويضبط cookie موقّعة للجلسة.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''

    if (!token) {
      return NextResponse.json(
        { error: 'رمز الدعوة مطلوب' },
        { status: 400 },
      )
    }

    const invite = await prisma.visitorInvite.findUnique({
      where: { token },
      include: { teacher: { select: { id: true, name: true } } },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'رابط الدعوة غير صالح أو منتهي' },
        { status: 404 },
      )
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط الدعوة' },
        { status: 410 },
      )
    }

    // إنشاء مستخدم زائر مجهول جديد لكل رابط/جلسة
    const anonEmail = `anon+${invite.teacherId}-${Date.now()}@visitor.local`
    const anonUser = await prisma.user.create({
      data: {
        email: anonEmail,
        name: 'زائر',
        role: 'visitor_reviewer',
      },
    })

    await prisma.visitorProfile.create({
      data: {
        teacherId: invite.teacherId,
        visitorId: anonUser.id,
        scope: invite.scope,
        isActive: true,
      },
    })

    const sessionValue = encodeAnonVisitorSession({
      visitorId: anonUser.id,
      iat: Math.floor(Date.now() / 1000),
    })

    const res = NextResponse.json({
      message: 'تم تفعيل صلاحية الزيارة للزائر المجهول. يمكنكِ الآن المعاينة والتعليق.',
      redirect: '/visitor',
    })

    res.cookies.set({
      name: ANON_VISITOR_COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // أسبوع
    })

    return res
  } catch (error: unknown) {
    console.error('Error in anon visitor join:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تفعيل الدعوة للزائر' },
      { status: 500 },
    )
  }
}

