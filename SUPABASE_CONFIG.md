# إعدادات Supabase

## المتغيرات البيئية المطلوبة

أضيفي هذه المتغيرات في ملف `.env`:

```env
# Supabase Client Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vatqqurkedwlyuqrfwrr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_2-hxh2UTI10KV65Yq-SI5A_lmvX2S6H

# Database Connection (Prisma) - مطلوب لربط Prisma بقاعدة البيانات
# احصلي على هذا الرابط من Supabase Dashboard:
# Settings > Database > Connection string > URI
# استبدلي [YOUR-PASSWORD] بكلمة مرور قاعدة البيانات
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.vatqqurkedwlyuqrfwrr.supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## الخطوات التالية

1. **احصلي على DATABASE_URL**:
   - اذهبي إلى Supabase Dashboard: https://supabase.com/dashboard
   - اختر مشروعك
   - Settings > Database > Connection string
   - اختر "URI" وانسخي الرابط
   - استبدلي `[YOUR-PASSWORD]` بكلمة مرور قاعدة البيانات

2. **أضيفي DATABASE_URL إلى ملف `.env`**

3. **شغلي الأوامر التالية**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **تحققي من الاتصال**:
   ```bash
   npx prisma studio
   ```

✅ **تم!** التطبيق الآن متصل بـ Supabase


