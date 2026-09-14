/**
 * أدوات مشتركة للتعامل مع ملف .env
 * تُستخدم من scripts/env/check-env.ts و scripts/env/fix-env.ts
 */

import * as fs from 'fs'
import * as path from 'path'

export const ENV_PATH = path.join(process.cwd(), '.env')
export const ENV_EXAMPLE_PATH = path.join(process.cwd(), 'env.example')

export interface Issue {
  level: 'error' | 'warning'
  message: string
}

/** يقرأ ملف .env ويوقف التنفيذ برسالة واضحة إن لم يكن موجوداً */
export function readEnvFileOrExit(): string {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('❌ ملف .env غير موجود!')
    console.error('💡 شغلي: npm run fix-env')
    process.exit(1)
  }
  // إزالة BOM إن وُجد حتى لا يؤثر على التحليل
  return fs.readFileSync(ENV_PATH, 'utf-8').replace(/^﻿/, '')
}

/** يحوّل محتوى .env إلى خريطة متغير → قيمة (بدون علامات اقتباس) */
export function parseEnvVars(content: string): Record<string, string> {
  const vars: Record<string, string> = {}
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eq = trimmed.indexOf('=')
    if (eq === -1) return
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  })
  return vars
}

/** يخفي جزءاً من القيم الحساسة عند العرض */
export function maskValue(value: string, keepStart = 10, keepEnd = 10): string {
  if (!value) return ''
  if (value.length <= keepStart + keepEnd) return '***'
  return `${value.slice(0, keepStart)}...${value.slice(-keepEnd)}`
}

const PLACEHOLDER_MARKERS = [
  '[PASSWORD]',
  '[YOUR-PASSWORD]',
  '[PROJECT-REF]',
  'YOUR_PASSWORD_HERE',
  'YOUR_PROJECT_REF_HERE',
  'your-project',
  'your-key-here',
  'your-publishable-key-here',
]

export function hasPlaceholder(value: string): boolean {
  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker))
}

/** يحلل DATABASE_URL ويرجع أخطاء/تحذيرات (صيغة، منفذ، كلمة مرور، Connection Pooling) */
export function analyzeDatabaseUrl(value: string): Issue[] {
  const issues: Issue[] = []

  if (!value) {
    issues.push({ level: 'error', message: 'DATABASE_URL غير موجود' })
    return issues
  }

  if (hasPlaceholder(value)) {
    issues.push({
      level: 'error',
      message: 'DATABASE_URL يحتوي على قيمة placeholder لم يتم استبدالها بعد',
    })
    return issues
  }

  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    issues.push({ level: 'error', message: 'DATABASE_URL يجب أن يبدأ بـ postgresql://' })
    return issues
  }

  try {
    const url = new URL(value)

    if (!url.port) {
      issues.push({ level: 'error', message: 'رقم المنفذ غير موجود (يجب أن يكون 5432 أو 6543)' })
    } else {
      const port = parseInt(url.port, 10)
      if (port !== 5432 && port !== 6543) {
        issues.push({ level: 'warning', message: `المنفذ ${port} غير معتاد (عادة 5432 أو 6543)` })
      }
    }

    if (!url.password) {
      issues.push({ level: 'error', message: 'كلمة المرور غير موجودة في DATABASE_URL' })
    } else {
      const specialChars = ['@', '#', '$', '%', '&', '+', '=', '?', '/', ':']
      const hasSpecialChars =
        specialChars.some((c) => url.password.includes(c)) && !url.password.includes('%')
      if (hasSpecialChars) {
        issues.push({
          level: 'warning',
          message:
            'كلمة المرور تحتوي على أحرف خاصة قد تحتاج إلى URL-encoding (@→%40، #→%23، $→%24، %→%25، &→%26، +→%2B، =→%3D، ?→%3F، /→%2F، :→%3A)، أو استخدمي Connection Pooling من Supabase',
        })
      }
    }

    if (url.hostname.includes('pooler.supabase.com') && !url.username.includes('.')) {
      issues.push({
        level: 'error',
        message: `اسم المستخدم في Connection Pooling يجب أن يكون بصيغة postgres.PROJECT-REF (الحالي: ${url.username})`,
      })
    }
  } catch (error: any) {
    issues.push({ level: 'error', message: `تعذّر تحليل DATABASE_URL: ${error.message}` })
  }

  return issues
}

export function analyzeSupabaseUrl(value: string): Issue[] {
  if (!value) return [{ level: 'error', message: 'NEXT_PUBLIC_SUPABASE_URL غير موجود' }]
  if (hasPlaceholder(value)) {
    return [{ level: 'error', message: 'NEXT_PUBLIC_SUPABASE_URL يحتوي على قيمة افتراضية' }]
  }
  if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
    return [
      {
        level: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_URL غير صحيح، يجب أن يكون بالصيغة https://PROJECT-REF.supabase.co',
      },
    ]
  }
  return []
}

export function analyzeSupabaseKey(value: string): Issue[] {
  if (!value) {
    return [{ level: 'error', message: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY غير موجود' }]
  }
  if (hasPlaceholder(value)) {
    return [
      { level: 'error', message: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY يحتوي على قيمة افتراضية' },
    ]
  }
  if (value.length < 50) {
    return [
      {
        level: 'error',
        message: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY قصير جداً (${value.length} حرف، يجب أن يكون أكثر من 100 عادة)`,
      },
    ]
  }
  return []
}
