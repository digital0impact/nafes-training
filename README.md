# تدريب نافس - منصة الويب

تطبيق ويب تفاعلي مبني بـ **Next.js** و **Tailwind CSS** لتمكين المعلمة والطالبة من التدريب على اختبار نافس في مادة العلوم (ثالث متوسط) مع واجهة عربية واتجاه RTL بالكامل.

## المتطلبات

- **Node.js 18.17+** (يوصى بـ Node 20 أو أحدث)
- **npm 9+** (يأتي مع Node.js)

## خطوات التشغيل السريعة

### 1. تثبيت الحزم
```bash
npm install --legacy-peer-deps
```

### 2. إعداد ملف المتغيرات البيئية

أنشئي ملف `.env` في المجلد الرئيسي وانسخي محتوى `env.example` ثم أضيفي القيم الصحيحة:

```env
# من Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://vatqqurkedwlyuqrfwrr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key-here

# من Supabase Dashboard > Settings > Database > Connection string > URI
DATABASE_URL="postgresql://postgres:PASSWORD@db.vatqqurkedwlyuqrfwrr.supabase.co:5432/postgres"

# أي مفتاح عشوائي
NEXTAUTH_SECRET=any-random-string
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ مهم:** استبدلي `PASSWORD` بكلمة مرور قاعدة البيانات من Supabase.

**للتحقق من الإعداد:**
```bash
npm run check-env    # فحص شامل لملف .env (المتغيرات، DATABASE_URL، مفاتيح Supabase)
npm run check-db     # اختبار الاتصال الفعلي بقاعدة البيانات
```

### 3. إعداد قاعدة البيانات
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. التحقق من الاتصال
```bash
npm run check-db
```

### 5. تشغيل التطبيق

#### في Windows PowerShell:
إذا ظهرت رسالة خطأ عن Execution Policy، استخدمي ملفات المساعدة في `scripts/windows/`:

```powershell
.\scripts\windows\run-dev.ps1
```

**ملفات متاحة أخرى** (راجعي [`scripts/windows/README.md`](./scripts/windows/README.md) للتفاصيل):
- `scripts\windows\run-build.ps1` - لبناء التطبيق
- `scripts\windows\run-start.ps1` - لتشغيل التطبيق بعد البناء
- `scripts\windows\run-npm.ps1 <command>` - لتشغيل أي أمر npm

#### في Linux/Mac أو إذا لم تظهر مشكلة:
```bash
npm run dev
```

ثم افتحي المتصفح على **http://localhost:3000**

> 💡 **ملاحظة:** إذا واجهت مشكلة Execution Policy، راجعي ملف [FIX_EXECUTION_POLICY.md](./docs/guides/FIX_EXECUTION_POLICY.md) للحلول التفصيلية.

## الأدلة المتاحة

كل الأدلة التفصيلية موجودة في [`docs/guides/`](./docs/guides/)، أهمها:

- 📖 **[دليل الإعداد الكامل](./docs/guides/SETUP_GUIDE.md)** - خطوات تفصيلية لإعداد التطبيق محلياً
- 🚀 **[حالة النشر على Vercel](./docs/guides/VERCEL_DEPLOYMENT_STATUS.md)** - كيفية نشر التطبيق ومشاركته
- 🗄️ **[ربط Supabase](./supabase/README.md)** - خطوات تفصيلية لربط قاعدة بيانات Supabase
- 🔧 **[حل مشكلة Execution Policy](./docs/guides/FIX_EXECUTION_POLICY.md)** - حل مشكلة PowerShell في Windows
- 🐛 **[دليل حل المشاكل](./docs/guides/TROUBLESHOOTING.md)** - حلول للمشاكل الشائعة

## البنية العامة

- `app/` صفحات المسارات (الطالبة، المعلمة، التقارير…).
- `components/ui/` مكوّنات جاهزة (بطاقات، شارات، مؤشرات تقدم).
- `lib/data.ts` بيانات تجريبية لعرض الأمثلة.
- `prisma/` قاعدة البيانات (SQLite) ومخططات Prisma.
- Tailwind معدّ RTL افتراضيًا مع خط Cairo.

## المميزات

- ✅ إنشاء وإدارة الاختبارات التشخيصية
- ✅ بنك أسئلة شامل
- ✅ إنشاء الأنشطة التفاعلية
- ✅ إدارة الطالبات
- ✅ التقارير والإحصائيات
- ✅ نظام اشتراك (مجاني/مميز)

يمكن تعديل البيانات الحقيقية لاحقًا وربطها بواجهة برمجية أو قاعدة بيانات وقتما تشائين.

