import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase Client للـ Server Side
 * يستخدم في Server Components و API Routes
 * 
 * @example
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 * 
 * export default async function Page() {
 *   const supabase = createClient()
 *   const { data } = await supabase.from('table').select()
 *   // ...
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

  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // قد يفشل في بعض السياقات (مثل middleware)
          // يمكن تجاهل الخطأ في هذه الحالة
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // قد يفشل في بعض السياقات
        }
      },
    },
  })
}


