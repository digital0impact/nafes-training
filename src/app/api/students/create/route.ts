import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createStudentSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const user = await requireTeacher()

    const body = await request.json()
    
    // التحقق من البيانات باستخدام Zod
    const validationResult = createStudentSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: validationResult.error.errors[0]?.message || "البيانات المدخلة غير صحيحة" 
        },
        { status: 400 }
      )
    }

    const { studentId, name, grade, classCode, password } = validationResult.data

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

    // البحث عن الفصل إذا كان classCode موجوداً
    let classId: string | null = null
    if (classCode) {
      const classData = await prisma.class.findUnique({
        where: { code: classCode.toUpperCase() },
      })
      if (classData && classData.userId === user.id) {
        classId = classData.id
      }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء الطالبة
    const student = await prisma.student.create({
      data: {
        studentId: studentId.toUpperCase(),
        name,
        grade,
        classCode: classCode.toUpperCase(),
        classId,
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

















