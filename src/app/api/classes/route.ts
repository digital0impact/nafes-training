import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { createClassSchema } from "@/lib/validations"
import { generateUniqueClassCode } from "@/lib/utils/class-code-generator"

/**
 * GET - جلب جميع فصول المعلم
 */
export async function GET() {
  try {
    const user = await requireTeacher()

    const classes = await prisma.class.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الفصول" },
      { status: 500 }
    )
  }
}

/**
 * POST - إنشاء فصل جديد
 */
export async function POST(request: Request) {
  try {
    const user = await requireTeacher()

    const body = await request.json()

    // التحقق من البيانات باستخدام Zod
    const validationResult = createClassSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.errors[0]?.message ||
            "البيانات المدخلة غير صحيحة",
        },
        { status: 400 }
      )
    }

    const { name, grade, code } = validationResult.data

    // توليد رمز الفصل تلقائياً إذا لم يتم إدخاله
    let classCode = code?.trim().toUpperCase() || ""
    
    if (!classCode) {
      // دالة للتحقق من وجود رمز في قاعدة البيانات
      const checkCodeExists = async (code: string): Promise<boolean> => {
        const existing = await prisma.class.findUnique({
          where: { code },
        })
        return !!existing
      }
      
      classCode = await generateUniqueClassCode(name, grade, checkCodeExists)
    } else {
      // التحقق من وجود فصل بنفس الرمز إذا تم إدخاله يدوياً
      const existingClass = await prisma.class.findUnique({
        where: { code: classCode },
      })

      if (existingClass) {
        return NextResponse.json(
          { error: "رمز الفصل مستخدم بالفعل" },
          { status: 400 }
        )
      }
    }

    // إنشاء الفصل
    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        code: classCode,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "تم إنشاء الفصل بنجاح",
        class: newClass,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الفصل" },
      { status: 500 }
    )
  }
}

