import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile, canVisitorSee, type VisitorScopeKey } from '@/lib/auth-server'
import { learningOutcomes } from '@/lib/data'
import { prisma } from '@/lib/prisma'

const weekNumber = (week: string) => parseInt(week.replace(/\D/g, '')) || 0
const periodRank = (period?: string) => (period === 'الفترة الثانية' ? 2 : period === 'الفترة الأولى' ? 1 : 3)

/** خطة نافس كما رتبتها المعلمة؛ إن لم تحفظ خطة تظهر الخطة الافتراضية */
async function getTeacherOutcomes(teacherId: string) {
  let plan: { periodChanges?: Record<string, string>; weekAssignments?: Record<string, string> } | null = null
  try {
    const rows = await prisma.$queryRaw<{ data: typeof plan }[]>`
      SELECT "data" FROM "teacher_plans" WHERE "userId" = ${teacherId}`
    plan = rows[0]?.data ?? null
  } catch {
    plan = null // الجدول لم يُنشأ بعد: لا توجد خطط محفوظة
  }
  const outcomes = learningOutcomes.map((item) => {
    const key = `${item.domain}-${item.lesson}`
    return {
      ...item,
      period: plan?.periodChanges?.[key] || item.period,
      week: plan?.weekAssignments?.[key] || item.week,
    }
  })
  return outcomes.sort((a, b) => periodRank(a.period) - periodRank(b.period) || weekNumber(a.week) - weekNumber(b.week))
}

/**
 * GET - خطة نافس (قراءة فقط) للزائر - بدون بيانات شخصية
 */
export async function GET() {
  try {
    const user = await requireVisitor()
    const profile = await getVisitorProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'لا توجد صلاحية زائر نشطة.' }, { status: 403 })
    }
    if (!canVisitorSee(profile.scope, 'nafes_plan' as VisitorScopeKey)) {
      return NextResponse.json({ error: 'غير مصرح بعرض خطة نافس.' }, { status: 403 })
    }
    return NextResponse.json({ outcomes: await getTeacherOutcomes(profile.teacherId) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب خطة نافس' }, { status: 500 })
  }
}
