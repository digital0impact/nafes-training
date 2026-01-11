# 🔧 حل مشكلة Prisma Build في Windows

## المشكلة
```
Error: EPERM: operation not permitted, unlink '...\query_engine-windows.dll.node'
```

هذا الخطأ يحدث لأن ملف Prisma Client قيد الاستخدام من قبل عملية أخرى.

## الحل السريع

### الطريقة 1: استخدام الـ Script (الأسهل)

```powershell
cd nafes-training
.\fix-prisma-build.ps1
```

### الطريقة 2: يدوياً (خطوة بخطوة)

#### الخطوة 1: إيقاف جميع عمليات Node.js

```powershell
# إيقاف عمليات Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# إيقاف عمليات Next.js
Get-Process -Name "next" -ErrorAction SilentlyContinue | Stop-Process -Force
```

#### الخطوة 2: إغلاق VS Code أو أي محرر آخر

- أغلي VS Code تماماً
- أغلي أي Terminal أو PowerShell windows
- تأكدي من عدم وجود أي عملية تستخدم الملفات

#### الخطوة 3: حذف Prisma Client

```powershell
cd nafes-training

# حذف مجلد Prisma Client
Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
```

#### الخطوة 4: إعادة توليد Prisma Client

```powershell
npx prisma generate
```

#### الخطوة 5: البناء

```powershell
npm run build
```

## حلول إضافية

### إذا استمرت المشكلة:

1. **أعدي تشغيل الكمبيوتر** (حل جذري لكنه فعال)

2. **استخدمي Command Prompt بدلاً من PowerShell**:
   ```cmd
   cd nafes-training
   rmdir /s /q node_modules\.prisma
   npx prisma generate
   npm run build
   ```

3. **احذفي node_modules بالكامل وأعيدي التثبيت**:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   npx prisma generate
   npm run build
   ```

4. **استخدمي WSL (Windows Subsystem for Linux)** إذا كان متاحاً:
   ```bash
   cd nafes-training
   rm -rf node_modules/.prisma
   npx prisma generate
   npm run build
   ```

## نصائح لمنع المشكلة

1. **أغلقي VS Code قبل البناء** إذا كنت تواجهين المشكلة بشكل متكرر
2. **استخدمي `npm run build` مباشرة** بدلاً من حذف الملفات يدوياً
3. **تأكدي من إغلاق جميع Terminals** قبل البناء

## للاستخدام في Vercel

هذه المشكلة تحدث فقط في Windows محلياً. في Vercel (Linux)، لن تواجهي هذه المشكلة.
