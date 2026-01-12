# GitHub Actions

هذا المجلد يحتوي على ملفات إعدادات GitHub Actions لعمليات CI/CD التلقائية.

## الملفات المتاحة

### build.yml
يقوم هذا الملف بالتحقق من بناء المشروع تلقائياً عند:
- رفع تغييرات إلى فرع `main`
- إنشاء Pull Request إلى فرع `main`

## الإعداد المطلوب

لتفعيل GitHub Actions، يجب إضافة Secrets التالية في إعدادات المستودع:

1. اذهب إلى: `Settings` > `Secrets and variables` > `Actions`
2. أضف الـ Secrets التالية:
   - `DATABASE_URL`: رابط قاعدة البيانات
   - `NEXT_PUBLIC_SUPABASE_URL`: رابط Supabase
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: مفتاح Supabase

## كيفية إضافة Secrets

1. اذهب إلى المستودع على GitHub
2. اضغط على `Settings`
3. اختر `Secrets and variables` > `Actions`
4. اضغط على `New repository secret`
5. أدخل الاسم والقيمة
6. اضغط على `Add secret`

## ملاحظات

- هذه الإعدادات اختيارية وليست إلزامية
- يمكنك حذف هذا المجلد إذا لم تكن بحاجة لـ CI/CD
- يمكنك تخصيص الملفات حسب احتياجاتك
