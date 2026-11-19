"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";

export function MiniCalendarWidget() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const today = new Date();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isSameMonth = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

  const prevMonth = () => {
    setViewDate(curr => new Date(curr.getFullYear(), curr.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(curr => new Date(curr.getFullYear(), curr.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day of month (Monday = 0, Sunday = 6)
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  // Days in current & previous month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Leading days from previous month
  const leadingDays = [];
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    leadingDays.push({
      day: dayNum,
      date: new Date(year, month - 1, dayNum),
      isCurrentMonth: false
    });
  }

  // Days of current month
  const currentMonthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentMonthDays.push({
      day: d,
      date: new Date(year, month, d),
      isCurrentMonth: true
    });
  }

  // Trailing days from next month
  const totalCells = leadingDays.length + currentMonthDays.length > 35 ? 42 : 35;
  const trailingCount = totalCells - (leadingDays.length + currentMonthDays.length);
  const trailingDays = [];
  for (let t = 1; t <= trailingCount; t++) {
    trailingDays.push({
      day: t,
      date: new Date(year, month + 1, t),
      isCurrentMonth: false
    });
  }

  const allDays = [...leadingDays, ...currentMonthDays, ...trailingDays];

  const monthYearLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const selectedFormatted = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  const isCurrentMonthView = isSameMonth(viewDate, today);

  return (
    <div className="rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card">
      {/* Month & Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Schedule</p>
            {!isCurrentMonthView && (
              <button
                type="button"
                onClick={jumpToToday}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
          <h3 className="font-heading font-bold text-base text-[#0F1A2C] capitalize">
            {monthYearLabel}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
            aria-label="Next month"
            title="Next month"
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
        {allDays.map((item, idx) => {
          const isSelected = isSameDay(item.date, selectedDate);
          const isTodayDate = isSameDay(item.date, today);
          // Civic event markers on Tuesdays/Fridays and today
          const hasEvent = item.isCurrentMonth && (item.day % 7 === 2 || isTodayDate);

          return (
            <div key={idx} className="flex flex-col items-center justify-center py-0.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(item.date);
                  if (!item.isCurrentMonth) {
                    setViewDate(new Date(item.date.getFullYear(), item.date.getMonth(), 1));
                  }
                }}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-[#1A6BFF] text-white shadow-active font-bold"
                    : isTodayDate
                    ? "ring-2 ring-blue-500 font-bold text-blue-600 hover:bg-blue-50"
                    : item.isCurrentMonth
                    ? "text-[#0F1A2C] hover:bg-slate-100"
                    : "text-slate-300 hover:bg-slate-50"
                }`}
                title={item.date.toDateString()}
              >
                {item.day}
              </button>
              {/* Event indicator dot */}
              <div className="h-1 flex items-center justify-center mt-0.5">
                {hasEvent && !isSelected && (
                  <span className="h-1 w-1 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Day Quick Glance Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <CalendarIcon size={12} className="text-blue-600" />
          <span>{selectedFormatted}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Clock size={10} />
          <span>Operations Active</span>
        </div>
      </div>
    </div>
  );
}
