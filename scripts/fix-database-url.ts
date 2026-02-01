/**
 * Script للتحقق من DATABASE_URL وإصلاحه
 * استخدمي: npm run fix-db-url
 * أو: npx tsx scripts/fix-database-url.ts
 */

import * as fs from 'fs'
import * as path from 'path'

function fixDatabaseUrl() {
  const envPath = path.join(process.cwd(), '.env')
  
  console.log('🔍 التحقق من DATABASE_URL...\n')
  console.log('='.repeat(70))
  
  // التحقق من وجود ملف .env
  if (!fs.existsSync(envPath)) {
    console.error('\n❌ ملف .env غير موجود!')
    console.error('\n💡 الحل:')
    console.error('   1. شغلي: npm run fix-env')
    console.error('   2. أو انسخي env.example إلى .env')
    console.error('   3. ثم أضيفي DATABASE_URL من Supabase Dashboard\n')
    process.exit(1)
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  let dbUrlLineIndex = -1
  let dbUrlLine = ''
  let dbUrlValue = ''
  
  // البحث عن DATABASE_URL
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('DATABASE_URL')) {
      dbUrlLineIndex = i
      dbUrlLine = line
      
      // استخراج القيمة
      const match = line.match(/DATABASE_URL\s*=\s*(.+)/)
      if (match) {
        dbUrlValue = match[1].trim()
        // إزالة علامات الاقتباس
        if ((dbUrlValue.startsWith('"') && dbUrlValue.endsWith('"')) || 
            (dbUrlValue.startsWith("'") && dbUrlValue.endsWith("'"))) {
          dbUrlValue = dbUrlValue.slice(1, -1)
        }
      }
      break
    }
  }
  
  // إذا لم يكن موجوداً
  if (dbUrlLineIndex === -1) {
    console.error('\n❌ DATABASE_URL غير موجود في ملف .env')
    console.error('\n💡 الحل:')
    console.error('   1. اذهبي إلى Supabase Dashboard → Settings → Database')
    console.error('   2. انسخي Connection string (URI)')
    console.error('   3. أضيفي السطر التالي إلى ملف .env:')
    console.error('      DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"')
    console.error('   4. استبدلي [PASSWORD] و [PROJECT-REF] بالقيم الصحيحة\n')
    process.exit(1)
  }
  
  console.log('\n📋 DATABASE_URL موجود:')
  console.log(`   ${dbUrlLine.substring(0, 80)}${dbUrlLine.length > 80 ? '...' : ''}`)
  
  // التحقق من القيمة
  if (!dbUrlValue) {
    console.error('\n❌ DATABASE_URL موجود لكنه فارغ!')
    console.error('\n💡 الحل:')
    console.error('   1. اذهبي إلى Supabase Dashboard → Settings → Database')
    console.error('   2. انسخي Connection string (URI)')
    console.error('   3. استبدلي القيمة الفارغة في ملف .env\n')
    process.exit(1)
  }
  
  // التحقق من البروتوكول
  if (!dbUrlValue.startsWith('postgresql://') && !dbUrlValue.startsWith('postgres://')) {
    console.error('\n❌ DATABASE_URL لا يبدأ بـ postgresql:// أو postgres://')
    console.error(`   القيمة الحالية: ${dbUrlValue.substring(0, 50)}...`)
    console.error('\n💡 الحل:')
    console.error('   1. تأكدي من نسخ DATABASE_URL مباشرة من Supabase Dashboard')
    console.error('   2. يجب أن يبدأ بـ: postgresql://')
    console.error('   3. مثال صحيح: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n')
    process.exit(1)
  }
  
  // التحقق من وجود placeholder
  if (dbUrlValue.includes('[YOUR-PASSWORD]') || 
      dbUrlValue.includes('[PASSWORD]') || 
      dbUrlValue.includes('[PROJECT-REF]') ||
      dbUrlValue.includes('YOUR_PASSWORD_HERE') ||
      dbUrlValue.includes('YOUR_PROJECT_REF_HERE')) {
    console.error('\n❌ DATABASE_URL يحتوي على placeholder')
    console.error('   يجب استبدال [PASSWORD] و [PROJECT-REF] بالقيم الصحيحة')
    console.error('\n💡 الحل:')
    console.error('   1. اذهبي إلى Supabase Dashboard → Settings → Database')
    console.error('   2. انسخي Connection string (URI) مباشرة')
    console.error('   3. استبدلي السطر في ملف .env بالقيمة الصحيحة\n')
    process.exit(1)
  }
  
  // التحقق من وجود المنفذ
  if (!dbUrlValue.includes(':5432') && !dbUrlValue.includes(':6543')) {
    console.warn('\n⚠️  تحذير: DATABASE_URL لا يحتوي على منفذ واضح')
    console.warn('   يجب أن يحتوي على :5432 (اتصال مباشر) أو :6543 (Connection Pooling)')
  }
  
  // التحقق من Connection Pooling
  if (dbUrlValue.includes('pooler.supabase.com')) {
    const userMatch = dbUrlValue.match(/postgresql:\/\/([^:]+):/)
    if (userMatch) {
      const username = userMatch[1]
      if (!username.includes('.')) {
        console.error('\n❌ اسم المستخدم في Connection Pooling غير صحيح')
        console.error(`   الحالي: ${username}`)
        console.error('   يجب أن يكون: postgres.PROJECT-REF')
        console.error('   مثال: postgres.vatqqurkedwlyuqrfwrr')
        console.error('\n💡 الحل:')
        console.error('   1. اذهبي إلى Supabase Dashboard → Settings → Database')
        console.error('   2. اختر Connection pooling')
        console.error('   3. انسخي الرابط مباشرة (يبدأ بـ postgresql://postgres.PROJECT-REF)\n')
        process.exit(1)
      }
    }
  }
  
  // كل شيء يبدو صحيحاً
  console.log('\n✅ DATABASE_URL يبدو صحيحاً!')
  
  // عرض تفاصيل إضافية
  try {
    const url = new URL(dbUrlValue)
    console.log(`\n📊 تفاصيل الاتصال:`)
    console.log(`   البروتوكول: ${url.protocol}`)
    console.log(`   المضيف: ${url.hostname}`)
    console.log(`   المنفذ: ${url.port || 'افتراضي'}`)
    console.log(`   قاعدة البيانات: ${url.pathname}`)
    console.log(`   اسم المستخدم: ${url.username}`)
    console.log(`   كلمة المرور: ${url.password ? '***' + url.password.substring(url.password.length - 3) : 'غير موجودة'}`)
    
    // تحذير عن الأحرف الخاصة
    if (url.password) {
      const specialChars = ['@', '#', '$', '%', '&', '+', '=', '?', '/', ':']
      const hasSpecialChars = specialChars.some(char => 
        url.password.includes(char) && !url.password.includes('%')
      )
      if (hasSpecialChars) {
        console.warn('\n⚠️  تحذير: كلمة المرور تحتوي على أحرف خاصة')
        console.warn('   إذا واجهت مشاكل في الاتصال، استخدمي Connection Pooling من Supabase')
        console.warn('   أو قومي بترميز الأحرف الخاصة (راجعي FIX_DATABASE_URL.md)')
      }
    }
  } catch (error: any) {
    console.warn(`\n⚠️  تحذير: لا يمكن تحليل DATABASE_URL: ${error.message}`)
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('\n💡 إذا استمرت المشكلة:')
  console.log('   1. تأكدي من نسخ DATABASE_URL مباشرة من Supabase Dashboard')
  console.log('   2. لا تعدلي أي شيء في الرابط')
  console.log('   3. استخدمي Connection Pooling إذا كانت كلمة المرور تحتوي على أحرف خاصة')
  console.log('   4. راجعي ملف FIX_DATABASE_URL.md للتفاصيل\n')
}

fixDatabaseUrl()
