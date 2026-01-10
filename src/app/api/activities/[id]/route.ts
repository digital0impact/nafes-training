import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: {
        id: params.id,
        userId: user.id, // التأكد من أن النشاط يخص المعلم
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "النشاط غير موجود" },
        { status: 404 }
      );
    }

    // تحويل content من JSON string إلى object
    const activityWithParsedContent = {
      ...activity,
      content: activity.content ? JSON.parse(activity.content) : null,
    };

    return NextResponse.json(activityWithParsedContent);
  } catch (error) {
    console.error("Failed to fetch activity", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب النشاط" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    // التحقق من أن النشاط يخص المعلم قبل الحذف
    const activity = await prisma.activity.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "النشاط غير موجود" },
        { status: 404 }
      );
    }

    await prisma.activity.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete activity", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف النشاط" },
      { status: 500 }
    );
  }
}
