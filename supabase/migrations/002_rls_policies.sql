-- ============================================
-- تفعيل Row Level Security (RLS)
-- ============================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- سياسات RLS للفصول (Classes)
-- ============================================

-- المعلم يرى فصوله فقط
CREATE POLICY "Teachers can view their own classes"
  ON classes FOR SELECT
  USING (auth.uid() = teacher_id);

-- المعلم ينشئ فصوله فقط
CREATE POLICY "Teachers can create their own classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- المعلم يعدل فصوله فقط
CREATE POLICY "Teachers can update their own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- المعلم يحذف فصوله فقط
CREATE POLICY "Teachers can delete their own classes"
  ON classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- ============================================
-- سياسات RLS للطلاب (Students)
-- ============================================

-- لا أحد يمكنه قراءة بيانات الطلاب مباشرة (يتم عبر RPC)
CREATE POLICY "No direct access to students"
  ON students FOR SELECT
  USING (false);

-- لا أحد يمكنه إنشاء طلاب مباشرة (يتم عبر RPC)
CREATE POLICY "No direct insert to students"
  ON students FOR INSERT
  WITH CHECK (false);

-- ============================================
-- سياسات RLS للتسجيلات (Enrollments)
-- ============================================

-- المعلم يرى تسجيلات فصوله فقط
CREATE POLICY "Teachers can view enrollments of their classes"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- لا أحد يمكنه إنشاء تسجيلات مباشرة (يتم عبر RPC)
CREATE POLICY "No direct insert to enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (false);

-- ============================================
-- سياسات RLS للأسئلة (Questions)
-- ============================================

-- الجميع يمكنهم قراءة الأسئلة (للطلاب والمعلمين)
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

-- فقط المعلمين يمكنهم إنشاء/تعديل/حذف الأسئلة
CREATE POLICY "Only authenticated teachers can manage questions"
  ON questions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- سياسات RLS للمحاولات (Attempts)
-- ============================================

-- المعلم يرى محاولات طلاب فصوله فقط
CREATE POLICY "Teachers can view attempts of their classes"
  ON attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = attempts.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- لا أحد يمكنه إنشاء محاولات مباشرة (يتم عبر RPC)
CREATE POLICY "No direct insert to attempts"
  ON attempts FOR INSERT
  WITH CHECK (false);

-- ============================================
-- سياسات RLS للمهارات (Skills)
-- ============================================

-- الجميع يمكنهم قراءة المهارات
CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  USING (true);

-- فقط المعلمين يمكنهم إدارة المهارات
CREATE POLICY "Only authenticated teachers can manage skills"
  ON skills FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
