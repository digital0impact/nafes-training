// هذا الملف يحتوي على دالة auth للاستخدام في Server Components و API Routes فقط
// لا يتم استيراد prisma هنا لتجنب مشاكل Edge Runtime في middleware
import { auth } from "./auth"

export { auth }









