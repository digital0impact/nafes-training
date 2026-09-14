import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

/**
 * يرجع معرف السنة الدراسية النشطة للمعلمة، أو null إذا لم تُفعّل
 * هذه الميزة بعد (كل فصولها تُعتبر "حالية" في هذه الحالة).
 */
export async function getActiveAcademicYearId(userId: string): Promise<string | null> {
  const active = await prisma.academicYear.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  })
  return active?.id ?? null
}

/**
 * فلتر Prisma لعرض فصول "السنة الحالية" فقط:
 * - إذا لم تُفعّل المعلمة الميزة بعد (activeYearId = null): لا فلترة، تظهر كل الفصول كما كان سابقاً.
 * - إذا فعّلتها: تظهر فقط فصول السنة النشطة (فصول السنوات السابقة تُنسب دائماً لسنتها عند
 *   إنشاء أول سنة، فلا تبقى فصول "بلا سنة" بعد أول استخدام للميزة).
 */
export function currentYearClassFilter(
  activeYearId: string | null
): Prisma.ClassWhereInput {
  return activeYearId ? { academicYearId: activeYearId } : {}
}
