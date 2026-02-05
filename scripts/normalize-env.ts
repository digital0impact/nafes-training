/**
 * إزالة BOM وأي أحرف مخفية من ملف .env حتى يتعرف Prisma على DATABASE_URL
 * تشغيل: npx tsx scripts/normalize-env.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('ملف .env غير موجود.');
  process.exit(1);
}

let content = fs.readFileSync(envPath, 'utf-8');

// إزالة BOM إن وُجد
if (content.charCodeAt(0) === 0xfeff) {
  content = content.slice(1);
  console.log('تم إزالة BOM من بداية الملف.');
}

// تطبيع سطر DATABASE_URL: إزالة أي مسافات/أحرف غير مرئية
const lines = content.split(/\r?\n/);
let changed = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trimStart().startsWith('DATABASE_URL=')) {
    const eq = line.indexOf('=');
    const raw = line.slice(eq + 1).trim().replace(/^["']|["']\s*$/g, '');
    const value = raw.replace(/^\uFEFF/, '').trim();
    if (value) {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        console.error('قيمة DATABASE_URL لا تبدأ بـ postgresql:// أو postgres://');
        process.exit(1);
      }
      const newLine = 'DATABASE_URL="' + value + '"';
      if (lines[i] !== newLine) {
        lines[i] = newLine;
        changed = true;
      }
    }
    break;
  }
}

const newContent = lines.join('\n');
fs.writeFileSync(envPath, newContent, { encoding: 'utf8' });

console.log('تم تطبيع ملف .env.');
if (changed) console.log('تم تصحيح سطر DATABASE_URL.');
