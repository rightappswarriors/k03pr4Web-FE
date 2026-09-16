"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
  value: string; // "yyyy-MM-dd"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  className?: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseValue(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildGrid(viewMonth: Date): Date[] {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  className = "",
}: DatePickerProps) {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(selected ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) setViewMonth(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const today = startOfDay(new Date());
  const grid = buildGrid(viewMonth);
  const min = minDate ? startOfDay(minDate) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
            : open
              ? "border-[#287c72] bg-white text-slate-800 ring-2 ring-[#287c72]/20"
              : "border-slate-200 bg-white text-slate-800 hover:border-[#287c72]"
        }`}
      >
        <span className={selected ? "" : "text-slate-400"}>
          {selected
            ? selected.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
            : placeholder}
        </span>
        <Calendar className="size-4 shrink-0 text-slate-400" />
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold text-slate-800">
              {viewMonth.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-xs font-medium text-slate-400">
                {w}
              </span>
            ))}
            {grid.map((day) => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const isSelected = selected && startOfDay(day).getTime() === startOfDay(selected).getTime();
              const isToday = startOfDay(day).getTime() === today.getTime();
              const isDisabled = min ? startOfDay(day) < min : false;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(toValue(day));
                    setOpen(false);
                  }}
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-[#287c72] font-semibold text-white hover:bg-[#23685f]"
                      : isDisabled
                        ? "cursor-not-allowed text-slate-300"
                        : inMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-50"
                  } ${isToday && !isSelected ? "font-semibold text-[#287c72]" : ""}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(toValue(today));
                setViewMonth(today);
                setOpen(false);
              }}
              className="cursor-pointer text-xs font-semibold text-[#287c72] hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-xs font-semibold text-slate-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}