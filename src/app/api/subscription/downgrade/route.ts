import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح لك" },
        { status: 401 }
      )
    }

    // تحديث الاشتراك إلى free
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionPlan: "free" },
    })

    return NextResponse.json({
      message: "تم تغيير حسابك إلى الخطة المجانية",
      subscriptionPlan: user.subscriptionPlan,
    })
  } catch (error) {
    console.error("Error downgrading subscription:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تغيير الخطة" },
      { status: 500 }
    )
  }
}









