"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveAuthReturnTo } from "@/shared/lib/urls/authRoutes";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => params.get("email") || "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const title = mode === "signup" ? "ساخت حساب" : "ورود";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "درخواست انجام نشد.");
      const requested = params.get("returnTo");
      window.location.assign(requested ? resolveAuthReturnTo(requested) : "/agent/setup");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "درخواست انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-4">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {mode === "signup" && <label className="block space-y-2 text-sm">نام
        <input type="text" autoComplete="name" required maxLength={120} value={name}
          onChange={event => setName(event.target.value)} className="w-full rounded-md border bg-background p-3" />
      </label>}
      <label className="block space-y-2 text-sm">ایمیل
        <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}
          className="w-full rounded-md border bg-background p-3" />
      </label>
      <label className="block space-y-2 text-sm">رمز عبور {mode === "signup" && "(حداقل ۱۲ نویسه)"}
        <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
          required minLength={mode === "login" ? undefined : 12} value={password}
          onChange={event => setPassword(event.target.value)} className="w-full rounded-md border bg-background p-3" />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-md bg-primary p-3 text-primary-foreground disabled:opacity-50">
        {pending ? "لطفاً صبر کنید…" : title}
      </button>
      <div className="flex justify-between text-sm underline"><Link href="/login">ورود</Link><Link href="/signup">ثبت‌نام</Link></div>
    </form>
  </main>;
}
