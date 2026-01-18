import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireTeacher();
    
    // جلب الأنشطة من قاعدة البيانات فقط
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // تحويل content من JSON string إلى object
    const activitiesWithParsedContent = activities.map(activity => {
      let parsedContent = activity.content;
      if (typeof activity.content === 'string' && activity.content.trim()) {
        try {
          parsedContent = JSON.parse(activity.content);
        } catch (e) {
          console.error(`Error parsing content for activity ${activity.id}:`, e);
          parsedContent = {};
        }
      }
      return {
        ...activity,
        content: parsedContent,
      };
    });
    
    return NextResponse.json({ activities: activitiesWithParsedContent });
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
    const user = await requireTeacher();
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.title || !body.description || !body.duration || !body.skill) {
      return NextResponse.json(
        { error: "الرجاء إدخال جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    // حفظ النشاط في قاعدة البيانات
    const newActivity = await prisma.activity.create({
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        skill: body.skill,
        targetLevel: body.targetLevel,
        outcomeLesson: body.outcomeLesson,
        type: body.type,
        content: typeof body.content === 'string' 
          ? body.content 
          : JSON.stringify(body.content || {}),
        image: body.image,
        userId: user.id,
      },
    });

    // تحويل content من JSON string إلى object للاستجابة
    const activityWithParsedContent = {
      ...newActivity,
      content: typeof newActivity.content === 'string' 
        ? JSON.parse(newActivity.content) 
        : newActivity.content,
    };

    return NextResponse.json(activityWithParsedContent, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ النشاط" },
      { status: 500 }
    );
  }
}

