"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { api } from "@/lib/client-api";
import { formatDate } from "@/lib/utils";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationList() {
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");

  async function load() {
    try {
      const result = await api<{ items: Notice[]; unread: number }>("/api/notifications");
      setItems(result.items);
      setUnread(result.unread);
      setError("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-changed", { detail: { unread: result.unread } }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications.");
    }
  }

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => clearInterval(timer);
  }, []);

  async function read(id: string) {
    try {
      await api(`/api/notifications/${id}/read`, { method: "PATCH" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notification as read.");
    }
  }

  async function readAll() {
    try {
      await api("/api/notifications/read-all", { method: "PATCH" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notifications as read.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Bell size={14} />
          </span>
          <span>
            <strong className="text-[#0F1A2C]">{unread}</strong> unread notification{unread === 1 ? "" : "s"}
          </span>
        </div>

        {unread > 0 && (
          <button
            type="button"
            onClick={readAll}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-card hover:bg-slate-50 transition"
          >
            <CheckCheck size={14} className="text-blue-600" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-card divide-y divide-[#EDF2F7]">
        {items.map(item => (
          <article
            key={item.id}
            className={`flex items-start gap-3.5 p-5 transition-colors hover:bg-[#F8FAFD] ${
              !item.readAt ? "bg-[#EEF4FE]/30" : ""
            }`}
          >
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                item.readAt
                  ? "bg-slate-100 text-slate-400"
                  : "bg-blue-100 text-blue-600 shadow-sm"
              }`}
            >
              {item.readAt ? <Check size={16} /> : <Bell size={16} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-xs text-[#0F1A2C]">{item.title}</p>
                <time className="text-[11px] font-mono text-slate-400">
                  {formatDate(item.createdAt)}
                </time>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.body}</p>

              <div className="mt-2.5 flex flex-wrap gap-4 text-xs font-bold">
                {item.href && (
                  <Link
                    className="text-blue-600 hover:underline"
                    href={item.href}
                    onClick={() => {
                      if (!item.readAt) void read(item.id);
                    }}
                  >
                    View details &rarr;
                  </Link>
                )}
                {!item.readAt && (
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-700"
                    onClick={() => void read(item.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}

        {!items.length && !error && (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={20} />
            </span>
            <p className="mt-3 font-bold text-sm text-[#0F1A2C]">All notifications read</p>
            <p className="mt-1 text-xs text-slate-400">
              New report status and assignment notifications will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
