import Link from "next/link";
import { PageBackground } from "@/components/layout/page-background";

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <div className="card bg-white">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 mb-4 inline-block"
            >
              ← العودة للصفحة الرئيسية
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              سياسة الخصوصية
            </h1>
            <p className="text-slate-600">
              آخر تحديث: {new Date().toLocaleDateString("ar-SA")}
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-right">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                مقدمة
              </h2>
              <p className="text-slate-700 leading-relaxed">
                نحن في منصة نافس للتدريب نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية.
                توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                المعلومات التي نجمعها
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>معلومات الحساب: الاسم، البريد الإلكتروني، كلمة المرور</li>
                <li>معلومات الفصل: اسم الفصل، رمز الفصل، الصف</li>
                <li>معلومات الأداء: نتائج الاختبارات، الأنشطة المنجزة</li>
                <li>معلومات الاستخدام: سجلات الدخول، الأنشطة على المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                كيفية استخدام المعلومات
              </h2>
              <p className="text-slate-700 leading-relaxed">
                نستخدم المعلومات التي نجمعها لتقديم وتحسين خدمات المنصة، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-2">
                <li>توفير الوصول إلى المنصة وخدماتها</li>
                <li>تتبع تقدم الطالبات وتقديم تقارير للمعلمات</li>
                <li>تحسين تجربة المستخدم</li>
                <li>إرسال إشعارات مهمة حول المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                حماية المعلومات
              </h2>
              <p className="text-slate-700 leading-relaxed">
                نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التغيير
                أو الكشف أو التدمير. ومع ذلك، لا يمكن ضمان الأمان المطلق لأي معلومات عبر الإنترنت.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                مشاركة المعلومات
              </h2>
              <p className="text-slate-700 leading-relaxed">
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-2">
                <li>عند الحصول على موافقتك الصريحة</li>
                <li>عندما يكون ذلك مطلوباً بموجب القانون</li>
                <li>لحماية حقوقنا أو حقوق المستخدمين الآخرين</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                حقوقك
              </h2>
              <p className="text-slate-700 leading-relaxed">
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-2">
                <li>الوصول إلى معلوماتك الشخصية</li>
                <li>تصحيح معلوماتك الشخصية</li>
                <li>حذف حسابك ومعلوماتك</li>
                <li>الاعتراض على معالجة معلوماتك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                التغييرات على السياسة
              </h2>
              <p className="text-slate-700 leading-relaxed">
                قد نحدث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عن طريق
                نشر السياسة المحدثة على هذه الصفحة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                الاتصال بنا
              </h2>
              <p className="text-slate-700 leading-relaxed">
                إذا كان لديك أي أسئلة حول هذه السياسة، يرجى{" "}
                <Link href="/contact" className="text-teal-600 hover:text-teal-700 font-medium">
                  الاتصال بنا
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
