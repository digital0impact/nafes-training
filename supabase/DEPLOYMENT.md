# 🚀 نشر Supabase Migrations

## الطريقة 1: Supabase Dashboard (أسهل)

### خطوات التطبيق:

1. **افتحي Supabase Dashboard**
   - اذهبي إلى: https://app.supabase.com
   - اختاري مشروعك

2. **افتحي SQL Editor**
   - من القائمة الجانبية: SQL Editor

3. **طبقي Migrations بالترتيب:**

   **أ) Migration 1: الجداول**
   - انسخي محتوى `001_initial_schema.sql`
   - الصقي في SQL Editor
   - اضغطي "Run"

   **ب) Migration 2: RLS Policies**
   - انسخي محتوى `002_rls_policies.sql`
   - الصقي في SQL Editor
   - اضغطي "Run"

   **ج) Migration 3: RPC Functions**
   - انسخي محتوى `003_rpc_functions.sql`
   - الصقي في SQL Editor
   - اضغطي "Run"

4. **تحققي من النجاح:**
   - اذهبي إلى Table Editor
   - يجب أن ترى الجداول: classes, students, enrollments, questions, attempts, skills

## الطريقة 2: Supabase CLI

### التثبيت:

```bash
# تثبيت Supabase CLI
npm install -g supabase

# أو باستخدام Homebrew (Mac)
brew install supabase/tap/supabase
```

### الإعداد:

```bash
# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref your-project-ref

# التحقق من الاتصال
supabase projects list
```

### تطبيق Migrations:

```bash
# تطبيق جميع migrations
supabase db push

# أو تطبيق migration محدد
supabase migration up
```

## الطريقة 3: Edge Functions (اختياري)

إذا أردت استخدام Edge Function بدلاً من RPC:

```bash
# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref your-project-ref

# نشر Edge Function
supabase functions deploy student-operations
```

### إعداد Environment Variables:

في Supabase Dashboard > Edge Functions > Settings:
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key

## ✅ التحقق من التطبيق

### 1. التحقق من الجداول:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

يجب أن ترى:
- attempts
- classes
- enrollments
- questions
- skills
- students

### 2. التحقق من RLS:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

جميع الجداول يجب أن يكون `rowsecurity = true`

### 3. التحقق من Functions:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

يجب أن ترى:
- create_or_get_student
- create_training_attempt
- enroll_student_in_class
- get_student_attempts
- validate_class_code

### 4. اختبار RPC Function:

```sql
-- اختبار إنشاء طالب
SELECT * FROM create_or_get_student('سارة');

-- اختبار التحقق من كود الفصل
SELECT * FROM validate_class_code('SCI3A');
```

## 🔒 الأمان

### Service Role Key

⚠️ **مهم جداً:**
- لا تشاركي Service Role Key مع أحد
- لا تستخدميه في Client Side
- استخدميه فقط في Server Side أو Edge Functions

### RLS Policies

جميع الجداول محمية بـ RLS:
- ✅ المعلمون يروا فصولهم فقط
- ✅ الطلاب لا يمكنهم الوصول المباشر
- ✅ RPC Functions آمنة مع SECURITY DEFINER

## 🐛 حل المشاكل

### خطأ: Permission denied

**الحل:**
- تأكدي من استخدام Service Role Key في Edge Functions
- تأكدي من تطبيق RLS Policies بشكل صحيح

### خطأ: Function does not exist

**الحل:**
- تأكدي من تطبيق `003_rpc_functions.sql`
- تحققي من أن Function موجودة في Database

### خطأ: RLS policy violation

**الحل:**
- تأكدي من تطبيق `002_rls_policies.sql`
- استخدمي RPC Functions بدلاً من الوصول المباشر

## 📚 المراجع

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
