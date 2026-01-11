# 🔑 إصلاح مشكلة مفتاح Supabase

## المشكلة
تظهر رسالة خطأ تقول أن `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` غير صحيح.

## الحل السريع

### الخطوة 1: الحصول على المفتاح من Supabase

1. **اذهبي إلى Supabase Dashboard:**
   - افتحي: https://app.supabase.com
   - سجلي الدخول

2. **اختيار المشروع:**
   - اختاري مشروعك من القائمة

3. **الحصول على API Key:**
   - اذهبي إلى: **Settings** (الإعدادات) > **API**
   - في قسم **Project API keys**
   - ابحثي عن المفتاح المسمى **`anon`** أو **`public`**
   - ⚠️ **لا تستخدمي** `service_role` - استخدمي `anon/public` فقط
   - انسخي المفتاح (يبدأ عادة بـ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### الخطوة 2: تحديث ملف `.env`

1. افتحي ملف `.env` في مجلد `nafes-training`

2. ابحثي عن السطر:
   ```
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-here
   ```

3. استبدلي `your-publishable-key-here` بالمفتاح الذي نسختيه من Supabase

4. يجب أن يبدو هكذا:
   ```
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### الخطوة 3: التحقق من الإعدادات

شغلي الأمر التالي للتحقق:
```bash
npm run check-keys
```

يجب أن ترين:
```
✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### الخطوة 4: إعادة تشغيل التطبيق

بعد تحديث ملف `.env`:
1. أوقفي التطبيق (اضغطي `Ctrl+C` في Terminal)
2. شغليه مرة أخرى:
   ```bash
   npm run dev
   ```

## ملاحظات مهمة

- ✅ استخدمي **`anon`** أو **`public`** key فقط
- ❌ لا تستخدمي **`service_role`** key
- ✅ المفتاح يجب أن يكون طويلاً (أكثر من 50 حرف)
- ✅ لا تضعي مسافات قبل أو بعد `=`
- ✅ لا تحتاجي علامات اقتباس حول المفتاح

## مثال لملف `.env` صحيح

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

## إذا استمرت المشكلة

1. تأكدي من أن ملف `.env` موجود في مجلد `nafes-training`
2. تأكدي من عدم وجود مسافات إضافية
3. تأكدي من نسخ المفتاح كاملاً (عادة أكثر من 100 حرف)
4. أعدي تشغيل التطبيق بعد التعديل
