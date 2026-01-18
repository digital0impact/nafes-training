import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function POST() {
  try {
    const user = await requireTeacher();
    
    // قراءة الأنشطة من ملف JSON
    const activitiesFile = path.join(process.cwd(), "src", "data", "activities.json");
    const fileContent = await readFile(activitiesFile, "utf-8");
    const activities = JSON.parse(fileContent);
    
    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    
    // إضافة كل نشاط إلى قاعدة البيانات
    for (const activity of activities) {
      try {
        // التحقق من وجود النشاط بالفعل
        const existing = await prisma.activity.findFirst({
          where: {
            id: activity.id,
            userId: user.id,
          },
        });
        
        if (existing) {
          skippedCount++;
          continue;
        }
        
        // إضافة النشاط
        await prisma.activity.create({
          data: {
            id: activity.id,
            title: activity.title,
            description: activity.description || "",
            duration: activity.duration || "10 دقائق",
            skill: activity.skill || "علوم",
            targetLevel: activity.targetLevel || null,
            outcomeLesson: activity.outcomeLesson || null,
            type: activity.type || null,
            content: JSON.stringify(activity.content || {}),
            image: activity.image || null,
            userId: user.id,
          },
        });
        
        importedCount++;
      } catch (error: any) {
        errors.push(`خطأ في النشاط ${activity.id}: ${error.message}`);
        console.error(`Error importing activity ${activity.id}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `تم استيراد ${importedCount} نشاط، تم تخطي ${skippedCount} نشاط موجود مسبقاً`,
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Failed to import activities", error);
    return NextResponse.json(
      { 
        error: "حدث خطأ أثناء استيراد الأنشطة",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
