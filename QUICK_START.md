# ⚡ البدء السريع

## خطوات سريعة لتشغيل المشروع

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد ملف `.env`
```bash
# نسخ ملف المثال
copy env.example .env  # Windows
# أو
cp env.example .env    # Linux/Mac
```

ثم حدّثي القيم في `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - من Supabase Dashboard > Settings > API
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - من Supabase Dashboard > Settings > API
- `DATABASE_URL` - من Supabase Dashboard > Settings > Database > Connection string
- `NEXTAUTH_SECRET` - أي مفتاح عشوائي طويل
- `NEXTAUTH_URL` - http://localhost:3000

### 3. إعداد قاعدة البيانات
```bash
npx prisma generate
npx prisma db push
```

### 4. تشغيل المشروع
```bash
npm run dev
```

افتحي: **http://localhost:3000**

---

📖 للتفاصيل الكاملة، راجعي [SETUP_GUIDE.md](./SETUP_GUIDE.md)
