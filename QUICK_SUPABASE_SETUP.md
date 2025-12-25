# إعداد سريع لـ Supabase

## خطوات سريعة (5 دقائق)

### 1. إنشاء مشروع Supabase
- اذهبي إلى: https://supabase.com
- سجلي دخول وأنشئي مشروع جديد
- احفظي كلمة مرور قاعدة البيانات

### 2. نسخ رابط الاتصال
- Settings > Database > Connection string
- اختر "URI" وانسخي الرابط

### 3. تحديث Prisma Schema
```bash
# افتحي prisma/schema.prisma وغيري:
provider = "postgresql"  # بدلاً من "sqlite"
```

### 4. تحديث ملف .env
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. تطبيق Migrations
```bash
npx prisma generate
npx prisma migrate deploy
```

### 6. التحقق
```bash
npx prisma studio
```

✅ **تم!** التطبيق الآن متصل بـ Supabase

---

**للتفاصيل الكاملة:** راجعي [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)







