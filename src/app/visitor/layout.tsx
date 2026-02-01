import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'

/**
 * تحقق من أن المستخدم زائر (visitor_reviewer) ونشط - إعادة توجيه المعلم إلى /teacher
 */
export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin?error=يجب تسجيل الدخول أولاً')
  }
  if (user.role !== 'visitor_reviewer') {
    redirect('/teacher')
  }
  if (user.isDisabled) {
    redirect('/auth/signin?error=تم تعطيل هذا الحساب. يرجى التواصل مع المعلم.')
  }
  return <>{children}</>
}
