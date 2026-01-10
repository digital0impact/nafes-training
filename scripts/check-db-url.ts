/**
 * Script للتحقق من DATABASE_URL بالتفصيل
 */

import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env')

if (!fs.existsSync(envPath)) {
  console.error('❌ ملف .env غير موجود!')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')

let dbUrlLine = ''
for (const line of lines) {
  if (line.trim().startsWith('DATABASE_URL')) {
    dbUrlLine = line.trim()
    break
  }
}

if (!dbUrlLine) {
  console.error('❌ DATABASE_URL غير موجود')
  process.exit(1)
}

console.log('📋 DATABASE_URL من ملف .env:\n')
console.log(dbUrlLine)
console.log('\n' + '='.repeat(70))

// استخراج القيمة
const match = dbUrlLine.match(/DATABASE_URL\s*=\s*(.+)/)
if (!match) {
  console.error('❌ لا يمكن قراءة DATABASE_URL')
  process.exit(1)
}

let dbUrl = match[1].trim()

// إزالة علامات الاقتباس
if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || 
    (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
  dbUrl = dbUrl.slice(1, -1)
}

console.log('\n🔍 تحليل DATABASE_URL:\n')

try {
  const url = new URL(dbUrl)
  
  console.log(`✅ البروتوكول: ${url.protocol}`)
  console.log(`✅ المضيف: ${url.hostname}`)
  console.log(`✅ المنفذ: ${url.port || 'غير محدد'}`)
  console.log(`✅ المسار: ${url.pathname}`)
  console.log(`\n👤 اسم المستخدم: ${url.username}`)
  console.log(`🔐 كلمة المرور: ${url.password ? '***' + url.password.substring(url.password.length - 3) : 'غير موجودة'}`)
  
  // التحقق من اسم المستخدم في Connection Pooling
  if (url.hostname.includes('pooler.supabase.com')) {
    console.log('\n📌 Connection Pooling detected')
    
    if (!url.username.includes('.')) {
      console.error('\n❌ المشكلة: اسم المستخدم غير صحيح!')
      console.error(`   الحالي: ${url.username}`)
      console.error(`   يجب أن يكون: postgres.vatqqurkedwlyuqrfwrr`)
      console.error(`   (مع النقطة بعد postgres)`)
    } else {
      console.log(`✅ اسم المستخدم صحيح: ${url.username}`)
    }
  }
  
  // التحقق من كلمة المرور
  if (!url.password) {
    console.error('\n❌ كلمة المرور غير موجودة!')
  } else if (url.password.length < 3) {
    console.error('\n❌ كلمة المرور قصيرة جداً!')
  } else {
    console.log(`✅ كلمة المرور موجودة (${url.password.length} حرف)`)
  }
  
  console.log('\n💡 إذا استمرت المشكلة:')
  console.log('   1. تأكدي من كلمة المرور الصحيحة من Supabase')
  console.log('   2. انسخي DATABASE_URL مباشرة من Supabase Dashboard')
  console.log('   3. لا تعدلي أي شيء في الرابط')
  
} catch (error: any) {
  console.error('\n❌ خطأ في تحليل DATABASE_URL:')
  console.error(`   ${error.message}`)
}

