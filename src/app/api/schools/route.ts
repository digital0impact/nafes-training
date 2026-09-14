import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { createSchoolSchema } from "@/lib/validations"

/**
 * GET - جلب قائمة المدارس (لأي معلمة/مدير مسجل دخول، لاستخدامها في قوائم الاختيار)
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const schools = await prisma.school.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        _count: { select: { teachers: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ schools })
  } catch (error) {
    console.error("Error fetching schools:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المدارس" },
      { status: 500 }
    )
  }
}

/**
 * POST - إنشاء مدرسة جديدة (للمدير فقط حالياً)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "إنشاء المدارس متاح للمدير فقط" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = createSchoolSchema.safeParse(body)

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

    const { name, city } = validationResult.data

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        city: city?.trim() || null,
      },
    })

    return NextResponse.json({ school }, { status: 201 })
  } catch (error) {
    console.error("Error creating school:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء المدرسة" },
      { status: 500 }
    )
  }
}
