import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب قائمة نماذج الاختبارات المُرسلة للطالبة
 * Query: studentId = معرف الطالبة (id من جدول students)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const debug = searchParams.get("debug") === "1"

    if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
      return NextResponse.json(
        { error: "معرف الطالبة مطلوب", modelIds: [], ...(debug && { debug: { reason: "معرف الطالبة غير مرسل" } }) },
        { status: 400 }
      )
    }

    const idParam = studentId.trim()
    // دعم كلا المعرفين: id (قاعدة البيانات) أو رقم الطالبة (مثل STU-001)
    let student = await prisma.student.findUnique({
      where: { id: idParam },
      select: { id: true, classId: true, class: { select: { userId: true } } },
    })
    if (!student && /^[A-Z0-9_-]+$/i.test(idParam)) {
      student = await prisma.student.findUnique({
        where: { studentId: idParam.toUpperCase() },
        select: { id: true, classId: true, class: { select: { userId: true } } },
      })
    }

    if (!student) {
      const payload: { modelIds: string[]; debug?: object } = { modelIds: [] }
      if (debug) payload.debug = { reason: "لم تُوجد طالبة بهذا المعرف (رقم الطالبة أو id)", param: idParam }
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, max-age=0", Pragma: "no-cache" },
      })
    }

    if (!student.class) {
      const payload: { modelIds: string[]; debug?: object } = { modelIds: [] }
      if (debug) payload.debug = { reason: "الطالبة غير مرتبطة بفصل. ربطيها بفصل من لوحة المعلمة.", studentId: student.id }
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, max-age=0", Pragma: "no-cache" },
      })
    }

    const teacherId = student.class.userId

    const allShares = await prisma.testShare.findMany({
      where: { userId: teacherId },
      select: { modelId: true, shareToAll: true, studentIds: true },
    })

    const modelIds: string[] = []
    for (const s of allShares) {
      let modelId = s.modelId
      if (modelId.startsWith("custom-")) {
        const parts = modelId.split("-")
        if (parts.length >= 3) modelId = parts.slice(2).join("-")
      }
      if (s.shareToAll) {
        modelIds.push(modelId)
        continue
      }
      try {
        const ids = JSON.parse(s.studentIds) as string[]
        if (Array.isArray(ids) && ids.includes(student.id)) {
          modelIds.push(modelId)
        }
      } catch {
        // ignore invalid JSON
      }
    }

    const payload: { modelIds: string[]; debug?: object } = { modelIds }
    if (debug) {
      payload.debug = {
        reason: modelIds.length > 0 ? "تم العثور على اختبارات" : "معلمتك لديها مشاركات لكن لا تطابق طالبتك (إرسال لطالبات محددات؟ تأكدي أن الطالبة من نفس الفصل والحساب).",
        teacherId,
        sharesCount: allShares.length,
        shareToAllCount: allShares.filter((x) => x.shareToAll).length,
        studentInListCount: allShares.filter((x) => {
          if (x.shareToAll) return true
          try {
            const ids = JSON.parse(x.studentIds) as string[]
            return Array.isArray(ids) && ids.includes(student.id)
          } catch {
            return false
          }
        }).length,
      }
    }

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store, no-cache, max-age=0", Pragma: "no-cache" },
    })
  } catch (error) {
    console.error("Error fetching assigned tests:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الاختبارات", modelIds: [] },
      { status: 500 }
    )
  }
}
