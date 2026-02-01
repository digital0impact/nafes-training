import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // حماية صفحات المعلم
  if (pathname.startsWith("/teacher")) {
    try {
      const response = NextResponse.next()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              // حفظ الـ cookies في الـ response
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              // حذف الـ cookies من الـ response
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        const redirectUrl = new URL("/auth/signin", req.url)
        // إضافة رسالة خطأ في URL
        redirectUrl.searchParams.set("error", "يجب تسجيل الدخول أولاً")
        return NextResponse.redirect(redirectUrl)
      }
      
      return response
    } catch (error: any) {
      console.error("Middleware error:", error)
      const redirectUrl = new URL("/auth/signin", req.url)
      redirectUrl.searchParams.set("error", "حدث خطأ في التحقق من المصادقة")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // حماية صفحات الزائر (Visitor/Reviewer) - يتطلب تسجيل دخول
  if (pathname.startsWith("/visitor")) {
    try {
      const response = NextResponse.next()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              response.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              response.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        const redirectUrl = new URL("/auth/signin", req.url)
        redirectUrl.searchParams.set("error", "يجب تسجيل الدخول أولاً")
        return NextResponse.redirect(redirectUrl)
      }
      return response
    } catch (error: unknown) {
      console.error("Middleware error:", error)
      const redirectUrl = new URL("/auth/signin", req.url)
      redirectUrl.searchParams.set("error", "حدث خطأ في التحقق من المصادقة")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // حماية صفحات الطالبة
  // ملاحظة: التحقق من localStorage يتم في Client Component
  if (pathname.startsWith("/student") && pathname !== "/student" && pathname !== "/auth/student-signin") {
    // التحقق في الصفحة نفسها
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/teacher/:path*",
    "/visitor/:path*",
    "/student/:path*",
    "/api/test-models/:path*",
    "/api/educational-games/:path*",
  ],
}

