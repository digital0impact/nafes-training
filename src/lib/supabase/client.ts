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
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'placeholder-key'
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) {
      missing.push(
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
      )
    }
    
    console.error(`Missing Supabase environment variables: ${missing.join(', ')}`)
    throw new Error(`إعدادات Supabase ناقصة: ${missing.join(', ')}`)
  }

  const keyLooksInvalid =
    supabaseAnonKey === 'your-publishable-key-here' ||
    supabaseAnonKey === 'your-key-here' ||
    supabaseAnonKey === 'placeholder-key' ||
    supabaseAnonKey.length < 40
  if (keyLooksInvalid) {
    throw new Error('مفتاح Supabase غير صحيح. تحققي من متغيرات البيئة في Vercel')
  }

  const urlLooksInvalid =
    !supabaseUrl.startsWith('https://') ||
    !supabaseUrl.includes('.supabase.co') ||
    supabaseUrl.includes('placeholder')
  if (urlLooksInvalid) {
    throw new Error('رابط Supabase غير صحيح. تحققي من NEXT_PUBLIC_SUPABASE_URL')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


