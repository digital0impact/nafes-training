import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile, canVisitorSee, type VisitorScopeKey } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * GET - مؤشرات التعلم مجمعة (بدون بيانات طلاب شخصية) للزائر
 */
export async function GET() {
  try {
    const user = await requireVisitor()
    const profile = await getVisitorProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'لا توجد صلاحية زائر نشطة.' }, { status: 403 })
    }
    if (!canVisitorSee(profile.scope, 'learning_indicators' as VisitorScopeKey)) {
      return NextResponse.json({ error: 'غير مصرح بعرض مؤشرات التعلم.' }, { status: 403 })
    }

    const studentIds = await prisma.student.findMany({
      where: { class: { userId: profile.teacherId } },
      select: { id: true },
    })
    const ids = studentIds.map((s) => s.id)
    const mastery = await prisma.studentMastery.findMany({
      where: { studentDbId: { in: ids } },
      select: { key: true, status: true, score: true },
    })
    const byKey: Record<string, { mastered: number; notMastered: number; avgScore: number; count: number }> = {}
    mastery.forEach((m) => {
      if (!byKey[m.key]) {
        byKey[m.key] = { mastered: 0, notMastered: 0, avgScore: 0, count: 0 }
      }
      if (m.status === 'mastered') byKey[m.key].mastered++
      else byKey[m.key].notMastered++
      byKey[m.key].count++
      if (m.score != null) {
        byKey[m.key].avgScore += m.score
      }
    })
    const indicators = Object.entries(byKey).map(([key, v]) => ({
      key,
      mastered: v.mastered,
      notMastered: v.notMastered,
      total: v.mastered + v.notMastered,
      averageScore: v.count > 0 ? Math.round((v.avgScore / v.count) * 100) / 100 : null,
    }))

    return NextResponse.json({ indicators })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب مؤشرات التعلم' }, { status: 500 })
  }
}
