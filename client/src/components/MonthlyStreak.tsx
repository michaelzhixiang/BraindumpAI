import { useMemo } from "react";
import type { Task } from "@shared/schema";

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function MonthlyStreak({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = getMonthDays(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = now.getDate();

  const monthName = now.toLocaleString('default', { month: 'long' });

  const completedByDay = useMemo(() => {
    const map: Record<number, number> = {};
    tasks.forEach(t => {
      if (t.status === "completed" && t.completedAt) {
        const d = new Date(t.completedAt);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          map[day] = (map[day] || 0) + 1;
        }
      }
    });
    return map;
  }, [tasks, year, month]);

  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-white/[0.03]";
    if (count <= 2) return "bg-white/[0.12]";
    if (count <= 5) return "bg-white/[0.25]";
    if (count <= 9) return "bg-white/[0.45]";
    return "bg-white/[0.85]";
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const totalCompleted = Object.values(completedByDay).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(completedByDay).length;

  return (
    <div className="glass-card rounded-2xl p-5 halo-glow" data-testid="monthly-streak">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Monthly Streak</h2>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{totalCompleted} done</span>
          <span>{activeDays} days active</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs font-medium text-foreground/60">{monthName} {year}</span>
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-[8px] text-center text-muted-foreground/40 font-medium pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const count = completedByDay[day] || 0;
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`aspect-square rounded-[3px] transition-colors ${getIntensity(count)} ${
                isToday ? "ring-1 ring-[hsl(var(--primary))]/40" : ""
              }`}
              title={`${monthName} ${day}: ${count} task${count !== 1 ? 's' : ''}`}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[8px] text-muted-foreground/40">Less</span>
        {[0, 2, 5, 8, 10].map((n, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${getIntensity(n)}`} />
        ))}
        <span className="text-[8px] text-muted-foreground/40">More</span>
      </div>
    </div>
  );
}
