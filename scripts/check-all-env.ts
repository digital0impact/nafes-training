/**
 * Script شامل للتحقق من جميع متغيرات البيئة المطلوبة
 * للاستخدام المحلي وللنشر على Vercel
 */

import * as fs from 'fs'
import * as path from 'path'

interface EnvVar {
  name: string
  required: boolean
  description: string
  environments: string[]
  example?: string
}

const requiredEnvVars: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'رابط مشروع Supabase',
    environments: ['production', 'preview', 'development'],
    example: 'https://vatqqurkedwlyuqrfwrr.supabase.co'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    required: true,
    description: 'المفتاح العام من Supabase',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'رابط اتصال قاعدة البيانات',
    environments: ['production', 'preview', 'development'],
    example: 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'مفتاح سري لتوقيع JWT tokens',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'رابط التطبيق',
    environments: ['production'],
    example: 'https://your-app.vercel.app'
  },
  {
    name: 'SKIP_ENV_VALIDATION',
    required: false,
    description: 'تخطي التحقق من متغيرات البيئة',
    environments: ['production', 'preview', 'development']
  }
]

function checkAllEnv() {
  const envPath = path.join(process.cwd(), '.env')
  
  console.log('🔍 التحقق الشامل من متغيرات البيئة\n')
  console.log('='.repeat(80))
  
  // التحقق من وجود ملف .env
  if (!fs.existsSync(envPath)) {
    console.error('\n❌ ملف .env غير موجود!')
    console.error('\n💡 الحل:')
    console.error('   1. انسخي ملف env.example إلى .env')
    console.error('   2. أضيفي القيم الصحيحة من Supabase Dashboard')
    console.error('   3. شغلي هذا السكريبت مرة أخرى\n')
    printVercelChecklist()
    process.exit(1)
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  // استخراج جميع المتغيرات من ملف .env
  const envVars: Record<string, string> = {}
  
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key) {
        const value = valueParts.join('=').trim()
        envVars[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
  
  console.log('\n📋 نتائج التحقق:\n')
  
  let allValid = true
  const missing: string[] = []
  const invalid: string[] = []
  const warnings: string[] = []
  
  // التحقق من كل متغير مطلوب
  requiredEnvVars.forEach((envVar) => {
    const value = envVars[envVar.name]
    
    if (!value) {
      if (envVar.required) {
        console.error(`❌ ${envVar.name}: غير موجود`)
        console.error(`   ${envVar.description}`)
        missing.push(envVar.name)
        allValid = false
      } else {
        console.warn(`⚠️  ${envVar.name}: غير موجود (اختياري)`)
        console.warn(`   ${envVar.description}`)
      }
    } else {
      // التحقق من القيم الافتراضية
      if (value.includes('your-') || value.includes('[YOUR-') || value.includes('[PASSWORD]') || value.includes('[PROJECT-REF]')) {
        console.error(`❌ ${envVar.name}: يحتوي على قيمة افتراضية`)
        console.error(`   القيمة: ${value.substring(0, 50)}...`)
        invalid.push(envVar.name)
        allValid = false
      } else {
        // تحقق خاص لكل متغير
        const isValid = validateEnvVar(envVar.name, value, warnings)
        if (isValid) {
          console.log(`✅ ${envVar.name}: موجود وصحيح`)
        } else {
          console.error(`❌ ${envVar.name}: غير صحيح`)
          invalid.push(envVar.name)
          allValid = false
        }
      }
    }
  })
  
  // عرض التحذيرات
  if (warnings.length > 0) {
    console.log('\n⚠️  تحذيرات:')
    warnings.forEach(warning => console.warn(`   - ${warning}`))
  }
  
  console.log('\n' + '='.repeat(80))
  
  // ملخص
  if (allValid && warnings.length === 0) {
    console.log('\n✅ جميع متغيرات البيئة صحيحة!')
    console.log('💡 يمكنك الآن:')
    console.log('   - تشغيل التطبيق محلياً: npm run dev')
    console.log('   - بناء التطبيق: npm run build')
    console.log('   - النشر على Vercel')
  } else {
    console.log('\n❌ هناك مشاكل في متغيرات البيئة')
    
    if (missing.length > 0) {
      console.log('\n📌 المتغيرات المفقودة:')
      missing.forEach(name => {
        const envVar = requiredEnvVars.find(v => v.name === name)
        console.log(`   - ${name}: ${envVar?.description}`)
        if (envVar?.example) {
          console.log(`     مثال: ${envVar.example}`)
        }
      })
    }
    
    if (invalid.length > 0) {
      console.log('\n📌 المتغيرات غير الصحيحة:')
      invalid.forEach(name => {
        console.log(`   - ${name}: يجب تحديث القيمة`)
      })
    }
    
    console.log('\n💡 الحل:')
    console.log('   1. افتحي ملف .env')
    console.log('   2. أضيفي/حدثي المتغيرات المفقودة أو غير الصحيحة')
    console.log('   3. استخدمي القيم من Supabase Dashboard')
    console.log('   4. شغلي هذا السكريبت مرة أخرى')
  }
  
  // قائمة التحقق لـ Vercel
  printVercelChecklist()
}

function validateEnvVar(name: string, value: string, warnings: string[]): boolean {
  switch (name) {
    case 'NEXT_PUBLIC_SUPABASE_URL':
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        return false
      }
      return true
      
    case 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY':
      if (value.length < 50) {
        return false
      }
      return true
      
    case 'DATABASE_URL':
      if (!value.startsWith('postgresql://')) {
        return false
      }
      if (!value.includes(':5432') && !value.includes(':6543')) {
        warnings.push('DATABASE_URL: لا يحتوي على منفذ واضح (5432 أو 6543)')
      }
      // التحقق من الأحرف الخاصة في كلمة المرور
      const passwordMatch = value.match(/postgresql:\/\/[^:]+:(.+?)@/)
      if (passwordMatch) {
        const password = passwordMatch[1]
        const specialChars = ['@', '#', '$', '%', '&', '+', '=', '?', '/', ':']
        const hasSpecialChars = specialChars.some(char => password.includes(char) && !password.includes('%'))
        if (hasSpecialChars) {
          warnings.push('DATABASE_URL: كلمة المرور تحتوي على أحرف خاصة قد تحتاج إلى encoding')
        }
      }
      return true
      
    case 'NEXTAUTH_SECRET':
      if (value.length < 10) {
        warnings.push('NEXTAUTH_SECRET: قصير جداً (يُنصح بـ 32 حرف على الأقل)')
      }
      return true
      
    case 'NEXTAUTH_URL':
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return false
      }
      return true
      
    default:
      return true
  }
}

function printVercelChecklist() {
  console.log('\n' + '='.repeat(80))
  console.log('📋 قائمة التحقق لـ Vercel:\n')
  
  requiredEnvVars.forEach((envVar) => {
    const environments = envVar.environments.join(', ')
    console.log(`[ ] ${envVar.name}`)
    console.log(`    البيئة: ${environments}`)
    console.log(`    الوصف: ${envVar.description}`)
    if (envVar.example) {
      console.log(`    مثال: ${envVar.example}`)
    }
    console.log()
  })
  
  console.log('💡 خطوات إضافة المتغيرات في Vercel:')
  console.log('   1. اذهبي إلى Vercel Dashboard → Project Settings → Environment Variables')
  console.log('   2. أضيفي كل متغير مع تحديد البيئة المناسبة')
  console.log('   3. بعد الإضافة، اضغطي "Redeploy" لإعادة النشر')
  console.log('='.repeat(80))
}

checkAllEnv()
