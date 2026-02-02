import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE - حذف طالبة
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTeacher();
    const { id } = await params;

    const student = await prisma.student.findFirst({
      where: {
        id,
        class: {
          userId: user.id,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "الطالبة غير موجودة" },
        { status: 404 }
      );
    }

    // حذف الطالبة
    await prisma.student.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الطالبة" },
      { status: 500 }
    );
  }
}
