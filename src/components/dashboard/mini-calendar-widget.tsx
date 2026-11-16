"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MiniCalendarWidget() {
  const [selectedDay, setSelectedDay] = useState(12);

  const days = [
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, hasEvent: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true, hasEvent: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true, isToday: true, hasEvent: true },
    { day: 13, isCurrentMonth: true, hasEvent: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true, hasEvent: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true }
  ];

  return (
    <div className="rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card">
      {/* Month & Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">Schedule</p>
          <h3 className="font-heading font-bold text-base text-[#0F1A2C]">August, 2026</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {days.map((item, idx) => {
          const isSelected = item.isCurrentMonth && selectedDay === item.day;
          return (
            <div key={idx} className="flex flex-col items-center justify-center py-1">
              <button
                type="button"
                onClick={() => item.isCurrentMonth && setSelectedDay(item.day)}
                disabled={!item.isCurrentMonth}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full font-medium transition ${
                  isSelected
                    ? "bg-[#1A6BFF] text-white shadow-active font-bold"
                    : item.isCurrentMonth
                    ? "text-[#0F1A2C] hover:bg-slate-100"
                    : "text-slate-300 pointer-events-none"
                }`}
              >
                {item.day}
              </button>
              {/* Event indicator dot */}
              <div className="h-1 flex items-center justify-center mt-0.5">
                {item.hasEvent && !isSelected && (
                  <span className="h-1 w-1 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
