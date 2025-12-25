import { NextResponse } from "next/server";
import { getActivities, addActivity, type Activity } from "@/lib/activities";

export async function GET() {
  try {
    const activities = await getActivities();
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Failed to fetch activities", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الأنشطة" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.title || !body.description || !body.duration || !body.skill) {
      return NextResponse.json(
        { error: "الرجاء إدخال جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    const newActivity = await addActivity({
      title: body.title,
      description: body.description,
      duration: body.duration,
      skill: body.skill,
      targetLevel: body.targetLevel,
      outcomeLesson: body.outcomeLesson,
      type: body.type,
      content: body.content,
      image: body.image
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ النشاط" },
      { status: 500 }
    );
  }
}

