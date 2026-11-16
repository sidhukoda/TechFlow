"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Mail, UserRound, Phone, CheckCircle2, LogOut } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Profile = { name: string; email: string; phone: string | null; role: string };

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Profile>("/api/profile").then(setProfile).catch(e => setError(e.message));
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const result = await api<Profile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: data.get("name"), phone: data.get("phone") || null })
      });
      setProfile(result);
      setMessage("Your profile has been updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update your profile.");
    } finally {
      setBusy(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex max-w-2xl items-center gap-3 rounded-2xl border border-[#EDF2F7] bg-white p-6 text-xs text-slate-500 shadow-card">
        {error ? (
          <p role="alert" className="text-red-700">{error}</p>
        ) : (
          <>
            <Loader2 size={16} className="animate-spin text-blue-600" />
            <span>Loading profile credentials...</span>
          </>
        )}
      </div>
    );
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-2xl overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-card">
      {/* Top Banner with Avatar */}
      <div className="flex items-center gap-4 border-b border-[#EDF2F7] bg-[#F8FAFD] p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-600 shadow-sm">
          {initials || <UserRound size={22} />}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-[#0F1A2C]">{profile.name}</h2>
          <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
            {profile.role.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <form className="space-y-5 p-6" onSubmit={save}>
        <div>
          <h3 className="font-heading text-sm font-bold text-[#0F1A2C]">Personal Information</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Update your public civic identification and contact channels.
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={profile.name}
            required
            minLength={2}
            autoComplete="name"
            className="rounded-xl text-xs"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={profile.email}
              readOnly
              className="rounded-xl bg-slate-50 pl-10 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Contact an administrator if you require an official email change.
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
            Phone Number <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="relative">
            <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone || ""}
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className="rounded-xl pl-10 text-xs"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="rounded-xl border border-emerald-100 bg-[#EDFAF1] p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{message}</span>
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-bold text-xs flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Log out</span>
          </Button>

          <Button
            disabled={busy}
            type="submit"
            className="rounded-xl bg-[#0A1120] text-white hover:bg-[#162238] font-bold text-xs"
          >
            {busy && <Loader2 size={14} className="animate-spin mr-1.5" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
