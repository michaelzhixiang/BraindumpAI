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

  const getIntensityStyle = (count: number) => {
    if (count === 0) return { background: 'transparent' };
    if (count <= 2) return { background: 'var(--paper-active)' };
    if (count <= 5) return { background: 'var(--paper-mid)' };
    if (count <= 9) return { background: 'var(--paper-subtle)' };
    return { background: 'var(--paper-fg)' };
  };

  const getTextColorStyle = (count: number) => {
    if (count === 0) return { color: 'var(--paper-empty)' };
    if (count <= 9) return { color: 'var(--paper-muted)' };
    return { color: 'var(--paper-bg)' };
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const totalCompleted = Object.values(completedByDay).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(completedByDay).length;

  return (
    <div className="paper-card rounded-lg p-5 max-w-[600px] mx-auto" data-testid="monthly-streak">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-[0.6rem] uppercase tracking-[1.5px] font-medium" style={{ color: 'var(--paper-secondary)' }}>{t("streak.title")}</h2>
        <div className="flex items-center gap-3 font-mono text-[0.6rem]" style={{ color: 'var(--paper-secondary)' }}>
          <span>{totalCompleted} {t("streak.done")}</span>
          <span>{activeDays} {t("streak.daysActive")}</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs font-medium" style={{ color: 'var(--paper-muted)' }}>{monthName} {year}</span>
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="font-mono text-[0.6rem] text-center font-medium pb-1" style={{ color: 'var(--paper-subtle)' }}>{d}</div>
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
              className="aspect-square max-h-[72px] rounded-[6px] transition-colors flex items-center justify-center"
              style={isToday
                ? { background: 'var(--paper-today-bg)', color: 'var(--paper-today-fg)' }
                : { ...getIntensityStyle(count), ...getTextColorStyle(count) }
              }
              title={`${monthName} ${day}: ${count} ${count !== 1 ? t("streak.tasks") : t("streak.task")}`}
            >
              <span className="font-mono text-[0.65rem]">{day}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="font-mono text-[0.6rem]" style={{ color: 'var(--paper-subtle)' }}>{t("streak.less")}</span>
        {[0, 2, 5, 8, 10].map((n, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-[2px]"
            style={{
              ...getIntensityStyle(n),
              ...(n === 0 ? { border: '1px solid var(--paper-border)' } : {}),
            }}
          />
        ))}
        <span className="font-mono text-[0.6rem]" style={{ color: 'var(--paper-subtle)' }}>{t("streak.more")}</span>
      </div>
    </div>
  );
}
