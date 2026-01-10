import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const user = await requireAuth()

    // تحديث الاشتراك إلى free
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: "free" },
    })

    return NextResponse.json({
      message: "تم تغيير حسابك إلى الخطة المجانية",
      subscriptionPlan: updatedUser.subscriptionPlan,
    })
  } catch (error) {
    console.error("Error downgrading subscription:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تغيير الخطة" },
      { status: 500 }
    )
  }
}

















