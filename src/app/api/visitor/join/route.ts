import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * POST - الانضمام كزائر باستخدام رمز الدعوة (بعد تسجيل الدخول ببريدك)
 * body: { token: string }
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (!token) {
      return NextResponse.json(
        { error: 'رمز الدعوة مطلوب' },
        { status: 400 }
      )
    }

    const invite = await prisma.visitorInvite.findUnique({
      where: { token },
      include: { teacher: { select: { id: true, name: true } } },
    })
    if (!invite) {
      return NextResponse.json(
        { error: 'رابط الدعوة غير صالح أو منتهي' },
        { status: 404 }
      )
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط الدعوة' },
        { status: 410 }
      )
    }

    const existing = await prisma.visitorProfile.findUnique({
      where: {
        teacherId_visitorId: { teacherId: invite.teacherId, visitorId: user.id },
      },
    })
    if (existing) {
      return NextResponse.json({
        message: 'أنتِ مرتبطة مسبقاً بصلاحية الزيارة لهذا المعلم',
        redirect: '/visitor',
      })
    }

    await prisma.visitorProfile.create({
      data: {
        teacherId: invite.teacherId,
        visitorId: user.id,
        scope: invite.scope,
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'تم تفعيل صلاحية الزيارة. يمكنكِ الآن المعاينة والتعليق.',
      redirect: '/visitor',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً ببريدك الإلكتروني ثم فتح رابط الدعوة مرة أخرى' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تفعيل الدعوة' },
      { status: 500 }
    )
  }
}
