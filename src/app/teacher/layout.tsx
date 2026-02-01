import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'

/**
 * تحقق من أن المستخدم معلم (أو مدير) - إعادة توجيه الزائر إلى /visitor
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin?error=يجب تسجيل الدخول أولاً')
  }
  if (user.role === 'visitor_reviewer') {
    redirect('/visitor')
  }
  return <>{children}</>
}
