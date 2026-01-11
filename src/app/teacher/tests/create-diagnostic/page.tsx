"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateDiagnosticTestPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/teacher/tests/create");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-600">جاري التوجيه...</p>
    </div>
  );
}
