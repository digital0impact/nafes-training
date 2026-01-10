'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export type User = {
  id: string
  email: string
  name: string
  role: string
  subscriptionPlan?: string
}

/**
 * Hook للحصول على المستخدم الحالي في Client Components
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // الحصول على المستخدم الحالي
    supabase.auth.getUser().then(({ data: { user: authUser }, error }) => {
      if (error || !authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // جلب بيانات المستخدم من قاعدة البيانات
      fetch('/api/auth/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user)
          } else {
            setUser(null)
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    })

    // الاستماع لتغييرات المصادقة
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetch('/api/auth/user')
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              setUser(data.user)
            } else {
              setUser(null)
            }
          })
          .catch(() => setUser(null))
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}


