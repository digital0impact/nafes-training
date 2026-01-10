/**
 * Script لعرض محتوى ملف .env (بدون كلمات المرور)
 */

import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env')

console.log('🔍 فحص ملف .env...\n')

if (!fs.existsSync(envPath)) {
  console.error('❌ ملف .env غير موجود!')
  console.error('💡 شغلي: npm run fix-env')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')

console.log('📄 محتوى ملف .env:\n')
console.log('='.repeat(70))

let hasDatabaseUrl = false

lines.forEach((line, index) => {
  const trimmed = line.trim()
  
  if (trimmed.startsWith('DATABASE_URL')) {
    hasDatabaseUrl = true
    console.log(`\n✅ السطر ${index + 1}: DATABASE_URL موجود`)
    
    // عرض أول 50 حرف وآخر 20 حرف
    if (trimmed.length > 70) {
      const start = trimmed.substring(0, 50)
      const end = trimmed.substring(trimmed.length - 20)
      console.log(`   ${start}...${end}`)
    } else {
      console.log(`   ${trimmed}`)
    }
    
    // التحقق من وجود المنفذ
    if (!trimmed.includes(':5432') && !trimmed.includes(':6543')) {
      console.error(`\n❌ المشكلة: لا يوجد رقم منفذ في DATABASE_URL`)
      console.error(`   يجب أن يحتوي على :5432 أو :6543`)
    }
    
    // التحقق من وجود placeholder
    if (trimmed.includes('[YOUR-PASSWORD]') || trimmed.includes('[PASSWORD]') || trimmed.includes('[PROJECT-REF]')) {
      console.error(`\n❌ المشكلة: DATABASE_URL يحتوي على placeholder`)
      console.error(`   استبدلي [YOUR-PASSWORD] و [PROJECT-REF] بالقيم الصحيحة`)
    }
    
    // التحقق من اسم المستخدم في Connection Pooling
    if (trimmed.includes('pooler.supabase.com')) {
      const userMatch = trimmed.match(/postgresql:\/\/([^:]+):/)
      if (userMatch) {
        const username = userMatch[1]
        if (!username.includes('.')) {
          console.error(`\n❌ المشكلة: اسم المستخدم في Connection Pooling غير صحيح`)
          console.error(`   الحالي: ${username}`)
          console.error(`   يجب أن يكون: postgres.PROJECT-REF`)
          console.error(`   مثال: postgres.vatqqurkedwlyuqrfwrr`)
        } else {
          console.log(`\n✅ اسم المستخدم صحيح: ${username}`)
        }
      }
    }
  } else if (trimmed && !trimmed.startsWith('#')) {
    const [key] = trimmed.split('=')
    if (key) {
      console.log(`${(index + 1).toString().padStart(3)}: ${key.trim()}`)
    }
  }
})

console.log('\n' + '='.repeat(70))

if (!hasDatabaseUrl) {
  console.error('\n❌ DATABASE_URL غير موجود في ملف .env!')
  console.error('\n💡 الحل:')
  console.error('   1. افتحي ملف .env')
  console.error('   2. أضيفي هذا السطر:')
  console.error('   DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"')
  console.error('   3. استبدلي PASSWORD و PROJECT بالقيم الصحيحة')
  console.error('\n   أو شغلي: npm run fix-env')
} else {
  console.log('\n✅ DATABASE_URL موجود')
}

