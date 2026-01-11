# أوامر رفع المشروع إلى GitHub

قم بتنفيذ هذه الأوامر بالترتيب في Terminal داخل مجلد `nafes-training`:

## الخطوة 1: التحقق من إعدادات المستودع البعيد
```bash
git remote -v
```
يجب أن يظهر:
```
origin  https://github.com/digital0impact/nafes-training.git (fetch)
origin  https://github.com/digital0impact/nafes-training.git (push)
```

## الخطوة 2: إضافة جميع الملفات
```bash
git add .
```

## الخطوة 3: إنشاء commit أولي
```bash
git commit -m "Initial commit: تطبيق تدريب نافس"
```

## الخطوة 4: تعيين الفرع الرئيسي (إذا لم يكن موجوداً)
```bash
git branch -M main
```

## الخطوة 5: رفع الملفات إلى GitHub
```bash
git push -u origin main
```

---

## ملاحظات مهمة:

### عند رفع الملفات (`git push`):
- قد يُطلب منك إدخال بيانات اعتماد GitHub
- **اسم المستخدم**: `digital0impact`
- **كلمة المرور**: استخدم **Personal Access Token** (ليس كلمة المرور العادية)

### إنشاء Personal Access Token:
1. اذهب إلى: https://github.com/settings/tokens
2. انقر على **"Generate new token"** > **"Generate new token (classic)"**
3. اختر الصلاحيات المطلوبة (على الأقل: `repo`)
4. انسخ الـ Token واستخدمه ككلمة مرور عند `git push`

---

## بعد الرفع بنجاح:
يمكنك زيارة المستودع على:
**https://github.com/digital0impact/nafes-training**
