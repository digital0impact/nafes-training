import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "غير مصرح لك" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { studentId, name, grade, classCode, password } = body

    if (!studentId || !name || !grade || !classCode || !password) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    // التحقق من وجود الطالبة
    const existingStudent = await prisma.student.findUnique({
      where: { studentId: studentId.toUpperCase() },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: "رقم الطالبة مستخدم بالفعل" },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء الطالبة
    const student = await prisma.student.create({
      data: {
        studentId: studentId.toUpperCase(),
        name,
        grade,
        classCode,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        message: "تم إنشاء حساب الطالبة بنجاح",
        student: {
          id: student.id,
          studentId: student.studentId,
          name: student.name,
          grade: student.grade,
          classCode: student.classCode,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء حساب الطالبة" },
      { status: 500 }
    )
  }
}









