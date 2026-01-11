import Link from "next/link";
import { PageBackground } from "@/components/layout/page-background";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="card bg-white">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 mb-4 inline-block"
            >
              ← العودة للصفحة الرئيسية
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              اتصل بنا
            </h1>
            <p className="text-slate-600">
              نحن هنا لمساعدتك. إذا كان لديك أي أسئلة أو استفسارات، لا تترددي في التواصل معنا.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                معلومات الاتصال
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-teal-100 p-3">
                    <svg
                      className="h-6 w-6 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">البريد الإلكتروني</h3>
                    <p className="text-slate-600">
                      <a
                        href="mailto:support@nafes-training.com"
                        className="text-teal-600 hover:text-teal-700"
                      >
                        support@nafes-training.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">المكان</h3>
                    <p className="text-slate-600">المملكة العربية السعودية</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                أوقات الاستجابة
              </h2>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-slate-700">
                  نحن نسعى للرد على استفساراتك في أقرب وقت ممكن. عادة ما نرد خلال 24-48 ساعة
                  خلال أيام العمل.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                الدعم الفني
              </h2>
              <p className="text-slate-700 mb-4">
                إذا واجهت أي مشاكل تقنية أثناء استخدام المنصة، يرجى إرسال بريد إلكتروني
                مع تفاصيل المشكلة وسنقوم بمساعدتك في أقرب وقت.
              </p>
            </section>

            <section className="rounded-lg border border-teal-200 bg-teal-50 p-6">
              <h3 className="font-semibold text-teal-900 mb-2">
                شكراً لاستخدامك منصة نافس للتدريب
              </h3>
              <p className="text-sm text-teal-800">
                نحن ملتزمون بتقديم أفضل تجربة تعليمية ممكنة لك ولطالباتك.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
