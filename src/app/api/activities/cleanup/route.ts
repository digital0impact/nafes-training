import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

// قائمة IDs الأنشطة غير المدمجة التي يجب حذفها
const NON_MERGED_ACTIVITY_IDS = [
  "SCI-U1-A01", // تم دمجه في SCI-U1-DRAGDROP-MERGED
  "SCI-U1-A02", // تم دمجه في SCI-U1-QUIZ-MERGED
  "SCI-U1-A04", // تم دمجه في SCI-U1-QUIZ-MERGED
  "SCI-U1-A05", // تم دمجه في SCI-U1-DRAGDROP-MERGED
  "SCI-U1-A06", // تم دمجه في SCI-U1-QUIZ-MERGED
  "SCI-U1-A07", // تم دمجه في SCI-U1-QUIZ-MERGED
  "SCI-U1-A08", // تم دمجه في SCI-U1-QUIZ-MERGED
];

export async function POST() {
  try {
    const user = await requireTeacher();
    
    let deletedCount = 0;
    let notFoundCount = 0;
    const errors: string[] = [];
    
    // حذف كل نشاط غير مدمج
    for (const activityId of NON_MERGED_ACTIVITY_IDS) {
      try {
        // التحقق من وجود النشاط وأنه يخص المستخدم
        const activity = await prisma.activity.findFirst({
          where: {
            id: activityId,
            userId: user.id,
          },
        });
        
        if (activity) {
          await prisma.activity.delete({
            where: {
              id: activityId,
            },
          });
          deletedCount++;
        } else {
          notFoundCount++;
        }
      } catch (error: any) {
        errors.push(`خطأ في حذف النشاط ${activityId}: ${error.message}`);
        console.error(`Error deleting activity ${activityId}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `تم حذف ${deletedCount} نشاط غير مدمج، ${notFoundCount} نشاط غير موجود`,
      deleted: deletedCount,
      notFound: notFoundCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Failed to cleanup activities", error);
    return NextResponse.json(
      { 
        error: "حدث خطأ أثناء حذف الأنشطة",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
