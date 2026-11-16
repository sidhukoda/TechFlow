"use client";

import { useState } from "react";
import { MoreVertical, Check } from "lucide-react";

export function DashboardChecklistCard() {
  const [items, setItems] = useState([
    { id: 1, text: "Verify resolution on TF-2026-00421", done: true },
    { id: 2, text: "Roads Department assigned field team", done: true },
    { id: 3, text: "Review photograph evidence for water leak", done: false },
    { id: 4, text: "Provide feedback on completed repair", done: false },
    { id: 5, text: "Subscribe to sector alerts", done: false }
  ]);

  function toggle(id: number) {
    setItems(cur => cur.map(i => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  return (
    <div className="rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base text-[#0F1A2C]">Notes & Tasks</h3>
          <button type="button" className="text-slate-400 hover:text-slate-600">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="flex items-start gap-2.5 text-left w-full group"
            >
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                  item.done
                    ? "bg-[#1A6BFF] border-[#1A6BFF] text-white"
                    : "border-slate-300 group-hover:border-blue-500 bg-white"
                }`}
              >
                {item.done && <Check size={10} strokeWidth={3} />}
              </div>
              <span
                className={`text-xs transition leading-tight ${
                  item.done ? "text-slate-800 font-medium" : "text-slate-500"
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>{items.filter(i => i.done).length} of {items.length} completed</span>
        <button
          type="button"
          onClick={() => setItems(cur => cur.map(i => ({ ...i, done: true })))}
          className="text-blue-600 font-semibold hover:underline"
        >
          Check all
        </button>
      </div>
    </div>
  );
}
