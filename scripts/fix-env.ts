/**
 * Script لإنشاء ملف .env من env.example
 * استخدمي: npx tsx scripts/fix-env.ts
 */

import * as fs from 'fs'
import * as path from 'path'

function createEnvFile() {
  const envExamplePath = path.join(process.cwd(), 'env.example')
  const envPath = path.join(process.cwd(), '.env')
  
  console.log('🔍 جاري إنشاء ملف .env...\n')
  
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ ملف env.example غير موجود!')
    process.exit(1)
  }
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  ملف .env موجود بالفعل')
    console.log('💡 هل تريدين استبداله؟ (y/n)')
    // في حالة عدم التفاعل، ننشئ نسخة احتياطية
    const backupPath = path.join(process.cwd(), '.env.backup')
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
    }
    fs.copyFileSync(envPath, backupPath)
    console.log(`✅ تم إنشاء نسخة احتياطية: .env.backup`)
  }
  
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8')
  
  // استبدال placeholders بتعليمات واضحة
  let envContent = envExampleContent
    .replace(/\[YOUR-PASSWORD\]/g, 'YOUR_PASSWORD_HERE')
    .replace(/\[PASSWORD\]/g, 'YOUR_PASSWORD_HERE')
    .replace(/\[PROJECT-REF\]/g, 'YOUR_PROJECT_REF_HERE')
  
  fs.writeFileSync(envPath, envContent, 'utf-8')
  
  console.log('✅ تم إنشاء ملف .env بنجاح!\n')
  console.log('📝 الخطوات التالية:')
  console.log('   1. افتحي ملف .env')
  console.log('   2. استبدلي YOUR_PASSWORD_HERE بكلمة مرور قاعدة البيانات')
  console.log('   3. استبدلي YOUR_PROJECT_REF_HERE برمز المشروع من Supabase')
  console.log('   4. أضيفي القيم الأخرى من Supabase Dashboard\n')
  console.log('💡 بعد التعديل، شغلي: npm run validate-env')
}

createEnvFile()

