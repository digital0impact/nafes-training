import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // حماية صفحات المعلم
  if (pathname.startsWith("/teacher")) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              // لا يمكن تعديل cookies في middleware
            },
            remove(name: string, options: CookieOptions) {
              // لا يمكن حذف cookies في middleware
            },
          },
        }
      )
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  // حماية صفحات الطالبة
  // ملاحظة: التحقق من localStorage يتم في Client Component
  // لأن middleware لا يمكنه الوصول إلى localStorage
  if (pathname.startsWith("/student") && pathname !== "/student" && pathname !== "/auth/student-signin") {
    // سيتم التحقق في الصفحة نفسها من localStorage
    // لا يمكن إعادة التوجيه من middleware لأن localStorage غير متاح
  }

  // حماية APIs - سيتم التحقق من المصادقة في API routes نفسها

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

