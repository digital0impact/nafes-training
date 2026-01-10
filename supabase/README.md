# Supabase Database Setup

## 📋 الملفات

### Migrations
- `001_initial_schema.sql` - إنشاء الجداول الأساسية
- `002_rls_policies.sql` - سياسات Row Level Security
- `003_rpc_functions.sql` - RPC Functions للطلاب

### Edge Functions
- `functions/student-operations/index.ts` - Edge Function للعمليات الآمنة

## 🚀 التطبيق

### الطريقة 1: استخدام Supabase Dashboard (موصى به)

1. اذهبي إلى Supabase Dashboard > SQL Editor
2. انسخي محتوى كل ملف migration بالترتيب
3. شغلي كل migration على حدة

**الترتيب:**
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_rpc_functions.sql`

### الطريقة 2: استخدام Supabase CLI

```bash
# تثبيت Supabase CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref your-project-ref

# تطبيق migrations
supabase db push
```

## 🔒 الأمان

### RLS Policies

- ✅ المعلمون يروا ويعدلوا فصولهم فقط
- ✅ المعلمون يروا محاولات طلاب فصولهم فقط
- ✅ الطلاب لا يمكنهم قراءة بيانات المعلمين
- ✅ الطلاب يستخدمون RPC Functions فقط

### RPC Functions

جميع RPC Functions تستخدم `SECURITY DEFINER` مما يعني:
- تعمل بصلاحيات service role
- آمنة للاستخدام من client بدون auth
- محمية من SQL injection

## 📝 استخدام RPC Functions

### من Client (TypeScript)

```typescript
import { 
  createOrGetStudent,
  enrollStudentInClass,
  createTrainingAttempt 
} from '@/lib/supabase/rpc'

// إنشاء طالب
const student = await createOrGetStudent('سارة')

// التسجيل في فصل
const enrollment = await enrollStudentInClass(student.id, 'SCI3A')

// حفظ محاولة
const attempt = await createTrainingAttempt({
  studentId: student.id,
  classCode: 'SCI3A',
  score: 8,
  total: 10,
  answers: { 'q1': 'a', 'q2': 'b' },
  timeSpent: 1200
})
```

### من Edge Function

```typescript
const { data, error } = await supabase.rpc('create_or_get_student', {
  p_nickname: 'سارة'
})
```

## 🎯 الخيارات المتاحة

### الخيار 1: RPC Functions (موصى به) ✅

**المزايا:**
- سريع وسهل
- لا يحتاج deployment
- آمن مع SECURITY DEFINER
- يمكن استدعاؤه مباشرة من client

**العيوب:**
- محدود بالـ SQL
- صعب في العمليات المعقدة

### الخيار 2: Edge Functions

**المزايا:**
- مرونة كاملة
- يمكن استخدام TypeScript
- يمكن إضافة منطق معقد

**العيوب:**
- يحتاج deployment
- أبطأ قليلاً

## 📊 الجداول

### classes
- `id` (UUID)
- `teacher_id` (UUID → auth.users)
- `name` (TEXT)
- `class_code` (TEXT, UNIQUE)
- `grade` (TEXT)
- `created_at`, `updated_at`

### students
- `id` (UUID)
- `nickname` (TEXT)
- `created_at`, `updated_at`

### enrollments
- `id` (UUID)
- `student_id` (UUID → students)
- `class_id` (UUID → classes)
- `enrolled_at`
- UNIQUE(student_id, class_id)

### questions
- `id` (UUID)
- `skill_id` (UUID → skills)
- `prompt` (TEXT)
- `options` (JSONB)
- `correct_index` (INTEGER)
- `explanation` (TEXT)
- `difficulty` (TEXT: 'easy'|'medium'|'hard')

### attempts
- `id` (UUID)
- `student_id` (UUID → students)
- `class_id` (UUID → classes)
- `score` (INTEGER)
- `total` (INTEGER)
- `percentage` (NUMERIC, GENERATED)
- `answers` (JSONB)
- `time_spent` (INTEGER)
- `created_at`

## 🔍 التحقق

بعد تطبيق migrations، تحققي من:

```sql
-- التحقق من الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- التحقق من RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- التحقق من Functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```
