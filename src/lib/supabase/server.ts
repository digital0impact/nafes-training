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
      supabaseAnonKey.length < 40) {
    const errorMsg = supabaseAnonKey === 'your-publishable-key-here' || supabaseAnonKey === 'your-key-here'
      ? 'مفتاح Supabase غير صحيح - يرجى استبدال القيمة الافتراضية في ملف .env'
      : supabaseAnonKey.length < 40
      ? `مفتاح Supabase قصير جداً (${supabaseAnonKey.length} حرف) - المفتاح الصحيح عادة أكثر من 100 حرف`
      : 'مفتاح Supabase غير صحيح'
    
    const helpMsg = supabaseAnonKey.length < 100 && supabaseAnonKey.length >= 40
      ? '\n⚠️ ملاحظة: المفتاح يبدو قصيراً. تأكدي من نسخ المفتاح كاملاً من Supabase.\n' +
        '   المفتاح الصحيح يبدأ بـ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 ويحتوي على 3 أجزاء مفصولة بنقطة (.)\n'
      : ''
    
    throw new Error(
      `❌ ${errorMsg}\n\n` +
      '📝 الخطوات الصحيحة:\n' +
      '1. اذهبي إلى Supabase Dashboard: https://app.supabase.com\n' +
      '2. اختاري مشروعك\n' +
      '3. اذهبي إلى Settings > API\n' +
      '4. في قسم "Project API keys" ابحثي عن المفتاح المسمى "anon" أو "public"\n' +
      '5. اضغطي على أيقونة النسخ (Copy) بجانب المفتاح - لا تنسخي يدوياً\n' +
      '6. المفتاح الصحيح يبدأ بـ: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\n' +
      '7. المفتاح يجب أن يكون طويلاً جداً (أكثر من 100 حرف عادة)\n' +
      '8. الصقي المفتاح كاملاً في ملف .env\n' +
      helpMsg +
      '\n💡 نصيحة: استخدمي زر "Copy" في Supabase بدلاً من النسخ اليدوي'
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


