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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
    
    throw new Error(
      `Missing Supabase environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and make sure all required variables are set.'
    )
  }

  // التحقق من صحة المفتاح
  if (supabaseAnonKey === 'your-publishable-key-here' || 
      supabaseAnonKey === 'your-key-here' ||
      supabaseAnonKey.length < 50) {
    throw new Error(
      'Invalid Supabase API key. Please check your .env file:\n' +
      '- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY should be a valid Supabase anon/public key\n' +
      '- Get it from Supabase Dashboard > Settings > API > Project API keys'
    )
  }

  // التحقق من صحة URL
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(
      'Invalid Supabase URL. Please check your .env file:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL should be in format: https://your-project-ref.supabase.co\n' +
      '- Get it from Supabase Dashboard > Settings > API > Project URL'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


