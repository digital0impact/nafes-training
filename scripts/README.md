# Scripts

## متغيرات البيئة (`.env`)

جميع سكربتات فحص/إصلاح ملف `.env` مجمّعة في `scripts/env/`:

```bash
npm run fix-env     # ينشئ .env من env.example عند الحاجة، ويطبّعه (BOM + DATABASE_URL)
npm run check-env   # فحص شامل: يعرض محتوى الملف، يتحقق من كل المتغيرات المطلوبة،
                     # يحلل DATABASE_URL ومفاتيح Supabase، ويطبع قائمة تحقق لـ Vercel
```

المنطق المشترك (تحليل DATABASE_URL، قراءة/تحليل الملف) موجود في `scripts/env/lib.ts`.

## التحقق من قاعدة البيانات

```bash
npm run check-db
```

أو:

```bash
npx tsx scripts/check-db.ts
```

هذا Script يتحقق من:
- ✅ اتصال قاعدة البيانات
- 📊 عدد المستخدمين
- 📚 عدد الفصول
- 👩‍🎓 عدد الطالبات
- 📝 عدد الاختبارات
- 🎯 عدد الأنشطة
- 👤 آخر المستخدمين
- 📚 آخر الفصول

