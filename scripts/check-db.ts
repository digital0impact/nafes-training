/**
 * Script للتحقق من اتصال قاعدة البيانات
 * استخدمي: npx tsx scripts/check-db.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 جاري التحقق من اتصال قاعدة البيانات...\n')
    
    // التحقق من الاتصال
    await prisma.$connect()
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!\n')
    
    // جلب عدد المستخدمين
    const userCount = await prisma.user.count()
    console.log(`📊 عدد المستخدمين: ${userCount}`)
    
    // جلب عدد الفصول
    const classCount = await prisma.class.count()
    console.log(`📚 عدد الفصول: ${classCount}`)
    
    // جلب عدد الطالبات
    const studentCount = await prisma.student.count()
    console.log(`👩‍🎓 عدد الطالبات: ${studentCount}`)
    
    // جلب عدد الاختبارات
    const testCount = await prisma.testModel.count()
    console.log(`📝 عدد الاختبارات: ${testCount}`)
    
    // جلب عدد الأنشطة
    const activityCount = await prisma.activity.count()
    console.log(`🎯 عدد الأنشطة: ${activityCount}\n`)
    
    // جلب آخر 3 مستخدمين
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionPlan: true,
      }
    })
    
    if (recentUsers.length > 0) {
      console.log('👤 آخر المستخدمين:')
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`)
        console.log(`      الدور: ${user.role} | الاشتراك: ${user.subscriptionPlan}`)
      })
    } else {
      console.log('⚠️  لا يوجد مستخدمين في قاعدة البيانات')
      console.log('💡 يمكنك إنشاء حساب جديد من /auth/signup')
    }
    
    // جلب آخر 3 فصول
    const recentClasses = await prisma.class.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        code: true,
        name: true,
        grade: true,
        _count: {
          select: {
            students: true,
          },
        },
      }
    })
    
    if (recentClasses.length > 0) {
      console.log('\n📚 آخر الفصول:')
      recentClasses.forEach((classItem, index) => {
        console.log(`   ${index + 1}. ${classItem.name} (${classItem.code})`)
        console.log(`      الصف: ${classItem.grade} | عدد الطالبات: ${classItem._count.students}`)
      })
    }
    
    console.log('\n✅ قاعدة البيانات متصلة وتعمل بشكل صحيح!')
    
  } catch (error: any) {
    console.error('\n❌ خطأ في الاتصال بقاعدة البيانات:')
    console.error(error.message)
    
    if (error.message.includes('P1001')) {
      console.error('\n💡 الحل:')
      console.error('   - تأكدي من أن DATABASE_URL صحيح في ملف .env')
      console.error('   - تأكدي من أن Supabase يعمل')
      console.error('   - تأكدي من أن قاعدة البيانات متاحة')
    } else if (error.message.includes('P1000')) {
      console.error('\n💡 الحل:')
      console.error('   - تأكدي من أن كلمة مرور قاعدة البيانات صحيحة')
      console.error('   - تأكدي من أن المستخدم لديه صلاحيات الوصول')
    } else if (error.message.includes('P1017')) {
      console.error('\n💡 الحل:')
      console.error('   - تأكدي من أن الاتصال مستقر')
      console.error('   - جربي إعادة المحاولة')
    } else if (error.message.includes('env("DATABASE_URL")')) {
      console.error('\n💡 الحل:')
      console.error('   - تأكدي من وجود ملف .env')
      console.error('   - تأكدي من وجود DATABASE_URL في ملف .env')
      console.error('   - تأكدي من أن DATABASE_URL محاط بعلامات اقتباس')
    } else if (error.message.includes('Can\'t reach database server')) {
      console.error('\n💡 الحل:')
      console.error('   - تأكدي من أن Supabase يعمل')
      console.error('   - تأكدي من أن الاتصال بالإنترنت يعمل')
      console.error('   - تحققي من Supabase Dashboard')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

