import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile, canVisitorSee, type VisitorScopeKey } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * GET - قائمة الأنشطة (قراءة فقط) للزائر - بدون بيانات طلاب
 */
export async function GET() {
  try {
    const user = await requireVisitor()
    const profile = await getVisitorProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'لا توجد صلاحية زائر نشطة.' }, { status: 403 })
    }
    if (!canVisitorSee(profile.scope, 'activities' as VisitorScopeKey)) {
      return NextResponse.json({ error: 'غير مصرح بعرض الأنشطة.' }, { status: 403 })
    }
    const activities = await prisma.activity.findMany({
      where: { userId: profile.teacherId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        skill: true,
        targetLevel: true,
        outcomeLesson: true,
        type: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ activities })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الأنشطة' }, { status: 500 })
  }
}
