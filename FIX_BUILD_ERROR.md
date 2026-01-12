# 🔧 إصلاح خطأ البناء: "npm run build" exited with 1

## الخطوة 1: التحقق من البناء محلياً

قبل أي شيء، تأكدي من أن البناء يعمل محلياً:

```powershell
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"

# تنظيف البناء السابق
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# البناء
npm run build
```

**إذا نجح البناء محلياً:** المشكلة في Vercel (متغيرات البيئة أو إعدادات)  
**إذا فشل البناء محلياً:** يجب إصلاح الأخطاء أولاً

---

## الخطوة 2: التحقق من الملفات في Git

تأكدي من أن جميع الملفات المطلوبة موجودة في Git:

```powershell
# التحقق من الملفات المهمة
git ls-files src/components/student/student-auth-guard.tsx
git ls-files src/components/student/index.ts
git ls-files src/app/student/page.tsx
```

إذا كانت الملفات غير موجودة:

```powershell
git add src/components/student/student-auth-guard.tsx
git add src/components/student/index.ts
git add src/app/student/page.tsx
git commit -m "Add student auth guard components"
git push
```

---

## الخطوة 3: التحقق من متغيرات البيئة في Vercel

اذهبي إلى **Vercel Dashboard** → **Project Settings** → **Environment Variables**

تأكدي من وجود:

1. **NEXT_PUBLIC_SUPABASE_URL**
2. **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY**
3. **DATABASE_URL**
4. **NEXTAUTH_SECRET**
5. **NEXTAUTH_URL** (للـ Production فقط)
6. **SKIP_ENV_VALIDATION** = `true`

**⚠️ مهم:** بعد إضافة المتغيرات، اضغطي **"Redeploy"**

---

## الخطوة 4: التحقق من Build Logs في Vercel

1. اذهبي إلى **Vercel Dashboard** → **Deployments**
2. اضغطي على آخر deployment (الفاشل)
3. اضغطي على **"View Build Logs"**
4. ابحثي عن الخطأ المحدد (عادة يظهر باللون الأحمر)

### الأخطاء الشائعة:

#### أ) "Module not found"
- تأكدي من أن الملف موجود في Git
- تحققي من أن الاستيراد صحيح

#### ب) "Prisma Client not generated"
- تأكدي من أن `DATABASE_URL` موجود في Vercel
- تحققي من أن `prisma generate` يعمل

#### ج) "Environment variable not found"
- أضيفي المتغيرات المفقودة في Vercel
- اضغطي **"Redeploy"** بعد الإضافة

#### د) "Type error" أو "TypeScript error"
- أصلحي الأخطاء في الكود
- تأكدي من أن `tsconfig.json` صحيح

---

## الخطوة 5: إصلاح مشكلة Prisma (إذا كانت موجودة)

إذا كان الخطأ متعلق بـ Prisma:

### في Vercel:

1. أضيفي `DATABASE_URL` في Environment Variables
2. تأكدي من أن القيمة صحيحة (يبدأ بـ `postgresql://`)

### في vercel.json:

يمكن إضافة إعدادات Prisma:

```json
{
  "buildCommand": "prisma generate && npm run build",
  "installCommand": "npm install"
}
```

لكن هذا موجود بالفعل في `package.json` ✅

---

## الخطوة 6: التحقق من vercel.json

تأكدي من أن `vercel.json` صحيح:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "SKIP_ENV_VALIDATION": "true"
  }
}
```

---

## الخطوة 7: حلول إضافية

### أ) تنظيف وإعادة البناء

```powershell
# تنظيف
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# إعادة التثبيت
npm install

# البناء
npm run build
```

### ب) التحقق من package.json

تأكدي من أن `build` script صحيح:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### ج) التحقق من tsconfig.json

تأكدي من أن `paths` صحيح:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## الخطوة 8: إعادة النشر

بعد إصلاح المشاكل:

1. ادفعي التغييرات إلى GitHub:
   ```powershell
   git add .
   git commit -m "Fix build errors"
   git push
   ```

2. أو أعدي النشر يدوياً في Vercel:
   - اذهبي إلى **Deployments**
   - اضغطي على **"Redeploy"**

---

## إذا استمرت المشكلة

1. انسخي رسالة الخطأ الكاملة من Build Logs
2. تحققي من:
   - هل البناء يعمل محلياً؟
   - هل جميع الملفات موجودة في Git؟
   - هل متغيرات البيئة صحيحة؟
3. ابحثي عن الخطأ في Google أو Stack Overflow

---

## نصائح مهمة

1. **دائماً تحققي من Build Logs** - تحتوي على معلومات مفصلة
2. **تأكدي من أن البناء يعمل محلياً** قبل النشر
3. **تأكدي من أن جميع الملفات موجودة في Git**
4. **تأكدي من أن متغيرات البيئة صحيحة ومضافة**
