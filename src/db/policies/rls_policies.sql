-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- هذه السياسات تحدد من يمكنه الوصول إلى البيانات

-- تفعيل RLS على الجداول
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_models ENABLE ROW LEVEL SECURITY;

-- ============================================
-- سياسات جدول الطالبات (students)
-- ============================================

-- المعلمون يمكنهم رؤية جميع الطالبات
CREATE POLICY "Teachers can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- المعلمون يمكنهم إضافة طالبات
CREATE POLICY "Teachers can insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- المعلمون يمكنهم تحديث الطالبات
CREATE POLICY "Teachers can update students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- الطالبات يمكنهن رؤية بياناتهن فقط
CREATE POLICY "Students can view own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    student_id = current_setting('app.student_id', true)
  );

-- ============================================
-- سياسات جدول الأنشطة (activities)
-- ============================================

-- المعلمون يمكنهم رؤية أنشطتهم فقط
CREATE POLICY "Teachers can view own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = activities.user_id
    )
  );

-- المعلمون يمكنهم إنشاء أنشطة
CREATE POLICY "Teachers can create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- الطالبات يمكنهن رؤية جميع الأنشطة (للقراءة فقط)
CREATE POLICY "Students can view all activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- سياسات جدول الاختبارات (test_models)
-- ============================================

-- المعلمون يمكنهم رؤية اختباراتهم فقط
CREATE POLICY "Teachers can view own tests"
  ON test_models
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = test_models.user_id
    )
  );

-- المعلمون يمكنهم إنشاء اختبارات
CREATE POLICY "Teachers can create tests"
  ON test_models
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- الطالبات يمكنهن رؤية جميع الاختبارات (للقراءة فقط)
CREATE POLICY "Students can view all tests"
  ON test_models
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- ملاحظات:
-- ============================================
-- 1. هذه السياسات تحتاج إلى تكوين Supabase Auth بشكل صحيح
-- 2. قد تحتاجين إلى تعديل السياسات حسب متطلباتك
-- 3. تأكدي من تفعيل RLS في Supabase Dashboard


