# دليل ربط التطبيق بـ GitHub

هذا الدليل يشرح كيفية ربط مشروع تطبيق تدريب نافس بـ GitHub.

## المتطلبات الأساسية

1. حساب GitHub (إذا لم يكن لديك حساب، قم بإنشاء واحد من [github.com](https://github.com))
2. Git مثبت على جهازك (تحقق من التثبيت: `git --version`)

## الخطوات

### 1. تهيئة مستودع Git محلي

افتح Terminal في مجلد المشروع (`nafes-training`) وقم بتنفيذ الأوامر التالية:

```bash
# تهيئة مستودع Git
git init

# إضافة جميع الملفات
git add .

# إنشاء أول commit
git commit -m "Initial commit: تطبيق تدريب نافس"
```

### 2. إنشاء مستودع جديد على GitHub

1. اذهب إلى [github.com](https://github.com) وسجل الدخول
2. انقر على زر **"New"** أو **"+"** في الزاوية العلوية اليمنى
3. اختر **"New repository"**
4. املأ التفاصيل:
   - **Repository name**: `nafes-training` (أو أي اسم تفضله)
   - **Description**: تطبيق تدريب نافس - منصة تعليمية
   - **Visibility**: اختر Public أو Private حسب رغبتك
   - **لا تقم** بتهيئة المستودع بـ README أو .gitignore (لأننا لدينا بالفعل)
5. انقر على **"Create repository"**

### 3. ربط المستودع المحلي بـ GitHub

بعد إنشاء المستودع على GitHub، ستظهر لك تعليمات. استخدم الأوامر التالية:

```bash
# إضافة المستودع البعيد (استبدل YOUR_USERNAME باسم المستخدم الخاص بك)
git remote add origin https://github.com/YOUR_USERNAME/nafes-training.git

# التحقق من إضافة المستودع البعيد
git remote -v

# رفع التغييرات إلى GitHub
git branch -M main
git push -u origin main
```

### 4. إعداد Git (إذا لم تكن قد قمت بذلك من قبل)

إذا كانت هذه المرة الأولى التي تستخدم فيها Git، قم بتعيين اسمك وبريدك الإلكتروني:

```bash
git config --global user.name "اسمك الكامل"
git config --global user.email "your.email@example.com"
```

## الأوامر الأساسية للاستخدام اليومي

بعد ربط المشروع بـ GitHub، يمكنك استخدام الأوامر التالية:

### رفع التغييرات إلى GitHub

```bash
# إضافة الملفات المعدلة
git add .

# أو إضافة ملفات محددة
git add path/to/file

# إنشاء commit
git commit -m "وصف التغييرات"

# رفع التغييرات إلى GitHub
git push
```

### سحب التغييرات من GitHub

```bash
# سحب آخر التغييرات
git pull
```

### عرض حالة المشروع

```bash
# عرض الملفات المعدلة
git status

# عرض تاريخ الـ commits
git log
```

## ملاحظات مهمة

1. **ملف .env**: تم إضافته إلى `.gitignore` لحماية المعلومات الحساسة
2. **قاعدة البيانات**: ملفات قاعدة البيانات المحلية (`dev.db`) مستبعدة من Git
3. **node_modules**: مجلد `node_modules` مستبعد من Git (سيتم تثبيته عبر `npm install`)

## استكشاف الأخطاء

### خطأ: "remote origin already exists"
إذا ظهر هذا الخطأ، يمكنك إزالة المستودع البعيد الحالي وإضافته مرة أخرى:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/nafes-training.git
```

### خطأ: "authentication failed"
قد تحتاج إلى إعداد مصادقة GitHub:
- استخدم **Personal Access Token** بدلاً من كلمة المرور
- أو استخدم **SSH keys** للربط

## روابط مفيدة

- [دليل Git الأساسي](https://git-scm.com/book/ar/v2)
- [إنشاء Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [إعداد SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
