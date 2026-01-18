import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * GET - جلب نشاط محدد
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher();

    const activity = await prisma.activity.findFirst({
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

    // تحويل content من JSON string إلى object
    const activityWithParsedContent = {
      ...activity,
      content: typeof activity.content === 'string' 
        ? JSON.parse(activity.content) 
        : activity.content,
    };

    return NextResponse.json({ activity: activityWithParsedContent });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب النشاط" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - تعديل نشاط
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher();
    const body = await request.json();

    // التحقق من أن النشاط يخص المعلمة
    const activity = await prisma.activity.findFirst({
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

    // تحديث النشاط
    const updatedActivity = await prisma.activity.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        description: body.description,
        skill: body.skill,
        duration: body.duration,
        outcomeLesson: body.outcomeLesson,
        targetLevel: body.targetLevel,
      },
    });

    return NextResponse.json({ activity: updatedActivity });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث النشاط" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - حذف نشاط
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher();

    // التحقق من أن النشاط يخص المعلمة
    const activity = await prisma.activity.findFirst({
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

    // حذف النشاط
    await prisma.activity.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف النشاط" },
      { status: 500 }
    );
  }
}
