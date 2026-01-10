-- ============================================
-- RPC Functions للطلاب (بدون auth)
-- ============================================

-- Function: إنشاء طالب جديد أو إرجاع الموجود
CREATE OR REPLACE FUNCTION create_or_get_student(
  p_nickname TEXT
)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER -- تعمل بصلاحيات المالك (service role)
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_student_id UUID;
BEGIN
  -- البحث عن طالب موجود بنفس الاسم
  SELECT s.id INTO v_student_id
  FROM students s
  WHERE s.nickname = p_nickname
  LIMIT 1;

  -- إذا لم يوجد، أنشئ طالب جديد
  IF v_student_id IS NULL THEN
    INSERT INTO students (nickname)
    VALUES (p_nickname)
    RETURNING students.id INTO v_student_id;
  END IF;

  -- إرجاع بيانات الطالب
  RETURN QUERY
  SELECT s.id, s.nickname, s.created_at
  FROM students s
  WHERE s.id = v_student_id;
END;
$$;

-- Function: التسجيل في فصل (Enrollment)
CREATE OR REPLACE FUNCTION enroll_student_in_class(
  p_student_id UUID,
  p_class_code TEXT
)
RETURNS TABLE (
  enrollment_id UUID,
  student_id UUID,
  class_id UUID,
  enrolled_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_class_id UUID;
  v_enrollment_id UUID;
BEGIN
  -- البحث عن الفصل بالكود
  SELECT c.id INTO v_class_id
  FROM classes c
  WHERE c.class_code = UPPER(p_class_code)
  LIMIT 1;

  -- التحقق من وجود الفصل
  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Class code not found: %', p_class_code;
  END IF;

  -- التحقق من عدم وجود تسجيل مسبق
  SELECT e.id INTO v_enrollment_id
  FROM enrollments e
  WHERE e.student_id = p_student_id
    AND e.class_id = v_class_id
  LIMIT 1;

  -- إذا لم يكن مسجل، أنشئ تسجيل جديد
  IF v_enrollment_id IS NULL THEN
    INSERT INTO enrollments (student_id, class_id)
    VALUES (p_student_id, v_class_id)
    RETURNING enrollments.id INTO v_enrollment_id;
  END IF;

  -- إرجاع بيانات التسجيل
  RETURN QUERY
  SELECT e.id, e.student_id, e.class_id, e.enrolled_at
  FROM enrollments e
  WHERE e.id = v_enrollment_id;
END;
$$;

-- Function: حفظ محاولة تدريب
CREATE OR REPLACE FUNCTION create_training_attempt(
  p_student_id UUID,
  p_class_code TEXT,
  p_score INTEGER,
  p_total INTEGER,
  p_answers JSONB DEFAULT NULL,
  p_time_spent INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  class_id UUID,
  score INTEGER,
  total INTEGER,
  percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_class_id UUID;
  v_attempt_id UUID;
BEGIN
  -- البحث عن الفصل بالكود
  SELECT c.id INTO v_class_id
  FROM classes c
  WHERE c.class_code = UPPER(p_class_code)
  LIMIT 1;

  -- التحقق من وجود الفصل
  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Class code not found: %', p_class_code;
  END IF;

  -- التحقق من أن الطالب مسجل في الفصل
  IF NOT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.student_id = p_student_id
      AND e.class_id = v_class_id
  ) THEN
    RAISE EXCEPTION 'Student is not enrolled in this class';
  END IF;

  -- التحقق من صحة البيانات
  IF p_score < 0 OR p_total <= 0 OR p_score > p_total THEN
    RAISE EXCEPTION 'Invalid score: score must be between 0 and total';
  END IF;

  -- إنشاء المحاولة
  INSERT INTO attempts (
    student_id,
    class_id,
    score,
    total,
    answers,
    time_spent
  )
  VALUES (
    p_student_id,
    v_class_id,
    p_score,
    p_total,
    p_answers,
    p_time_spent
  )
  RETURNING attempts.id INTO v_attempt_id;

  -- إرجاع بيانات المحاولة
  RETURN QUERY
  SELECT 
    a.id,
    a.student_id,
    a.class_id,
    a.score,
    a.total,
    a.percentage,
    a.created_at
  FROM attempts a
  WHERE a.id = v_attempt_id;
END;
$$;

-- Function: الحصول على محاولات طالب في فصل
CREATE OR REPLACE FUNCTION get_student_attempts(
  p_student_id UUID,
  p_class_code TEXT
)
RETURNS TABLE (
  id UUID,
  score INTEGER,
  total INTEGER,
  percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_class_id UUID;
BEGIN
  -- البحث عن الفصل بالكود
  SELECT c.id INTO v_class_id
  FROM classes c
  WHERE c.class_code = UPPER(p_class_code)
  LIMIT 1;

  -- التحقق من وجود الفصل
  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Class code not found: %', p_class_code;
  END IF;

  -- إرجاع محاولات الطالب في الفصل
  RETURN QUERY
  SELECT 
    a.id,
    a.score,
    a.total,
    a.percentage,
    a.created_at
  FROM attempts a
  WHERE a.student_id = p_student_id
    AND a.class_id = v_class_id
  ORDER BY a.created_at DESC;
END;
$$;

-- Function: التحقق من صحة كود الفصل
CREATE OR REPLACE FUNCTION validate_class_code(
  p_class_code TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  class_id UUID,
  class_name TEXT,
  teacher_name TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as is_valid,
    c.id as class_id,
    c.name as class_name,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as teacher_name
  FROM classes c
  JOIN auth.users u ON u.id = c.teacher_id
  WHERE c.class_code = UPPER(p_class_code)
  LIMIT 1;

  -- إذا لم يوجد، إرجاع false
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$;

-- ============================================
-- منح الصلاحيات للـ RPC Functions
-- ============================================

-- السماح للجميع (بما في ذلك غير المسجلين) باستدعاء هذه Functions
GRANT EXECUTE ON FUNCTION create_or_get_student(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION enroll_student_in_class(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_training_attempt(UUID, TEXT, INTEGER, INTEGER, JSONB, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_student_attempts(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_class_code(TEXT) TO anon, authenticated;
