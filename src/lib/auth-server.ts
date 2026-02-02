import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export type User = {
  id: string
  email: string
  name: string
  role: string
  subscriptionPlan?: string
  isDisabled?: boolean
}

/** نطاقات عرض الزائر التي يحددها المعلم */
export const VISITOR_SCOPE_KEYS = [
  'nafes_plan',
  'activities',
  'results',
  'learning_indicators',
] as const
export type VisitorScopeKey = (typeof VISITOR_SCOPE_KEYS)[number]

export type VisitorProfileData = {
  id: string
  teacherId: string
  teacherName: string
  scope: VisitorScopeKey[]
  isActive: boolean
}

/**
 * الحصول على المستخدم الحالي من Supabase Auth
 * للاستخدام في Server Components و API Routes
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionPlan: true,
      },
    })

    if (!dbUser) {
      return null
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      subscriptionPlan: dbUser.subscriptionPlan,
      isDisabled: false,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * التحقق من أن المستخدم مسجل دخول
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

/**
 * التحقق من أن المستخدم معلم (أو مدير) - يمنع الزائر من الوصول
 */
export async function requireTeacher(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'teacher' && user.role !== 'admin') {
    throw new Error('Forbidden: Teacher access required')
  }
  
  return user
}

/**
 * التحقق من أن المستخدم زائر (visitor_reviewer) ونشط
 */
export async function requireVisitor(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'visitor_reviewer') {
    throw new Error('Forbidden: Visitor access required')
  }
  
  if (user.isDisabled) {
    throw new Error('Forbidden: Account disabled')
  }
  
  return user
}

/**
 * جلب صلاحية الزائر (VisitorProfile) للمعلم المحدد
 */
export async function getVisitorProfile(visitorId: string): Promise<VisitorProfileData | null> {
  const profile = await prisma.visitorProfile.findFirst({
    where: { visitorId, isActive: true },
    include: {
      teacher: { select: { id: true, name: true } },
    },
  })
  if (!profile) return null
  let scope: VisitorScopeKey[] = []
  try {
    scope = JSON.parse(profile.scope) as VisitorScopeKey[]
  } catch {
    scope = []
  }
  return {
    id: profile.id,
    teacherId: profile.teacherId,
    teacherName: profile.teacher.name,
    scope,
    isActive: profile.isActive,
  }
}

/**
 * التحقق من أن الزائر مسموح له برؤية القسم
 */
export function canVisitorSee(scope: VisitorScopeKey[], section: VisitorScopeKey): boolean {
  return scope.includes(section)
}

/**
 * تسجيل حدث في سجل التدقيق
 */
export async function logAudit(params: {
  userId: string
  action: string
  details?: Record<string, unknown>
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    })
  } catch (error) {
    console.error('Error writing audit log:', error)
  }
}

/**
 * دالة auth للتوافق مع الكود القديم
 * @deprecated استخدم getCurrentUser بدلاً منها
 */
export async function auth() {
  const user = await getCurrentUser()
  
  if (!user) {
    return { user: null }
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      isDisabled: user.isDisabled,
    },
  }
}
