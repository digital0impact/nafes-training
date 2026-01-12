'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase Client للـ Client Side
 * يستخدم في Client Components و hooks
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export function MyComponent() {
 *   const supabase = createClient()
 *   // استخدام supabase...
 * }
 * ```
 */
export function createClient() {
  // تخطي التحقق أثناء البناء على الخادم
  if (typeof window === 'undefined') {
    // إرجاع client وهمي أثناء SSR/Build
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder-key'
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
    
    console.error(`Missing Supabase environment variables: ${missing.join(', ')}`)
    // إرجاع client وهمي بدلاً من رمي خطأ
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  // التحقق من صحة المفتاح (تحذير فقط، لا نرمي خطأ)
  if (supabaseAnonKey === 'your-publishable-key-here' || 
      supabaseAnonKey === 'your-key-here' ||
      supabaseAnonKey.length < 40) {
    console.warn('⚠️ مفتاح Supabase قد يكون غير صحيح. تحققي من ملف .env')
  }

  // التحقق من صحة URL (تحذير فقط)
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.warn('⚠️ رابط Supabase قد يكون غير صحيح. تحققي من ملف .env')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


