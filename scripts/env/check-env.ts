/**
 * فحص شامل لملف .env: يعرض محتواه (بدون كشف القيم الحساسة كاملة)، يتحقق من
 * جميع المتغيرات المطلوبة، ويحلل DATABASE_URL ومفاتيح Supabase بالتفصيل.
 *
 * يجمع هذا السكريبت وظائف السكريبتات القديمة:
 * check-all-env / check-db-url / check-supabase-keys / debug-env /
 * show-env / simple-check / validate-env
 *
 * الاستخدام: npm run check-env
 */

import {
  Issue,
  analyzeDatabaseUrl,
  analyzeSupabaseKey,
  analyzeSupabaseUrl,
  maskValue,
  parseEnvVars,
  readEnvFileOrExit,
} from './lib'

interface RequiredVar {
  name: string
  required: boolean
  description: string
  environments: string[]
  example?: string
  analyze?: (value: string) => Issue[]
}

const REQUIRED_VARS: RequiredVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'رابط مشروع Supabase',
    environments: ['production', 'preview', 'development'],
    example: 'https://your-project-ref.supabase.co',
    analyze: analyzeSupabaseUrl,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    required: true,
    description: 'المفتاح العام (anon/publishable) من Supabase',
    environments: ['production', 'preview', 'development'],
    analyze: analyzeSupabaseKey,
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'رابط اتصال قاعدة البيانات',
    environments: ['production', 'preview', 'development'],
    example: 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres',
    analyze: analyzeDatabaseUrl,
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'مفتاح سري لتوقيع JWT tokens (يُنصح بـ 32 حرف على الأقل)',
    environments: ['production', 'preview', 'development'],
    analyze: (value) =>
      value.length < 10
        ? [{ level: 'warning', message: 'NEXTAUTH_SECRET قصير جداً (يُنصح بـ 32 حرف على الأقل)' }]
        : [],
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'رابط التطبيق',
    environments: ['production'],
    example: 'https://your-app.vercel.app',
    analyze: (value) =>
      !value.startsWith('http://') && !value.startsWith('https://')
        ? [{ level: 'error', message: 'NEXTAUTH_URL يجب أن يبدأ بـ http:// أو https://' }]
        : [],
  },
  {
    name: 'SKIP_ENV_VALIDATION',
    required: false,
    description: 'تخطي التحقق من متغيرات البيئة (اختياري، يُستخدم في Vercel)',
    environments: ['production', 'preview', 'development'],
  },
]

function printFileOverview(content: string) {
  console.log('📄 محتوى ملف .env (القيم الحساسة مخفية جزئياً):\n')
  console.log('-'.repeat(70))
  content.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eq = trimmed.indexOf('=')
    if (eq === -1) return
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    const lineNumber = String(index + 1).padStart(3, '0')
    console.log(`${lineNumber}: ${key}=${maskValue(value)}`)
  })
  console.log('-'.repeat(70))
}

function printVercelChecklist() {
  console.log('\n' + '='.repeat(80))
  console.log('📋 قائمة التحقق لـ Vercel:\n')

  REQUIRED_VARS.forEach((envVar) => {
    console.log(`[ ] ${envVar.name}`)
    console.log(`    البيئة: ${envVar.environments.join(', ')}`)
    console.log(`    الوصف: ${envVar.description}`)
    if (envVar.example) console.log(`    مثال: ${envVar.example}`)
    console.log()
  })

  console.log('💡 خطوات إضافة المتغيرات في Vercel:')
  console.log('   1. اذهبي إلى Vercel Dashboard → Project Settings → Environment Variables')
  console.log('   2. أضيفي كل متغير مع تحديد البيئة المناسبة')
  console.log('   3. بعد الإضافة، اضغطي "Redeploy" لإعادة النشر')
  console.log('='.repeat(80))
}

function main() {
  console.log('🔍 فحص شامل لملف .env\n')
  console.log('='.repeat(80))

  const content = readEnvFileOrExit()
  const envVars = parseEnvVars(content)

  printFileOverview(content)

  console.log('\n📋 نتائج التحقق من المتغيرات المطلوبة:\n')

  let hasErrors = false
  const allWarnings: string[] = []

  REQUIRED_VARS.forEach((envVar) => {
    const value = envVars[envVar.name] ?? ''

    if (!value) {
      if (envVar.required) {
        console.error(`❌ ${envVar.name}: غير موجود`)
        console.error(`   ${envVar.description}`)
        hasErrors = true
      } else {
        console.warn(`⚠️  ${envVar.name}: غير موجود (اختياري)`)
      }
      return
    }

    const issues = envVar.analyze ? envVar.analyze(value) : []
    const errors = issues.filter((i) => i.level === 'error')
    const warnings = issues.filter((i) => i.level === 'warning')

    if (errors.length === 0) {
      console.log(`✅ ${envVar.name}: موجود وصحيح`)
    } else {
      console.error(`❌ ${envVar.name}:`)
      errors.forEach((e) => console.error(`   - ${e.message}`))
      hasErrors = true
    }

    warnings.forEach((w) => {
      console.warn(`⚠️  ${envVar.name}: ${w.message}`)
      allWarnings.push(`${envVar.name}: ${w.message}`)
    })
  })

  console.log('\n' + '='.repeat(80))

  if (!hasErrors) {
    console.log('\n✅ جميع متغيرات البيئة صحيحة!')
    if (allWarnings.length > 0) {
      console.log('\n⚠️  ملاحظات (لا تمنع التشغيل لكن يُستحسن مراجعتها):')
      allWarnings.forEach((w) => console.log(`   - ${w}`))
    }
    console.log('\n💡 يمكنك الآن:')
    console.log('   - تشغيل التطبيق محلياً: npm run dev')
    console.log('   - اختبار الاتصال الفعلي بقاعدة البيانات: npm run check-db')
    console.log('   - بناء التطبيق: npm run build')
  } else {
    console.log('\n❌ هناك مشاكل في متغيرات البيئة، راجعي الأخطاء أعلاه')
    console.log('\n💡 الحل:')
    console.log('   1. افتحي ملف .env')
    console.log('   2. أضيفي/حدثي المتغيرات المفقودة أو غير الصحيحة باستخدام القيم من Supabase Dashboard')
    console.log('   3. أو شغلي: npm run fix-env لإنشاء/تطبيع الملف')
    console.log('   4. شغلي هذا السكريبت مرة أخرى')
  }

  printVercelChecklist()

  if (hasErrors) process.exit(1)
}

main()
