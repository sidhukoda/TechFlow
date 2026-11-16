"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound, ArrowRight } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    try {
      if ((mode === "register" || mode === "reset") && data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (mode === "login") {
        const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
        if (result?.error) throw new Error("Invalid email or password");
        const user = await api<{ role: string }>("/api/auth/me");
        router.push(user.role === "CITIZEN" ? "/citizen/dashboard" : user.role === "FIELD_WORKER" ? "/worker/dashboard" : "/admin/dashboard");
        router.refresh();
      } else if (mode === "register") {
        await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: data.name, email: data.email, password: data.password }) });
        const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
        if (result?.error) {
          router.push("/login");
          return;
        }
        router.push("/citizen/dashboard");
        router.refresh();
      } else if (mode === "forgot") {
        const result = await api<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(data) });
        setMessage(result.message);
      } else {
        const token = new URLSearchParams(window.location.search).get("token");
        await api("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password: data.password }) });
        router.push("/login");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const title = {
    login: "Welcome Back",
    register: "Create Account",
    forgot: "Reset Password",
    reset: "Set New Password"
  }[mode];

  const description = {
    login: "Sign in to access your reports, tasks, and civic dashboard.",
    register: "Join your community and report municipal infrastructure issues.",
    forgot: "Enter your registered email and we will send a password reset link.",
    reset: "Choose a secure password for your TechFlow account."
  }[mode];

  function passwordField(id: string, label: string, name: string, minLength: number) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor={id} className="text-xs font-bold text-slate-700">
            {label}
          </label>
          {mode === "login" && (
            <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Input
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            required
            minLength={minLength}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="rounded-xl h-11 pr-11 text-xs px-3.5"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(value => !value)}
            className="absolute inset-y-0 right-1 inline-flex w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {mode !== "login" && (
          <p className="mt-1 text-[11px] text-slate-400">Must be at least 12 characters.</p>
        )}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-[#EDF2F7] bg-white p-7 sm:p-9 shadow-card">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
        {mode === "register" ? (
          <UserRound size={20} />
        ) : mode === "forgot" || mode === "reset" ? (
          <LockKeyhole size={20} />
        ) : (
          <Mail size={20} />
        )}
      </div>

      <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C]">
        {title}
      </h1>
      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
        {description}
      </p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              className="rounded-xl h-11 text-xs px-3.5"
            />
          </div>
        )}

        {mode !== "reset" && (
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. name@example.com"
              className="rounded-xl h-11 text-xs px-3.5"
            />
          </div>
        )}

        {mode !== "forgot" && passwordField("password", "Password", "password", mode === "login" ? 1 : 12)}
        {(mode === "register" || mode === "reset") &&
          passwordField("confirmPassword", "Confirm Password", "confirmPassword", 12)}

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="rounded-xl border border-emerald-100 bg-[#EDFAF1] p-3 text-xs font-semibold text-emerald-800">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#0A1120] text-xs font-bold text-white shadow-sm transition hover:bg-[#162238] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          disabled={busy}
        >
          {busy && <Loader2 className="animate-spin" size={15} />}
          <span>
            {mode === "login"
              ? "Sign In with Email"
              : mode === "register"
              ? "Create Account with Email"
              : mode === "forgot"
              ? "Send Reset Link"
              : "Update Password"}
          </span>
        </button>
      </form>

      {/* Google OAuth One-Click Authentication */}
      {(mode === "login" || mode === "register") && (
        <div className="mt-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/citizen/dashboard" })}
            disabled={busy}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white text-xs font-bold text-slate-700 shadow-card hover:bg-slate-50 hover:border-slate-300 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        {mode === "login" ? (
          <>
            New to TechFlow?{" "}
            <Link className="font-bold text-blue-600 hover:underline" href="/register">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className="font-bold text-blue-600 hover:underline" href="/login">
              Sign In
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
