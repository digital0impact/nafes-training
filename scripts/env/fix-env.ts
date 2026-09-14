/**
 * ينشئ ملف .env من env.example إن لم يكن موجوداً، ثم يطبّع الملف
 * (إزالة BOM وتنسيق سطر DATABASE_URL) حتى يتعرف عليه Prisma بشكل صحيح.
 *
 * يجمع هذا السكريبت وظائف السكريبتات القديمة: fix-env / normalize-env / fix-database-url
 *
 * الاستخدام: npm run fix-env
 */

import * as fs from 'fs'
import { ENV_EXAMPLE_PATH, ENV_PATH, hasPlaceholder } from './lib'

/** ينشئ .env من env.example عند غيابه. يرجع true إذا أنشأه الآن (ملف جديد بالكامل). */
function createEnvFileIfMissing(): boolean {
  if (fs.existsSync(ENV_PATH)) return false

  console.log('🔍 ملف .env غير موجود، جاري إنشاؤه من env.example...\n')

  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.error('❌ ملف env.example غير موجود أيضاً، تعذّر إنشاء .env تلقائياً')
    process.exit(1)
  }

  const exampleContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf-8')
  const content = exampleContent
    .replace(/\[YOUR-PASSWORD\]/g, 'YOUR_PASSWORD_HERE')
    .replace(/\[PASSWORD\]/g, 'YOUR_PASSWORD_HERE')
    .replace(/\[PROJECT-REF\]/g, 'YOUR_PROJECT_REF_HERE')

  fs.writeFileSync(ENV_PATH, content, 'utf-8')
  console.log('✅ تم إنشاء ملف .env بنجاح!\n')
  console.log('📝 الخطوات التالية:')
  console.log('   1. افتحي ملف .env')
  console.log('   2. استبدلي YOUR_PASSWORD_HERE بكلمة مرور قاعدة البيانات')
  console.log('   3. استبدلي YOUR_PROJECT_REF_HERE برمز المشروع من Supabase')
  console.log('   4. أضيفي القيم الأخرى من Supabase Dashboard')
  console.log('\n💡 بعد التعديل، شغلي: npm run check-env\n')
  return true
}

function normalizeEnvFile() {
  let content = fs.readFileSync(ENV_PATH, 'utf-8')
  let changed = false

  // إزالة BOM إن وُجد
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1)
    changed = true
    console.log('✅ تمت إزالة BOM من بداية الملف')
  }

  // تطبيع سطر DATABASE_URL: إحاطته بعلامات اقتباس والتأكد من صحته
  const lines = content.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trimStart().startsWith('DATABASE_URL=')) continue

    const eq = line.indexOf('=')
    const raw = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']\s*$/g, '')
    const value = raw.replace(/^﻿/, '').trim()

    if (value) {
      if (hasPlaceholder(value)) {
        console.warn('⚠️  DATABASE_URL لا يزال يحتوي على قيمة placeholder لم يتم استبدالها بعد')
        console.warn('💡 استبدلي القيمة الحقيقية ثم شغلي npm run fix-env مرة أخرى للتطبيع الكامل')
        break
      }

      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        console.error('❌ تعذّر تطبيع DATABASE_URL: يجب أن يبدأ بـ postgresql:// أو postgres://')
        process.exit(1)
      }

      const newLine = `DATABASE_URL="${value}"`
      if (lines[i] !== newLine) {
        lines[i] = newLine
        changed = true
      }
    }
    break
  }

  if (changed) {
    fs.writeFileSync(ENV_PATH, lines.join('\n'), { encoding: 'utf8' })
    console.log('✅ تم تطبيع ملف .env (BOM + تنسيق DATABASE_URL)')
  } else {
    console.log('✅ ملف .env منسّق بالفعل، لا حاجة لأي تعديل')
  }
}

function main() {
  createEnvFileIfMissing()
  normalizeEnvFile()
  console.log('\n💡 للتحقق الكامل من القيم، شغلي: npm run check-env')
}

main()
