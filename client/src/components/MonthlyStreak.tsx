import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import type { Task } from "@shared/schema";

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function MonthlyStreak({ tasks }: { tasks: Task[] }) {
  const { t } = useI18n();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = getMonthDays(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = now.getDate();

  const monthName = now.toLocaleString('default', { month: 'long' });

  const completedByDay = useMemo(() => {
    const map: Record<number, number> = {};
    tasks.forEach(task => {
      if (task.status === "completed" && task.completedAt) {
        const d = new Date(task.completedAt);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          map[day] = (map[day] || 0) + 1;
        }
      }
    });
    return map;
  }, [tasks, year, month]);

  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-transparent";
    if (count <= 2) return "bg-[#e8dfd3]";
    if (count <= 5) return "bg-[#d5cabb]";
    if (count <= 9) return "bg-[#b5a998]";
    return "bg-[#2b2520]";
  };

  const getTextColor = (count: number): string => {
    if (count === 0) return "text-[#ccc3b5]";
    if (count <= 9) return "text-[#5c4f3d]";
    return "text-[#f6f1eb]";
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const totalCompleted = Object.values(completedByDay).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(completedByDay).length;

  return (
    <div className="paper-card rounded-lg p-5 max-w-[600px] mx-auto" data-testid="monthly-streak">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-[0.6rem] uppercase tracking-[1.5px] font-medium text-[#9e9484]">{t("streak.title")}</h2>
        <div className="flex items-center gap-3 font-mono text-[0.6rem] text-[#9e9484]">
          <span>{totalCompleted} {t("streak.done")}</span>
          <span>{activeDays} {t("streak.daysActive")}</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs font-medium text-[#5c4f3d]">{monthName} {year}</span>
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="font-mono text-[0.6rem] text-center text-[#b5a998] font-medium pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square max-h-[72px]" />;
          }
          const count = completedByDay[day] || 0;
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`aspect-square max-h-[72px] rounded-[6px] transition-colors flex items-center justify-center ${
                isToday
                  ? "bg-[#2b2520] text-[#f6f1eb]"
                  : `${getIntensity(count)} ${getTextColor(count)}`
              }`}
              title={`${monthName} ${day}: ${count} ${count !== 1 ? t("streak.tasks") : t("streak.task")}`}
            >
              <span className="font-mono text-[0.65rem]">{day}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="font-mono text-[0.6rem] text-[#b5a998]">{t("streak.less")}</span>
        {[0, 2, 5, 8, 10].map((n, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${n === 0 ? "border border-[#ddd5c8]" : ""} ${getIntensity(n)}`} />
        ))}
        <span className="font-mono text-[0.6rem] text-[#b5a998]">{t("streak.more")}</span>
      </div>
    </div>
  );
}
