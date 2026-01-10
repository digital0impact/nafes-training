/**
 * Script بسيط للتحقق من DATABASE_URL
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

// البحث عن DATABASE_URL
let dbUrlLine = ''
let dbUrlLineNum = 0

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim()
  if (line.startsWith('DATABASE_URL')) {
    dbUrlLine = line
    dbUrlLineNum = i + 1
    break
  }
}

if (!dbUrlLine) {
  console.error('❌ DATABASE_URL غير موجود في ملف .env')
  process.exit(1)
}

console.log(`✅ تم العثور على DATABASE_URL في السطر ${dbUrlLineNum}`)
console.log(`\n📋 السطر الكامل:`)
console.log(`   ${dbUrlLine}`)

// استخراج القيمة
const match = dbUrlLine.match(/DATABASE_URL\s*=\s*(.+)/)
if (!match) {
  console.error('❌ لا يمكن قراءة DATABASE_URL')
  process.exit(1)
}

let dbUrl = match[1].trim()

// إزالة علامات الاقتباس
if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
  dbUrl = dbUrl.slice(1, -1)
  console.log('\n✅ تم إزالة علامات الاقتباس')
} else if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
  dbUrl = dbUrl.slice(1, -1)
  console.log('\n✅ تم إزالة علامات الاقتباس')
} else {
  console.warn('\n⚠️  DATABASE_URL غير محاط بعلامات اقتباس')
}

console.log(`\n📋 DATABASE_URL بعد التنظيف:`)
console.log(`   ${dbUrl.substring(0, 80)}...`)

// التحقق من المنفذ
const portMatch = dbUrl.match(/:(\d+)\//)
if (!portMatch) {
  console.error('\n❌ رقم المنفذ غير موجود!')
  console.error('💡 يجب أن يكون المنفذ 5432 أو 6543')
  console.error('\n📝 مثال صحيح:')
  console.error('   DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"')
  process.exit(1)
}

const port = parseInt(portMatch[1])
console.log(`\n✅ رقم المنفذ موجود: ${port}`)

if (port !== 5432 && port !== 6543) {
  console.warn(`⚠️  المنفذ ${port} غير معتاد (عادة 5432 أو 6543)`)
} else {
  console.log(`✅ المنفذ ${port} صحيح`)
}

// التحقق من الصيغة
if (!dbUrl.startsWith('postgresql://')) {
  console.error('\n❌ DATABASE_URL يجب أن يبدأ بـ postgresql://')
  process.exit(1)
}

console.log('\n✅ DATABASE_URL يبدو صحيحاً من ناحية التنسيق')
console.log('\n💡 إذا استمرت المشكلة:')
console.log('   1. تأكدي من أن كلمة المرور لا تحتوي على أحرف خاصة')
console.log('   2. استخدمي Connection Pooling من Supabase')
console.log('   3. انسخي DATABASE_URL مباشرة من Supabase Dashboard')

