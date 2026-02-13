/**
 * بيانات أنواع البراكين - لعبة بركانك الصحيح
 * متوافقة مع مؤشرات نافس: يعدد أشكال البراكين، يعرف كلًا منها، يميز بينها، يذكر مثالًا على كل نوع
 */
import type { VolcanoTypeData } from "@/types/games"

export const VOLCANO_TYPES: VolcanoTypeData[] = [
  {
    id: "shield",
    name_ar: "درعي",
    definition: "بركان عريض القاعدة ومنحدرات لطيفة، يتكون من تدفق حمم بازلتية سائلة متكررة.",
    characteristics: [
      "قاعدة عريضة جداً",
      "منحدرات لطيفة",
      "حمم بازلتية سائلة",
      "ثورانات هادئة نسبياً",
    ],
    example_name: "ماونا لوا",
    example_location: "هاواي، الولايات المتحدة",
    difficulty: "easy",
    level: "standard",
    imagePath: "/images/activities/انواع البراكين/بركان درعي.gif",
    matchCharacteristic: "تدفقات لابة سائلة",
  },
  {
    id: "cinder_cone",
    name_ar: "مخروطي",
    definition: "بركان صغير مخروطي الشكل، يتكون من رماد وقطع صخرية ملقاة حول الفوهة.",
    characteristics: [
      "شكل مخروطي حاد",
      "حجم صغير نسبياً",
      "رماد وقطع صخرية",
      "ثورانات قصيرة",
    ],
    example_name: "جبل سانت هيلين",
    example_location: "ولاية واشنطن، الولايات المتحدة",
    difficulty: "medium",
    level: "standard",
    imagePath: "/images/activities/انواع البراكين/بركان مخروطي.gif",
    matchCharacteristic: "انفجارات عنيفة",
  },
  {
    id: "composite",
    name_ar: "مركب",
    definition: "بركان مرتفع مخروطي يتكون من طبقات متناوبة من الحمم والرماد، وثورانات متفجرة.",
    characteristics: [
      "طبقات من الحمم والرماد",
      "ثورانات متفجرة",
      "قمم مرتفعة",
      "حمم لزجة",
    ],
    example_name: "جبل فيزوف",
    example_location: "إيطاليا",
    difficulty: "medium",
    level: "standard",
    imagePath: "/images/activities/انواع البراكين/بركان مركب.gif",
    matchCharacteristic: "طبقات من الرماد واللابة",
  },
  {
    id: "fissure",
    name_ar: "ثوران الشقوق",
    definition: "ثوران من شقوق طويلة في القشرة الأرضية، ينتج عنه فيضانات حمم واسعة.",
    characteristics: [
      "ثوران من شقوق طويلة",
      "فيضانات حمم واسعة",
      "لا توجد قمة مركزية",
      "مناطق بركانية ممتدة",
    ],
    example_name: "شقوق آيسلندا",
    example_location: "آيسلندا",
    difficulty: "hard",
    level: "advanced",
    imagePath: "/images/activities/انواع البراكين/ثوران الشقوق.gif",
    matchCharacteristic: "خروج الحمم من شقوق طويلة",
  },
]
