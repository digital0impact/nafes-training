/**
 * Script للتحقق من صحة ملف .env
 * استخدمي: npx tsx scripts/validate-env.ts
 */

import * as fs from 'fs'
import * as path from 'path'

function validateEnv() {
  const envPath = path.join(process.cwd(), '.env')
  
  console.log('🔍 جاري التحقق من ملف .env...\n')
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ ملف .env غير موجود!')
    console.error('💡 أنشئي ملف .env وانسخي محتوى env.example')
    process.exit(1)
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  ]
  
  const foundVars: string[] = []
  const missingVars: string[] = []
  
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key] = trimmed.split('=')
      if (key) {
        foundVars.push(key.trim())
      }
    }
  })
  
  requiredVars.forEach((varName) => {
    if (!foundVars.includes(varName)) {
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length > 0) {
    console.error('❌ المتغيرات المفقودة:')
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`)
    })
    console.error('\n💡 أضيفي هذه المتغيرات إلى ملف .env')
    process.exit(1)
  }
  
  // التحقق من DATABASE_URL
  // محاولة البحث بعدة صيغ
  let dbUrlMatch = envContent.match(/DATABASE_URL=["'](.+?)["']/)
  
  // إذا لم يوجد بعلامات اقتباس، جربي بدون
  if (!dbUrlMatch) {
    dbUrlMatch = envContent.match(/DATABASE_URL=(.+?)(\n|$)/)
  }
  
  // إذا لم يوجد، جربي مع مسافات
  if (!dbUrlMatch) {
    const lines = envContent.split('\n')
    const dbLine = lines.find(line => line.trim().startsWith('DATABASE_URL'))
    if (dbLine) {
      const match = dbLine.match(/DATABASE_URL\s*=\s*(.+)/)
      if (match) {
        dbUrlMatch = ['', match[1].trim().replace(/^["']|["']$/g, '')]
      }
    }
  }
  
  if (dbUrlMatch && dbUrlMatch[1]) {
    const dbUrl = dbUrlMatch[1]
    
    console.log('✅ جميع المتغيرات المطلوبة موجودة\n')
    console.log('🔍 التحقق من DATABASE_URL...')
    
    // التحقق من الصيغة
    if (!dbUrl.startsWith('postgresql://')) {
      console.error('❌ DATABASE_URL يجب أن يبدأ بـ postgresql://')
      process.exit(1)
    }
    
    // التحقق من وجود المنفذ
    const portMatch = dbUrl.match(/:(\d+)\//)
    if (!portMatch) {
      console.error('❌ DATABASE_URL لا يحتوي على رقم منفذ صحيح')
      console.error('💡 تأكدي من وجود :5432 أو :6543 في الرابط')
      process.exit(1)
    }
    
    const port = parseInt(portMatch[1])
    if (port !== 5432 && port !== 6543) {
      console.warn(`⚠️  المنفذ ${port} غير معتاد (عادة 5432 أو 6543)`)
    }
    
    // التحقق من وجود placeholder
    if (dbUrl.includes('[YOUR-PASSWORD]') || dbUrl.includes('[PASSWORD]')) {
      console.error('❌ DATABASE_URL يحتوي على placeholder')
      console.error('💡 استبدلي [YOUR-PASSWORD] أو [PASSWORD] بكلمة المرور الصحيحة')
      process.exit(1)
    }
    
    if (dbUrl.includes('[PROJECT-REF]')) {
      console.error('❌ DATABASE_URL يحتوي على placeholder')
      console.error('💡 استبدلي [PROJECT-REF] برمز المشروع من Supabase')
      process.exit(1)
    }
    
    console.log('✅ DATABASE_URL يبدو صحيحاً')
    console.log(`   المنفذ: ${port}`)
    
    // التحقق من الأحرف الخاصة في كلمة المرور
    const passwordMatch = dbUrl.match(/postgresql:\/\/[^:]+:(.+?)@/)
    if (passwordMatch) {
      const password = passwordMatch[1]
      const specialChars = ['@', '#', '$', '%', '&', '+', '=', '?', '/', ':']
      const hasSpecialChars = specialChars.some(char => password.includes(char))
      
      if (hasSpecialChars && !password.includes('%')) {
        console.warn('\n⚠️  كلمة المرور تحتوي على أحرف خاصة')
        console.warn('💡 يجب أن يتم escape الأحرف الخاصة:')
        console.warn('   @ → %40, # → %23, $ → %24, % → %25')
        console.warn('   & → %26, + → %2B, = → %3D, ? → %3F')
        console.warn('   / → %2F, : → %3A')
        console.warn('\n💡 أو استخدمي Connection Pooling من Supabase')
      }
    }
  } else {
    console.error('❌ DATABASE_URL غير موجود أو غير صحيح')
    console.error('\n💡 الحل:')
    console.error('   1. شغلي: npm run fix-env')
    console.error('   2. أو أنشئي ملف .env يدوياً من env.example')
    console.error('   3. تأكدي من أن DATABASE_URL موجود وصحيح')
    process.exit(1)
  }
  
  console.log('\n✅ ملف .env يبدو صحيحاً!')
  console.log('💡 جربي الآن: npm run check-db')
}

validateEnv()

