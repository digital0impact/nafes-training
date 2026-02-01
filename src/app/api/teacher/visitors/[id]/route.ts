import { NextResponse } from 'next/server'
import { requireTeacher, VISITOR_SCOPE_KEYS, type VisitorScopeKey, logAudit } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH - تحديث صلاحية الزائر (تعطيل/تفعيل الحساب، أو نطاق العرض)
 * body: { isDisabled?: boolean, isActive?: boolean, scope?: string[] }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { isDisabled, isActive, scope: scopeInput } = body as {
      isDisabled?: boolean
      isActive?: boolean
      scope?: string[]
    }

    const profile = await prisma.visitorProfile.findFirst({
      where: { id, teacherId: teacher.id },
      include: { visitor: { select: { id: true, name: true } } },
    })
    if (!profile) {
      return NextResponse.json({ error: 'الزائر غير موجود أو غير مرتبط بحسابك' }, { status: 404 })
    }

    if (typeof isDisabled === 'boolean') {
      await prisma.user.update({
        where: { id: profile.visitorId },
        data: { isDisabled },
      })
      await logAudit({
        userId: teacher.id,
        action: isDisabled ? 'visitor_disabled' : 'visitor_enabled',
        details: { visitorId: profile.visitorId, visitorName: profile.visitor.name },
      })
    }
    if (typeof isActive === 'boolean') {
      await prisma.visitorProfile.update({
        where: { id },
        data: { isActive },
      })
    }
    if (Array.isArray(scopeInput)) {
      const scope = scopeInput.filter((s) =>
        (VISITOR_SCOPE_KEYS as readonly string[]).includes(s)
      ) as VisitorScopeKey[]
      if (scope.length > 0) {
        await prisma.visitorProfile.update({
          where: { id },
          data: { scope: JSON.stringify(scope) },
        })
      }
    }
    return NextResponse.json({ message: 'تم التحديث' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message.includes('Teacher')) return NextResponse.json({ error: 'صلاحية معلم مطلوبة' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء التحديث' }, { status: 500 })
  }
}

/**
 * DELETE - إزالة صلاحية الزائر (إلغاء ربطه بالمعلم، أو تعطيل الصلاحية)
 * لا يحذف حساب الزائر من النظام؛ يوقف صلاحية الوصول فقط.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    const { id } = await params

    const profile = await prisma.visitorProfile.findFirst({
      where: { id, teacherId: teacher.id },
      include: { visitor: { select: { name: true } } },
    })
    if (!profile) {
      return NextResponse.json({ error: 'الزائر غير موجود أو غير مرتبط بحسابك' }, { status: 404 })
    }

    await prisma.visitorProfile.update({
      where: { id },
      data: { isActive: false },
    })
    await logAudit({
      userId: teacher.id,
      action: 'visitor_removed',
      details: { visitorId: profile.visitorId, visitorName: profile.visitor.name },
    })
    return NextResponse.json({ message: 'تم إزالة صلاحية الزائر' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message.includes('Teacher')) return NextResponse.json({ error: 'صلاحية معلم مطلوبة' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء الإزالة' }, { status: 500 })
  }
}
