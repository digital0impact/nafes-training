/**
 * Script للتحقق من صحة مفاتيح Supabase
 * استخدمي: npx tsx scripts/check-supabase-keys.ts
 */

import * as fs from 'fs'
import * as path from 'path'

function checkSupabaseKeys() {
  const envPath = path.join(process.cwd(), '.env')
  
  console.log('🔍 جاري التحقق من مفاتيح Supabase...\n')
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ ملف .env غير موجود!')
    console.error('💡 أنشئي ملف .env وانسخي محتوى env.example')
    process.exit(1)
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  let supabaseUrl = ''
  let supabaseKey = ''
  
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = trimmed.split('=')[1]?.trim().replace(/["']/g, '') || ''
      }
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=')) {
        supabaseKey = trimmed.split('=')[1]?.trim().replace(/["']/g, '') || ''
      }
    }
  })
  
  console.log('📋 القيم الموجودة:\n')
  
  // التحقق من URL
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL غير موجود')
  } else if (supabaseUrl === 'https://your-project-ref.supabase.co' || supabaseUrl.includes('your-project')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL يحتوي على قيمة افتراضية')
    console.error(`   القيمة الحالية: ${supabaseUrl.substring(0, 50)}...`)
  } else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL غير صحيح')
    console.error(`   القيمة الحالية: ${supabaseUrl}`)
    console.error('   يجب أن يكون في الصيغة: https://your-project-ref.supabase.co')
  } else {
    console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
  }
  
  // التحقق من المفتاح
  if (!supabaseKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY غير موجود')
  } else if (supabaseKey === 'your-publishable-key-here' || supabaseKey === 'your-key-here') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY يحتوي على قيمة افتراضية')
  } else if (supabaseKey.length < 50) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY قصير جداً')
    console.error(`   الطول الحالي: ${supabaseKey.length} حرف`)
    console.error('   يجب أن يكون مفتاح Supabase صحيح (عادة أكثر من 100 حرف)')
  } else {
    const maskedKey = supabaseKey.substring(0, 20) + '...' + supabaseKey.substring(supabaseKey.length - 10)
    console.log(`✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${maskedKey}`)
  }
  
  console.log('\n📖 للحصول على المفاتيح الصحيحة:')
  console.log('   1. اذهبي إلى Supabase Dashboard: https://app.supabase.com')
  console.log('   2. اختري مشروعك')
  console.log('   3. اذهبي إلى Settings > API')
  console.log('   4. انسخي Project URL وضيفيه في NEXT_PUBLIC_SUPABASE_URL')
  console.log('   5. انسخي anon/public key وضيفيه في NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
  
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl.includes('your-project') || 
      supabaseKey.includes('your-')) {
    console.error('\n❌ يرجى تحديث ملف .env بالقيم الصحيحة من Supabase Dashboard')
    process.exit(1)
  }
  
  console.log('\n✅ جميع المفاتيح موجودة وصحيحة!')
}

checkSupabaseKeys()
