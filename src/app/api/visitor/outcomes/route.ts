import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile, canVisitorSee, type VisitorScopeKey } from '@/lib/auth-server'
import { learningOutcomes } from '@/lib/data'

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
    return NextResponse.json({ outcomes: learningOutcomes })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message === 'Forbidden: Account disabled') return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب خطة نافس' }, { status: 500 })
  }
}
