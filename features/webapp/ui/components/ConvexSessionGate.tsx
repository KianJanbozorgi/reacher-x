"use client";

import { type ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { useAuth as useLocalAuth } from "@/shared/lib/localAuth/client";

/** Mount protected workspace queries only after Convex has accepted the JWT. */
export function ConvexSessionGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useLocalAuth();

  if (isAuthenticated) return <>{children}</>;
  if (isLoading) return <main dir="rtl" className="flex min-h-screen items-center justify-center p-6 text-center">
    <p role="status">در حال اتصال به حساب کاربری…</p>
  </main>;

  return <main dir="rtl" className="flex min-h-screen items-center justify-center p-6">
    <section className="max-w-md space-y-4 rounded-xl border bg-card p-6 text-center">
      <h1 className="text-xl font-semibold">اتصال به حساب کاربری برقرار نشد</h1>
      <p className="text-sm text-muted-foreground">
        {user
          ? "نشست شما در برنامه فعال است، اما سرور داده هویت شما را نپذیرفت. تنظیمات Convex و کلید عمومی احراز هویت را بررسی کنید."
          : "برای ادامه وارد حساب خود شوید."}
      </p>
      <div className="flex justify-center gap-4 text-sm underline">
        <a href="/login">ورود دوباره</a>
        <a href="/logout">خروج</a>
      </div>
    </section>
  </main>;
}
