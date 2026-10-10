"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveAuthReturnTo } from "@/shared/lib/urls/authRoutes";

type Mode = "login" | "signup" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(() => params.get("email") || "");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const title = { login: "ورود", signup: "ساخت حساب", forgot: "بازیابی رمز عبور", reset: "تعیین رمز جدید" }[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const endpoint = mode === "signup" ? "signup" :
        mode === "forgot" ? "reset/request" : mode === "reset" ? "reset/confirm" : "login";
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code, inviteCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "درخواست انجام نشد.");
      if (mode === "signup" && Array.isArray(data.recoveryCodes)) {
        setRecoveryCodes(data.recoveryCodes);
      } else if (mode === "forgot") {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        const requested = params.get("returnTo");
        window.location.assign(requested ? resolveAuthReturnTo(requested) : "/agent/setup");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "درخواست انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  if (recoveryCodes) return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-4">
    <section className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">کدهای بازیابی حساب</h1>
      <p className="text-sm">این کدها فقط یک‌بار نمایش داده می‌شوند. آن‌ها را در جای امن ذخیره کنید. هر کد فقط یک‌بار برای بازنشانی رمز عبور قابل استفاده است.</p>
      <div dir="ltr" className="grid grid-cols-2 gap-2 rounded-md bg-muted p-4 font-mono text-sm">
        {recoveryCodes.map(code => <code key={code}>{code}</code>)}
      </div>
      <button type="button" onClick={() => { void navigator.clipboard.writeText(recoveryCodes.join("\n")); }}
        className="w-full rounded-md border p-3">کپی کدها</button>
      <button type="button" onClick={() => { window.location.assign("/agent/setup"); }}
        className="w-full rounded-md bg-primary p-3 text-primary-foreground">کدها را ذخیره کردم</button>
    </section>
  </main>;

  return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-4">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {mode === "signup" && <p className="text-sm text-muted-foreground">ثبت‌نام فقط برای ایمیل‌های مجاز و با کد دعوت مسئول سامانه امکان‌پذیر است.</p>}
      {mode === "reset" && <p className="text-sm text-muted-foreground">اگر این ایمیل حسابی داشته باشد، کد بازیابی به آن فرستاده شده است.</p>}
      {mode === "forgot" && <Link href="/reset-password" className="text-sm underline">کد بازیابی ذخیره‌شده دارم</Link>}
      <label className="block space-y-2 text-sm">ایمیل
        <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}
          className="w-full rounded-md border bg-background p-3" />
      </label>
      {(mode === "login" || mode === "signup" || mode === "reset") &&
        <label className="block space-y-2 text-sm">رمز عبور {mode !== "login" && "(حداقل ۱۲ نویسه)"}
          <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
            required minLength={mode === "login" ? undefined : 12} value={password}
            onChange={event => setPassword(event.target.value)} className="w-full rounded-md border bg-background p-3" />
        </label>}
      {mode === "signup" && <label className="block space-y-2 text-sm">کد دعوت خصوصی
        <input type="password" autoComplete="off" required value={inviteCode} onChange={event => setInviteCode(event.target.value)}
          className="w-full rounded-md border bg-background p-3" />
      </label>}
      {mode === "reset" &&
        <label className="block space-y-2 text-sm">کد ایمیل یا کد بازیابی ذخیره‌شده
          <input pattern="([0-9]{8}|[A-Za-z0-9_-]{16})" required value={code} onChange={event => setCode(event.target.value)}
            className="w-full rounded-md border bg-background p-3" />
        </label>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-md bg-primary p-3 text-primary-foreground disabled:opacity-50">
        {pending ? "لطفاً صبر کنید…" : title}
      </button>
      <div className="flex justify-between text-sm underline"><Link href="/login">ورود</Link><Link href="/signup">ثبت‌نام</Link><Link href="/forgot-password">فراموشی رمز</Link></div>
    </form>
  </main>;
}
