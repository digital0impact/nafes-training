import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { studentSignInSchema } from "@/lib/validations"

/**
 * API Route لتسجيل دخول الطالب
 * الطالب يدخل باسم مستعار + كود الفصل بدون إنشاء حساب
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = studentSignInSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: validationResult.error.errors[0]?.message || "البيانات المدخلة غير صحيحة" 
        },
        { status: 400 }
      )
    }

    const { nickname, classCode } = validationResult.data

    // البحث عن الفصل باستخدام كود الفصل
    const classData = await prisma.class.findUnique({
      where: {
        code: classCode.toUpperCase()
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json(
        { error: "كود الفصل غير صحيح" },
        { status: 401 }
      )
    }

    // إرجاع معلومات الجلسة (بدون إنشاء حساب)
    // نستخدم nickname كمعرف مؤقت للطالب
    return NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      student: {
        id: `temp-${Date.now()}`, // معرف مؤقت
        nickname,
        classCode: classData.code,
        className: classData.name,
        grade: classData.grade,
        classId: classData.id,
      }
    })
  } catch (error) {
    console.error("Error in student signin:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    )
  }
}

















