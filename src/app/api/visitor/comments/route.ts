import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile, logAudit } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

const TARGET_TYPES = ['activity', 'test', 'indicator'] as const

/**
 * GET - قائمة التعليقات على عنصر محدد
 * Query: targetType, targetId
 */
export async function GET(request: Request) {
  try {
    await requireVisitor()
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('targetType')
    const targetId = searchParams.get('targetId')
    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'targetType و targetId مطلوبان' },
        { status: 400 }
      )
    }
    if (!TARGET_TYPES.includes(targetType as (typeof TARGET_TYPES)[number])) {
      return NextResponse.json({ error: 'نوع العنصر غير صالح' }, { status: 400 })
    }
    const comments = await prisma.visitorComment.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
      include: {
        visitor: { select: { name: true } },
      },
    })
    const list = comments.map((c) => ({
      id: c.id,
      visitorName: c.visitor.name,
      body: c.body,
      createdAt: c.createdAt,
    }))
    return NextResponse.json({ comments: list })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب التعليقات' }, { status: 500 })
  }
}

/**
 * POST - إضافة تعليق (لا يمكن تعديله أو حذفه لاحقاً)
 */
export async function POST(request: Request) {
  try {
    const user = await requireVisitor()
    const profile = await getVisitorProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'لا توجد صلاحية زائر نشطة.' }, { status: 403 })
    }

    const body = await request.json()
    const { targetType, targetId, body: commentBody } = body as {
      targetType?: string
      targetId?: string
      body?: string
    }
    if (!targetType || !targetId || typeof commentBody !== 'string' || !commentBody.trim()) {
      return NextResponse.json(
        { error: 'نوع العنصر، معرف العنصر، ونص التعليق مطلوبة' },
        { status: 400 }
      )
    }
    if (!TARGET_TYPES.includes(targetType as (typeof TARGET_TYPES)[number])) {
      return NextResponse.json({ error: 'نوع العنصر غير صالح' }, { status: 400 })
    }

    const comment = await prisma.visitorComment.create({
      data: {
        visitorId: user.id,
        targetType,
        targetId,
        body: commentBody.trim().slice(0, 2000),
      },
    })
    await logAudit({
      userId: user.id,
      action: 'visitor_comment',
      details: { commentId: comment.id, targetType, targetId },
    })
    return NextResponse.json({
      comment: {
        id: comment.id,
        visitorName: user.name,
        body: comment.body,
        createdAt: comment.createdAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة التعليق' }, { status: 500 })
  }
}
