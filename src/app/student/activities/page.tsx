"use client";

import { useState, useEffect } from "react";
import type { Activity } from "@/lib/activities";
import { ActivityCard } from "@/components/ui/activity-card";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch("/api/activities");
        const data = await response.json();
        const allActivities = data.activities || [];
        
        // Load shared activities from localStorage
        const saved = localStorage.getItem("sharedActivities");
        if (saved) {
          try {
            const sharedIds = JSON.parse(saved);
            const sharedSet = new Set(sharedIds);
            // Filter to show only shared activities
            setActivities(allActivities.filter((a) => sharedSet.has(a.id)));
          } catch (e) {
            console.error("Error loading shared activities", e);
            setActivities([]);
          }
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error("Error loading activities", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-slate-500">جاري تحميل الأنشطة...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <header className="card bg-gradient-to-br from-white to-primary-50">
        <p className="text-sm text-primary-600">أنشطتي العلاجية</p>
        <h1 className="text-3xl font-bold text-slate-900">
          خطتك الذكية للأسبوع الحالي
        </h1>
        <p className="mt-2 text-slate-600">
          أكملي الأنشطة بالترتيب المقترح وستلاحظين ارتفاعاً في مؤشر جاهزيتك
          بمعدل 15%.
        </p>
      </header>
      
      {activities.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">لا توجد أنشطة متاحة حالياً</h3>
          <p className="mt-2 text-slate-600">
            لم تقم معلمتك بمشاركة أي أنشطة بعد. تواصلي معها للحصول على الأنشطة.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id || activity.title}
              id={activity.id}
              title={activity.title}
              description={activity.description}
              duration={activity.duration}
              skill={activity.skill}
              type={activity.type}
              image={activity.image}
              targetLevel={activity.targetLevel}
            />
        ))}
      </div>
      )}
    </main>
  );
}

