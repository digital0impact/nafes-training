import { NextResponse } from 'next/server'
import { requireTeacher, VISITOR_SCOPE_KEYS, type VisitorScopeKey } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const DEFAULT_SCOPE: VisitorScopeKey[] = ['nafes_plan', 'activities', 'results', 'learning_indicators']

/**
 * POST - إنشاء رابط دعوة زائر جديد
 * body: { scope?: string[] }
 * returns: { inviteUrl, token }
 */
export async function POST(request: Request) {
  try {
    const teacher = await requireTeacher()
    const body = await request.json().catch(() => ({}))
    const scopeInput = body.scope as string[] | undefined
    const scope: VisitorScopeKey[] = Array.isArray(scopeInput)
      ? (scopeInput.filter((s) => VISITOR_SCOPE_KEYS.includes(s as VisitorScopeKey)) as VisitorScopeKey[])
      : DEFAULT_SCOPE
    if (scope.length === 0) {
      return NextResponse.json(
        { error: 'يجب تحديد نطاق عرض واحد على الأقل' },
        { status: 400 }
      )
    }

    const token = crypto.randomBytes(24).toString('base64url')
    await prisma.visitorInvite.create({
      data: {
        teacherId: teacher.id,
        token,
        scope: JSON.stringify(scope),
      },
    })

    const url = new URL(request.url)
    const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin
    const inviteUrl = `${origin.replace(/\/$/, '')}/visitor/join?token=${encodeURIComponent(token)}`

    return NextResponse.json({
      message: 'تم إنشاء رابط الدعوة',
      inviteUrl,
      token,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    if (message === 'Unauthorized') return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    if (message.includes('Teacher')) return NextResponse.json({ error: 'صلاحية معلم مطلوبة' }, { status: 403 })
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الرابط' }, { status: 500 })
  }
}
