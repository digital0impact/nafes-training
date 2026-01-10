/**
 * Script لفحص ملف .env وإصلاح المشاكل
 * استخدمي: npx tsx scripts/debug-env.ts
 */

import * as fs from 'fs'
import * as path from 'path'

function debugEnv() {
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
  console.log('-'.repeat(60))
  
  let dbUrlLine: string | null = null
  let dbUrlLineNumber = 0
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('DATABASE_URL')) {
      dbUrlLine = trimmed
      dbUrlLineNumber = index + 1
      console.log(`\n⚠️  السطر ${index + 1} (DATABASE_URL):`)
      console.log(`   ${trimmed}`)
    } else if (trimmed && !trimmed.startsWith('#')) {
      // إخفاء القيم الحساسة
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=')
        const maskedValue = value.length > 20 
          ? value.substring(0, 10) + '...' + value.substring(value.length - 10)
          : '***'
        const lineNumber = String(index + 1).padStart(3, '0')
        console.log(`${lineNumber}: ${key.trim()}=${maskedValue}`)
      }
    }
  })
  
  console.log('-'.repeat(60))
  
  if (!dbUrlLine) {
    console.error('\n❌ DATABASE_URL غير موجود في ملف .env')
    console.error('💡 أضيفي DATABASE_URL إلى ملف .env')
    process.exit(1)
  }
  
  console.log('\n🔍 تحليل DATABASE_URL...\n')
  
  // استخراج DATABASE_URL
  const dbUrlMatch = dbUrlLine.match(/DATABASE_URL\s*=\s*(.+)/)
  if (!dbUrlMatch) {
    console.error('❌ لا يمكن قراءة DATABASE_URL')
    process.exit(1)
  }
  
  let dbUrl = dbUrlMatch[1].trim()
  
  // إزالة علامات الاقتباس
  if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || 
      (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
    dbUrl = dbUrl.slice(1, -1)
    console.log('✅ تم إزالة علامات الاقتباس')
  } else {
    console.warn('⚠️  DATABASE_URL غير محاط بعلامات اقتباس')
    console.warn('💡 يجب أن يكون: DATABASE_URL="..."')
  }
  
  console.log(`\n📋 DATABASE_URL بعد التنظيف:`)
  console.log(`   ${dbUrl.substring(0, 50)}...`)
  
  // التحقق من الصيغة
  if (!dbUrl.startsWith('postgresql://')) {
    console.error('\n❌ DATABASE_URL يجب أن يبدأ بـ postgresql://')
    console.error(`   الحالي: ${dbUrl.substring(0, 20)}...`)
    process.exit(1)
  }
  
  // استخراج الأجزاء
  try {
    const url = new URL(dbUrl)
    console.log('\n✅ تنسيق URL صحيح')
    console.log(`   البروتوكول: ${url.protocol}`)
    console.log(`   المضيف: ${url.hostname}`)
    console.log(`   المنفذ: ${url.port || 'غير محدد'}`)
    console.log(`   المسار: ${url.pathname}`)
    
    if (!url.port) {
      console.error('\n❌ رقم المنفذ غير موجود!')
      console.error('💡 يجب أن يكون المنفذ 5432 أو 6543')
      console.error('\n📝 مثال صحيح:')
      console.error('   DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"')
      process.exit(1)
    }
    
    const port = parseInt(url.port)
    if (isNaN(port)) {
      console.error(`\n❌ رقم المنفذ غير صحيح: ${url.port}`)
      process.exit(1)
    }
    
    if (port !== 5432 && port !== 6543) {
      console.warn(`\n⚠️  المنفذ ${port} غير معتاد`)
      console.warn('💡 عادة يكون 5432 (Direct) أو 6543 (Pooling)')
    } else {
      console.log(`✅ المنفذ ${port} صحيح`)
    }
    
    // التحقق من كلمة المرور
    const password = url.password
    if (!password) {
      console.error('\n❌ كلمة المرور غير موجودة')
      process.exit(1)
    }
    
    if (password.includes('YOUR') || password.includes('PASSWORD') || password.includes('[')) {
      console.error('\n❌ كلمة المرور لا تزال placeholder')
      console.error('💡 استبدلي كلمة المرور بالقيمة الصحيحة من Supabase')
      process.exit(1)
    }
    
    // التحقق من الأحرف الخاصة
    const specialChars = ['@', '#', '$', '%', '&', '+', '=', '?', '/', ':']
    const foundSpecialChars = specialChars.filter(char => password.includes(char) && !password.includes('%'))
    
    if (foundSpecialChars.length > 0) {
      console.warn('\n⚠️  كلمة المرور تحتوي على أحرف خاصة:')
      foundSpecialChars.forEach(char => {
        console.warn(`   - ${char}`)
      })
      console.warn('\n💡 يجب escape الأحرف الخاصة:')
      console.warn('   @ → %40, # → %23, $ → %24, % → %25')
      console.warn('   & → %26, + → %2B, = → %3D, ? → %3F')
      console.warn('   / → %2F, : → %3A')
      console.warn('\n💡 أو استخدمي Connection Pooling من Supabase (أسهل)')
    }
    
    // التحقق من PROJECT-REF
    if (url.hostname.includes('PROJECT') || url.hostname.includes('[')) {
      console.error('\n❌ PROJECT-REF لا يزال placeholder')
      console.error('💡 استبدلي PROJECT-REF برمز المشروع من Supabase')
      process.exit(1)
    }
    
    console.log('\n✅ DATABASE_URL يبدو صحيحاً من ناحية التنسيق')
    console.log('\n💡 إذا استمرت المشكلة، جربي:')
    console.log('   1. استخدمي Connection Pooling من Supabase')
    console.log('   2. تأكدي من أن كلمة المرور لا تحتوي على أحرف خاصة')
    console.log('   3. انسخي DATABASE_URL مباشرة من Supabase Dashboard')
    
  } catch (error: any) {
    console.error('\n❌ خطأ في تحليل DATABASE_URL:')
    console.error(`   ${error.message}`)
    console.error('\n💡 تأكدي من أن DATABASE_URL بالصيغة الصحيحة:')
    console.error('   postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres')
    process.exit(1)
  }
}

debugEnv()

