import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const testModel = await prisma.testModel.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // التأكد من أن النموذج يخص المعلم
      },
    });

    if (!testModel) {
      return NextResponse.json(
        { error: "النموذج غير موجود" },
        { status: 404 }
      );
    }

    // تحويل JSON strings إلى arrays
    const modelWithParsedData = {
      ...testModel,
      weeks: testModel.weeks ? JSON.parse(testModel.weeks) : [],
      relatedOutcomes: testModel.relatedOutcomes ? JSON.parse(testModel.relatedOutcomes) : [],
      questionIds: testModel.questionIds ? JSON.parse(testModel.questionIds) : [],
    };

    return NextResponse.json(modelWithParsedData);
  } catch (error) {
    console.error("Failed to fetch test model", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب النموذج" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    // التحقق من أن النموذج يخص المعلم قبل الحذف
    const testModel = await prisma.testModel.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!testModel) {
      return NextResponse.json(
        { error: "النموذج غير موجود" },
        { status: 404 }
      );
    }

    await prisma.testModel.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete test model", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف النموذج" },
      { status: 500 }
    );
  }
}

