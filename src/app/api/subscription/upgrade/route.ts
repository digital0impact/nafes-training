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

    // تحديث الاشتراك إلى premium
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionPlan: "premium" },
    })

    return NextResponse.json({
      message: "تم ترقية حسابك بنجاح",
      subscriptionPlan: user.subscriptionPlan,
    })
  } catch (error) {
    console.error("Error upgrading subscription:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء ترقية الحساب" },
      { status: 500 }
    )
  }
}









