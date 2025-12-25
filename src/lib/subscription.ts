// نظام إدارة الاشتراكات والمميزات

export type SubscriptionPlan = "free" | "premium"

// تعريف المميزات لكل خطة
export const subscriptionFeatures = {
  free: {
    name: "مجاني",
    features: [
      "عرض لوحة التحكم",
      "عرض تقارير الطالبات (محدودة)",
      "عرض نواتج التعلم",
      "إنشاء اختبار واحد",
      "إنشاء نشاط واحد"
    ],
    limitations: {
      maxTests: 1,
      maxActivities: 1,
      advancedReports: false,
      studentManagement: false,
      questionBank: false,
      exportData: false
    }
  },
  premium: {
    name: "مميز",
    features: [
      "جميع المميزات المجانية",
      "إنشاء اختبارات غير محدودة",
      "إنشاء أنشطة غير محدودة",
      "تقارير متقدمة",
      "إدارة الطالبات",
      "بنك الأسئلة الكامل",
      "تصدير البيانات"
    ],
    limitations: {
      maxTests: -1, // غير محدود
      maxActivities: -1, // غير محدود
      advancedReports: true,
      studentManagement: true,
      questionBank: true,
      exportData: true
    }
  }
}

// التحقق من صلاحيات الاشتراك
export function hasFeatureAccess(
  subscriptionPlan: SubscriptionPlan,
  feature: keyof typeof subscriptionFeatures.premium.limitations
): boolean {
  const plan = subscriptionFeatures[subscriptionPlan]
  const limitation = plan.limitations[feature]
  
  if (typeof limitation === "boolean") {
    return limitation
  }
  
  // للحدود العددية، -1 يعني غير محدود
  return limitation === -1
}

// التحقق من الحد الأقصى للموارد
export function canCreateResource(
  subscriptionPlan: SubscriptionPlan,
  resourceType: "test" | "activity",
  currentCount: number
): boolean {
  const plan = subscriptionFeatures[subscriptionPlan]
  const maxLimit = resourceType === "test" 
    ? plan.limitations.maxTests 
    : plan.limitations.maxActivities
  
  if (maxLimit === -1) return true // غير محدود
  return currentCount < maxLimit
}

// الحصول على معلومات الخطة
export function getPlanInfo(plan: SubscriptionPlan) {
  return subscriptionFeatures[plan]
}

