import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export type User = {
  id: string
  email: string
  name: string
  role: string
  subscriptionPlan?: string
}

/**
 * الحصول على المستخدم الحالي من Supabase Auth
 * للاستخدام في Server Components و API Routes
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // جلب بيانات المستخدم من قاعدة البيانات باستخدام ID من Supabase
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
 * التحقق من أن المستخدم معلم
 */
export async function requireTeacher(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'teacher') {
    throw new Error('Forbidden: Teacher access required')
  }
  
  return user
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
    },
  }
}
