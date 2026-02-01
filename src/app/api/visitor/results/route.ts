import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile, canVisitorSee, type VisitorScopeKey } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * GET - نتائج مجمعة فقط (بدون أسماء أو هويات طلاب) للزائر
 */
export async function GET() {
  try {
    const user = await requireVisitor()
    const profile = await getVisitorProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'لا توجد صلاحية زائر نشطة.' }, { status: 403 })
    }
    if (!canVisitorSee(profile.scope, 'results' as VisitorScopeKey)) {
      return NextResponse.json({ error: 'غير مصرح بعرض النتائج.' }, { status: 403 })
    }

    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek) % 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToSaturday)
    weekStart.setHours(0, 0, 0, 0)

    const classesCount = await prisma.class.count({
      where: { userId: profile.teacherId },
    })
    const studentsCount = await prisma.student.count({
      where: { class: { userId: profile.teacherId } },
    })
    const weeklyAttempts = await prisma.trainingAttempt.count({
      where: {
        class: { userId: profile.teacherId },
        completedAt: { gte: weekStart },
      },
    })
    const attempts = await prisma.trainingAttempt.findMany({
      where: { class: { userId: profile.teacherId } },
      select: { percentage: true },
    })
    const averageScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / attempts.length)
        : 0
    const advancedCount = attempts.filter((a) => (a.percentage ?? 0) >= 80).length
    const needSupportCount = attempts.filter((a) => (a.percentage ?? 0) < 60).length
    const weeklyActivities = await prisma.gameAttempt.count({
      where: {
        class: { userId: profile.teacherId },
        completedAt: { gte: weekStart },
      },
    })

    return NextResponse.json({
      classesCount,
      studentsCount,
      weeklyAttempts,
      averageScore,
      advancedStudents: advancedCount,
      needSupportStudents: needSupportCount,
      weeklyActivities,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب النتائج' }, { status: 500 })
  }
}
