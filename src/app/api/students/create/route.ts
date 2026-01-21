import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createStudentSchema } from "@/lib/validations"

async function generateNextStudentId(): Promise<string> {
  const students = await prisma.student.findMany({
    select: { studentId: true },
  })

  let max = 300
  for (const s of students) {
    const match = /^STU-(\d+)$/i.exec(s.studentId)
    if (!match) continue
    const n = Number(match[1])
    if (Number.isFinite(n) && n > max) max = n
  }

  return `STU-${String(max + 1).padStart(3, "0")}`
}

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

    // إنشاء كلمة مرور افتراضية إذا لم يتم توفيرها
    const finalPassword = password || "1234"

    // رقم الطالبة: إذا لم يُرسل، نولده في السيرفر لتجنب التكرار
    let finalStudentId = studentId?.toUpperCase()
    if (!finalStudentId) {
      finalStudentId = await generateNextStudentId()
    }

    // البحث عن الفصل إذا كان classCode موجوداً (ويجب أن يخص نفس المعلم)
    let classId: string | null = null
    if (classCode) {
      const classData = await prisma.class.findUnique({
        where: { code: classCode.toUpperCase() },
      })
      if (!classData || classData.userId !== user.id) {
        return NextResponse.json(
          { error: "الفصل غير موجود أو لا يخص هذا المعلم" },
          { status: 400 }
        )
      }
      classId = classData.id
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // إنشاء الطالبة (مع إعادة محاولة بسيطة لو حدث تعارض على unique)
    let student:
      | {
          id: string
          studentId: string
          name: string
          grade: string
          classCode: string
        }
      | undefined

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const created = await prisma.student.create({
          data: {
            studentId: finalStudentId,
            name,
            grade,
            classCode: classCode.toUpperCase(),
            classId,
            password: hashedPassword,
          },
        })

        student = {
          id: created.id,
          studentId: created.studentId,
          name: created.name,
          grade: created.grade,
          classCode: created.classCode,
        }
        break
      } catch (e: any) {
        // Prisma unique constraint violation
        if (e?.code === "P2002") {
          if (studentId) {
            return NextResponse.json(
              { error: "رقم الطالبة مستخدم بالفعل" },
              { status: 400 }
            )
          }
          finalStudentId = await generateNextStudentId()
          continue
        }
        throw e
      }
    }

    if (!student) {
      return NextResponse.json(
        { error: "تعذر إنشاء حساب الطالبة. حاولي مرة أخرى." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "تم إنشاء حساب الطالبة بنجاح",
        password: finalPassword, // إرجاع كلمة المرور للعرض للمعلم
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

















