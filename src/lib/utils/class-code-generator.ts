/**
 * دالة لتوليد رمز فريد للفصل بناءً على اسم الفصل والصف
 */
export function generateClassCode(name: string, grade: string): string {
  // استخراج الأحرف الأولى من اسم الفصل (مثل: "علوم ثالث متوسط أ" -> "علوم")
  const nameWords = name.trim().split(/\s+/)
  
  // محاولة استخراج كلمة رئيسية من اسم الفصل
  let prefix = ""
  
  // البحث عن كلمات رئيسية شائعة
  const keywords: { [key: string]: string } = {
    "علوم": "SCI",
    "رياضيات": "MATH",
    "فيزياء": "PHY",
    "كيمياء": "CHEM",
    "أحياء": "BIO",
    "عربي": "ARB",
    "إنجليزي": "ENG",
    "تربية": "EDU",
  }
  
  // البحث عن كلمة رئيسية في اسم الفصل
  for (const word of nameWords) {
    const normalizedWord = word.toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z]/g, "")
    if (keywords[normalizedWord]) {
      prefix = keywords[normalizedWord]
      break
    }
  }
  
  // إذا لم نجد كلمة رئيسية، نستخدم الأحرف الأولى من اسم الفصل
  if (!prefix) {
    // أخذ أول حرفين أو ثلاثة من اسم الفصل
    const firstChars = nameWords[0].substring(0, 3).toUpperCase()
    prefix = firstChars.replace(/[^A-Z0-9]/g, "") || "CLS"
  }
  
  // استخراج رقم الصف من حقل الصف
  let gradeNumber = ""
  const gradeMatch = grade.match(/\d+/)
  if (gradeMatch) {
    gradeNumber = gradeMatch[0]
  } else {
    // إذا لم نجد رقم، نستخدم رقم افتراضي
    gradeNumber = "0"
  }
  
  // إضافة حرف عشوائي في النهاية لضمان التفرد
  const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
  
  // توليد الرمز: PREFIX + GRADE + RANDOM_CHAR
  return `${prefix}${gradeNumber}${randomChar}`
}

/**
 * دالة لتوليد رمز فريد مع التحقق من عدم التكرار
 */
export async function generateUniqueClassCode(
  name: string,
  grade: string,
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let code = generateClassCode(name, grade)
  let attempts = 0
  const maxAttempts = 10
  
  // التحقق من عدم التكرار
  while (await checkExists(code) && attempts < maxAttempts) {
    // إضافة رقم عشوائي في النهاية
    const randomNum = Math.floor(Math.random() * 100)
    code = generateClassCode(name, grade) + randomNum.toString().padStart(2, "0")
    attempts++
  }
  
  // إذا استمر التكرار، نضيف timestamp
  if (attempts >= maxAttempts) {
    const timestamp = Date.now().toString().slice(-4)
    code = generateClassCode(name, grade) + timestamp
  }
  
  return code.toUpperCase()
}
