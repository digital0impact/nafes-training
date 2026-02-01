import { NextResponse } from 'next/server'
import { requireTeacher } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * GET - سجل تدقيق أنشطة الزوار المرتبطين بالمعلم
 * Query: limit (default 100), offset (default 0)
 */
export async function GET(request: Request) {
  try {
    const teacher = await requireTeacher()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 200)
    const offset = Number(searchParams.get('offset')) || 0

    const visitorIds = await prisma.visitorProfile
      .findMany({
        where: { teacherId: teacher.id },
        select: { visitorId: true },
      })
      .then((rows) => rows.map((r) => r.visitorId))

    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { userId: teacher.id, action: { in: ['visitor_disabled', 'visitor_enabled', 'visitor_removed'] } },
          { userId: { in: visitorIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })
    const list = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userName: l.user.name,
      userEmail: l.user.email,
      userRole: l.user.role,
      action: l.action,
      details: l.details ? (() => { try { return JSON.parse(l.details!); } catch { return l.details; } })() : null,
      createdAt: l.createdAt,
    }))
    return NextResponse.json({ auditLogs: list })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message.includes('Teacher')) return NextResponse.json({ error: 'صلاحية معلم مطلوبة' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب سجل التدقيق' }, { status: 500 })
  }
}
