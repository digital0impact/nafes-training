# Windows Helper Scripts

سكربتات مساعدة لمستخدمي Windows (PowerShell/CMD)، لتفادي مشاكل Execution Policy
وتسهيل تشغيل أوامر npm الشائعة. شغّليها من هذا المجلد أو بالمسار الكامل من جذر
المشروع، فكلها تنتقل تلقائياً إلى جذر المشروع قبل تنفيذ أي أمر.

| الملف | الاستخدام |
|---|---|
| `run-dev.ps1` | تشغيل التطبيق في وضع التطوير (`npm run dev`) |
| `run-build.ps1` | بناء التطبيق للإنتاج (`npm run build`) |
| `run-start.ps1` | تشغيل التطبيق بعد البناء (`npm start`) |
| `run-npm.ps1 <command>` | تشغيل أي أمر npm، مثال: `.\run-npm.ps1 "run lint"` |
| `check-env.ps1` | فحص متغيرات البيئة (`npm run check-env`) |
| `deploy-vercel.ps1` | إضافة/commit/push للتغييرات على `origin main` (نشر Vercel تلقائي عند الربط) |
| `push-github.cmd` | نفس فكرة `deploy-vercel.ps1` عبر CMD، مع سؤال عن رسالة الـ commit |

مثال تشغيل من جذر المشروع في PowerShell:

```powershell
.\scripts\windows\run-dev.ps1
```

راجعي [`FIX_EXECUTION_POLICY.md`](../../docs/guides/FIX_EXECUTION_POLICY.md) إذا
ظهرت رسالة خطأ عن Execution Policy رغم ذلك.
