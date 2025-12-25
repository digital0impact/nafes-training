import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { canCreateResource, type SubscriptionPlan } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    // جلب النماذج الخاصة بالمعلم فقط
    const testModels = await prisma.testModel.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // تحويل JSON strings إلى arrays
    const modelsWithParsedData = testModels.map((model) => ({
      ...model,
      weeks: model.weeks ? JSON.parse(model.weeks) : [],
      relatedOutcomes: model.relatedOutcomes ? JSON.parse(model.relatedOutcomes) : [],
      questionIds: model.questionIds ? JSON.parse(model.questionIds) : [],
    }));

    return NextResponse.json({ testModels: modelsWithParsedData });
  } catch (error) {
    console.error("Failed to fetch test models", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب النماذج" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.title || !body.period || !body.skill) {
      return NextResponse.json(
        { error: "الرجاء إدخال جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من صلاحيات الاشتراك
    const subscriptionPlan = (session.user.subscriptionPlan || "free") as SubscriptionPlan;
    const existingTests = await prisma.testModel.count({
      where: { userId: session.user.id }
    });

    if (!canCreateResource(subscriptionPlan, "test", existingTests)) {
      return NextResponse.json(
        { 
          error: "لقد وصلت إلى الحد الأقصى للاختبارات في الخطة المجانية. قم بترقية حسابك للاستفادة من إنشاء عدد غير محدود من الاختبارات.",
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    const newTestModel = await prisma.testModel.create({
      data: {
        title: body.title,
        description: body.description || "",
        period: body.period,
        weeks: JSON.stringify(body.weeks || []),
        relatedOutcomes: JSON.stringify(body.relatedOutcomes || []),
        questionIds: JSON.stringify(body.questionIds || []),
        duration: body.duration || 20,
        skill: body.skill,
        testType: body.testType || "normal",
        userId: session.user.id,
      },
    });

    // تحويل JSON strings إلى arrays
    const modelWithParsedData = {
      ...newTestModel,
      weeks: newTestModel.weeks ? JSON.parse(newTestModel.weeks) : [],
      relatedOutcomes: newTestModel.relatedOutcomes ? JSON.parse(newTestModel.relatedOutcomes) : [],
      questionIds: newTestModel.questionIds ? JSON.parse(newTestModel.questionIds) : [],
    };

    return NextResponse.json(modelWithParsedData, { status: 201 });
  } catch (error) {
    console.error("Failed to create test model", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ النموذج" },
      { status: 500 }
    );
  }
}

