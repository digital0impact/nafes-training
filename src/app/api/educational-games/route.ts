import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

/**
 * API Route لجلب الألعاب التعليمية
 * متاح للطلاب والمعلمين
 */
export async function GET() {
  try {
    // قراءة الألعاب التعليمية من ملف JSON
    const gamesFile = path.join(process.cwd(), "src", "data", "educational-games.json")
    const fileContent = await readFile(gamesFile, "utf-8")
    const gamesData = JSON.parse(fileContent)
    
    return NextResponse.json(gamesData)
  } catch (error) {
    console.error("Failed to fetch educational games", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الألعاب التعليمية" },
      { status: 500 }
    )
  }
}
