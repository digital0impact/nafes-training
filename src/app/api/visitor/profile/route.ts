import { NextResponse } from 'next/server'
import { requireVisitor, getVisitorProfile } from '@/lib/auth-server'

/**
 * GET - جلب صلاحية الزائر (نطاق العرض والمعلم المرتبط)
 */
export async function GET() {
  try {
    const user = await requireVisitor()
    const profile = await getVisitorProfile(user.id)
    if (!profile) {
      return NextResponse.json(
        { error: 'لا توجد صلاحية زائر نشطة مرتبطة بحسابك.' },
        { status: 403 }
      )
    }
    return NextResponse.json(profile)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }
    if (message === 'Forbidden: Account disabled') {
      return NextResponse.json({ error: 'تم تعطيل هذا الحساب.' }, { status: 403 })
    }
    if (message === 'Forbidden: Visitor access required') {
      return NextResponse.json({ error: 'صلاحية زائر مطلوبة' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الصلاحية' },
      { status: 500 }
    )
  }
}
