import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, password } = body

    if (!studentId || !password) {
      return NextResponse.json(
        { error: "رقم الطالبة وكلمة المرور مطلوبان" },
        { status: 400 }
      )
    }

    // البحث عن الطالبة
    const student = await prisma.student.findUnique({
      where: {
        studentId: studentId.toUpperCase()
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "رقم الطالبة غير صحيح" },
        { status: 401 }
      )
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, student.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      )
    }

    // إرجاع معلومات الطالبة (بدون كلمة المرور)
    return NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      student: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        grade: student.grade,
        classCode: student.classCode,
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









