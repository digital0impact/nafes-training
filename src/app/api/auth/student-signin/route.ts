import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { studentSignInSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"

/**
 * API Route لتسجيل دخول الطالب
 * الطالبة تدخل برقم الطالبة + كلمة المرور
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

    const { studentId, password } = validationResult.data

    const student = await prisma.student.findUnique({
      where: { studentId: studentId.toUpperCase() },
      include: {
        class: {
          select: {
            id: true,
            code: true,
            name: true,
            grade: true,
            userId: true,
          },
        },
      },
    })

    if (!student || !student.class) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      )
    }

    const ok = await bcrypt.compare(password, student.password)
    if (!ok) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      student: {
        // هذا هو معرف الطالبة الحقيقي داخل قاعدة البيانات
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        classCode: student.class.code,
        className: student.class.name,
        grade: student.class.grade,
        classId: student.class.id,
        teacherId: student.class.userId,
      },
    })
  } catch (error) {
    console.error("Error in student signin:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    )
  }
}

















