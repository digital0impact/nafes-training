export type OutcomeInfographic = {
  url: string;
  title: string;
};

const INFOGRAPHICS_BY_LESSON: Record<string, OutcomeInfographic[]> = {
  "الخلايا ووحدة بناء المخلوقات الحية": [
    { url: "/images/activities/الخلايا ووحدة بناء المخلوقات الحية/1-1.png", title: "انفوجرافيك 1-1" },
    { url: "/images/activities/الخلايا ووحدة بناء المخلوقات الحية/1-2.png", title: "انفوجرافيك 1-2" },
    { url: "/images/activities/الخلايا ووحدة بناء المخلوقات الحية/1-3.png", title: "انفوجرافيك 1-3" },
  ],
  "تكامل أجهزة جسم الإنسان": [
    { url: "/images/activities/تكامل أجهزة جسم الإنسان2/2-1.png", title: "انفوجرافيك 2-1" },
    { url: "/images/activities/تكامل أجهزة جسم الإنسان2/2-2.png", title: "انفوجرافيك 2-2" },
    { url: "/images/activities/تكامل أجهزة جسم الإنسان2/2-3.png", title: "انفوجرافيك 2-3" },
  ],
  "تصنيف المخلوقات الحية بنظام لينيوس": [
    { url: "/images/activities/تصنيف المخلوقات الحية بنظام3 لينيوس/3-1.png", title: "انفوجرافيك 3-1" },
    { url: "/images/activities/تصنيف المخلوقات الحية بنظام3 لينيوس/3-2.png", title: "انفوجرافيك 3-2" },
    { url: "/images/activities/تصنيف المخلوقات الحية بنظام3 لينيوس/3-3.png", title: "انفوجرافيك 3-3" },
  ],
  "انقسام الخلية وتكاثرها": [
    { url: "/images/activities/انقسام الخلية وتكاثرها/4-1.png", title: "انفوجرافيك 4-1" },
    { url: "/images/activities/انقسام الخلية وتكاثرها/4-2.png", title: "انفوجرافيك 4-2" },
    { url: "/images/activities/انقسام الخلية وتكاثرها/4-3.png", title: "انفوجرافيك 4-3" },
    { url: "/images/activities/انقسام الخلية وتكاثرها/4-4.png", title: "انفوجرافيك 4-4" },
    { url: "/images/activities/انقسام الخلية وتكاثرها/4-5.png", title: "انفوجرافيك 4-5" },
  ],
  "مادة الوراثة": [
    { url: "/images/activities/مادة الوراثة/5-1.png", title: "انفوجرافيك 5-1" },
    { url: "/images/activities/مادة الوراثة/5-2.png", title: "انفوجرافيك 5-2" },
    { url: "/images/activities/مادة الوراثة/5-3.png", title: "انفوجرافيك 5-3" },
    { url: "/images/activities/مادة الوراثة/5-4.png", title: "انفوجرافيك 5-4" },
  ],
  "علم الوراثة وقوانين مندل": [
    { url: "/images/activities/علم الوراثة وقوانين مندل/6-1.png", title: "انفوجرافيك 6-1" },
    { url: "/images/activities/علم الوراثة وقوانين مندل/6-2.png", title: "انفوجرافيك 6-2" },
    { url: "/images/activities/علم الوراثة وقوانين مندل/6-3.png", title: "انفوجرافيك 6-3" },
    { url: "/images/activities/علم الوراثة وقوانين مندل/6-4.png", title: "انفوجرافيك 6-4" },
    { url: "/images/activities/علم الوراثة وقوانين مندل/6-5.png", title: "انفوجرافيك 6-5" },
  ],
  // توسعة الربط لباقي النواتج مع أنماط تسمية شائعة للمجلدات/الصور.
  "المركبات والمخاليط": [
    { url: "/images/activities/المركبات والمخاليط/7-1.png", title: "انفوجرافيك 7-1" },
    { url: "/images/activities/المركبات والمخاليط/7-2.png", title: "انفوجرافيك 7-2" },
    { url: "/images/activities/المركبات والمخاليط/7-3.png", title: "انفوجرافيك 7-3" },
    { url: "/images/activities/المركبات والمخاليط/7-4.png", title: "انفوجرافيك 7-4" },
    { url: "/images/activities/المركبات والمخاليط/7-5.png", title: "انفوجرافيك 7-5" },
  ],
  "الذائبية ومعدل الذوبان": [
    { url: "/images/activities/الذائبية ومعدل الذوبان/7-1.png", title: "انفوجرافيك 7-1" },
    { url: "/images/activities/الذائبية ومعدل الذوبان/7-2.png", title: "انفوجرافيك 7-2" },
    { url: "/images/activities/الذائبية ومعدل الذوبان/7-3.png", title: "انفوجرافيك 7-3" },
  ],
  "الجدول الدوري": [
    { url: "/images/activities/الجدول الدوري/7-1.png", title: "انفوجرافيك 7-1" },
    { url: "/images/activities/الجدول الدوري/7-2.png", title: "انفوجرافيك 7-2" },
    { url: "/images/activities/الجدول الدوري/7-3.png", title: "انفوجرافيك 7-3" },
    { url: "/images/activities/الجدول الدوري/7-4.png", title: "انفوجرافيك 7-4" },
    { url: "/images/activities/الجدول الدوري/7-5.png", title: "انفوجرافيك 7-5" },
  ],
  "الأحماض والقواعد": [
    { url: "/images/activities/الأحماض والقواعد/7-1.png", title: "انفوجرافيك 7-1" },
    { url: "/images/activities/الأحماض والقواعد/7-2.png", title: "انفوجرافيك 7-2" },
    { url: "/images/activities/الأحماض والقواعد/7-3.png", title: "انفوجرافيك 7-3" },
  ],
};

export function getInfographicForLessonIndicator(
  lesson: string | undefined,
  indicatorIndex = 0,
): OutcomeInfographic | null {
  if (!lesson) return null;

  const list = INFOGRAPHICS_BY_LESSON[lesson];
  if (!list || list.length === 0) return null;

  return list[indicatorIndex] ?? list[0] ?? null;
}

export function getInfographicsForLesson(lesson: string | undefined): OutcomeInfographic[] {
  if (!lesson) return [];
  return INFOGRAPHICS_BY_LESSON[lesson] ?? [];
}
