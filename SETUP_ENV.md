# 🔧 إعداد ملف .env

## المشكلة:

```
❌ DATABASE_URL غير موجود أو غير محاط بعلامات اقتباس
```

## الحل:

### الطريقة الأولى: إنشاء ملف .env تلقائياً

```bash
npm run fix-env
```

هذا سينشئ ملف `.env` من `env.example`.

### الطريقة الثانية: إنشاء ملف .env يدوياً

1. انسخي `env.example` إلى `.env`:

```bash
copy env.example .env
```

أو في PowerShell:
```powershell
Copy-Item env.example .env
```

2. افتحي ملف `.env` وعدلي القيم:

```env
# استبدلي هذه القيم:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@db.YOUR_PROJECT_REF_HERE.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF_HERE.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-here
```

### الحصول على القيم من Supabase:

#### 1. DATABASE_URL:

من Supabase Dashboard:
- Settings > Database
- Connection string > URI
- انسخي الرابط وضعيه في `.env`

**أو استخدمي Connection Pooling (أسهل):**
- Settings > Database
- Connection pooling > URI
- انسخي الرابط

#### 2. NEXT_PUBLIC_SUPABASE_URL:

من Supabase Dashboard:
- Settings > API
- Project URL
- انسخي الرابط

#### 3. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:

من Supabase Dashboard:
- Settings > API
- Project API keys > anon/public key
- انسخي المفتاح

### مثال لملف .env صحيح:

```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### بعد إعداد الملف:

1. تحققي من صحة الملف:
   ```bash
   npm run validate-env
   ```

2. اختبري الاتصال:
   ```bash
   npm run check-db
   ```

### ⚠️ ملاحظات مهمة:

1. **علامات الاقتباس**: تأكدي من أن `DATABASE_URL` محاط بعلامات اقتباس `"`
2. **كلمة المرور**: إذا كانت تحتوي على أحرف خاصة، يجب escape:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - إلخ...
3. **Connection Pooling**: استخدميه إذا كانت كلمة المرور تحتوي على أحرف خاصة (أسهل)

### 🆘 إذا استمرت المشكلة:

1. تحققي من أن ملف `.env` موجود في مجلد `nafes-training`
2. تحققي من أن `DATABASE_URL` في سطر واحد
3. تحققي من أن علامات الاقتباس صحيحة
4. جربي استخدام Connection Pooling بدلاً من Direct Connection

