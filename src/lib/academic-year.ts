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
 * - إذا فعّلتها: تظهر فصول السنة النشطة، بالإضافة لأي فصول "بلا سنة" (academicYearId = null) -
 *   وهذا يشمل فصولاً قديمة قبل تفعيل الميزة، أو فصولاً تحررت بعد حذف سنتها الدراسية (الحذف لا
 *   يمسح الفصول، فقط يفك ارتباطها بالسنة المحذوفة؛ عرضها ضمن "الحالية" أبسط وأوضح من إخفائها).
 */
export function currentYearClassFilter(
  activeYearId: string | null
): Prisma.ClassWhereInput {
  return activeYearId
    ? { OR: [{ academicYearId: activeYearId }, { academicYearId: null }] }
    : {}
}
