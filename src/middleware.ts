import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // الحصول على token من cookie
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production" 
  })
  
  const isAuthenticated = !!token

  // حماية صفحات المعلم
  if (pathname.startsWith("/teacher")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  // حماية صفحات الطالبة
  if (pathname.startsWith("/student") && pathname !== "/student") {
    // التحقق من وجود معلومات الطالبة في cookie أو localStorage
    // في middleware يمكننا فقط التحقق من cookies
    const studentCookie = req.cookies.get("student")
    if (!studentCookie) {
      // سيتم التحقق في الصفحة نفسها من localStorage
      // لأن middleware لا يمكنه الوصول إلى localStorage
    }
  }

  // حماية APIs - سيتم التحقق من المصادقة في API routes نفسها
  // لأن middleware في Edge Runtime قد لا يدعم Prisma

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/teacher/:path*",
    "/student/:path*",
    "/api/test-models/:path*",
    "/api/activities/:path*",
  ],
}

