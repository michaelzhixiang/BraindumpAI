import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Loader2, Plus, Inbox } from "lucide-react";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useUserState, useUpdateUserState } from "@/hooks/use-user-state";
import { useGenerateNudge } from "@/hooks/use-ai";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";
import { MonthlyStreak } from "@/components/MonthlyStreak";

export default function Today() {
  const { data: tasks, isLoading } = useTasks();
  const { data: userState } = useUserState();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateUserState } = useUpdateUserState();
  const { mutateAsync: generateNudge } = useGenerateNudge();
  const { toast } = useToast();
  const { t } = useI18n();
  const [, setLocation] = useLocation();

  const [activeNudgeId, setActiveNudgeId] = useState<number | null>(null);
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());

  const focusTasks = tasks?.filter(t => t.tier === "focus" && t.status === "pending" && !t.parentId) || [];
  const completedToday = tasks?.filter(t => 
    t.status === "completed" && 
    t.completedAt && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ) || [];
  const waitingTasks = tasks?.filter(t => t.status === "pending" && (t.tier === "backlog" || t.tier === "icebox")) || [];

  const allDone = focusTasks.length === 0 && completedToday.length > 0;

  const handleComplete = (id: number) => {
    setCompletingIds(prev => new Set(prev).add(id));

    setTimeout(() => {
      updateTask({ id, status: "completed", completedAt: new Date().toISOString() });
      updateUserState({ screenTimeMinutes: (userState?.screenTimeMinutes || 0) + 10 });
      
      toast({
        title: t("today.earnedToast"),
        description: t("today.earnedDesc"),
      });

      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  };

  const handleNudge = async (id: number) => {
    setActiveNudgeId(id);
    try {
      await generateNudge(id);
    } catch (e) {
      toast({ title: "Failed to generate nudge", variant: "destructive" });
    } finally {
      setActiveNudgeId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--paper-secondary)' }} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-8" data-testid="today-page">
      <MonthlyStreak tasks={tasks || []} />

      <div className="rounded-lg p-5 relative fade-up" style={{ border: '1px dashed var(--paper-border)', background: 'var(--paper-card-bg)' }} data-testid="guilt-free-card">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[1.5px] mb-1" style={{ color: 'var(--paper-secondary)' }}>{t("today.guiltFreeTime")}</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-[2rem] font-heading font-bold tracking-tighter" style={{ color: 'var(--paper-fg)' }} data-testid="text-screen-time">
            {userState?.screenTimeMinutes || 0}
          </span>
          <span className="font-mono text-[0.65rem]" style={{ color: 'var(--paper-secondary)' }}>{t("today.min")}</span>
        </div>
        <div className="mt-3 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--paper-track)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ background: 'var(--paper-fg)', width: `${Math.min(100, ((userState?.screenTimeMinutes || 0) / 120) * 100)}%` }}
          />
        </div>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5"
        >
          <div className="text-center py-6 space-y-2">
            <div className="text-3xl font-heading font-bold" style={{ color: 'var(--paper-fg)' }}>{t("today.allDone")}</div>
            <p className="text-sm" style={{ color: 'var(--paper-secondary)' }}>
              {t("today.youEarned")} {completedToday.length * 10} {t("today.earned")}
            </p>
          </div>

          {waitingTasks.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[1.5px] font-medium" style={{ color: 'var(--paper-secondary)' }}>
                {t("today.pickTasks")}
              </p>
              <div className="space-y-1.5">
                {waitingTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskIds(prev => {
                        const next = new Set(prev);
                        if (next.has(task.id)) next.delete(task.id);
                        else next.add(task.id);
                        return next;
                      });
                    }}
                    className="w-full text-left paper-card p-3 rounded-lg flex items-center gap-3 transition-all duration-150"
                    style={selectedTaskIds.has(task.id) ? { borderColor: 'var(--paper-fg)' } : undefined}
                    data-testid={`button-pick-task-${task.id}`}
                  >
                    <div
                      className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                      style={selectedTaskIds.has(task.id)
                        ? { borderColor: 'var(--paper-fg)', background: 'var(--paper-fg)' }
                        : { borderColor: 'var(--paper-tertiary)' }
                      }
                    >
                      {selectedTaskIds.has(task.id) && (
                        <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--paper-bg)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[1.05rem] font-normal leading-[1.45] truncate" style={{ color: 'var(--paper-fg)' }}>{task.content}</p>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[1px]" style={{ color: 'var(--paper-subtle)' }}>
                        {task.tier === "backlog" ? t("queue.backlog") : t("queue.icebox")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                if (selectedTaskIds.size > 0) {
                  selectedTaskIds.forEach(id => {
                    updateTask({ id, tier: "focus" });
                  });
                  setSelectedTaskIds(new Set());
                  toast({ title: `${selectedTaskIds.size} ${selectedTaskIds.size === 1 ? "task" : "tasks"} moved to Focus` });
                } else {
                  setLocation("/queue");
                }
              }}
              className="font-mono text-[0.6rem] uppercase font-medium tracking-[1px] paper-btn px-5 py-2.5 rounded-lg flex items-center gap-1.5"
              data-testid="button-view-queue"
            >
              <Plus className="w-3 h-3" />
              {selectedTaskIds.size > 0
                ? `${t("today.focus")} (${selectedTaskIds.size})`
                : t("today.viewQueue")}
            </button>
            <button
              onClick={() => setLocation("/dump")}
              className="font-mono text-[0.6rem] uppercase font-medium tracking-[1px] paper-card px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors"
              style={{ color: 'var(--paper-secondary)' }}
              data-testid="button-dump-more"
            >
              <Inbox className="w-3 h-3" />
              {t("today.addMore")}
            </button>
          </div>
        </motion.div>
      )}

      {!allDone && (
        <div className="fade-up">
          <h3 className="font-mono text-[0.6rem] font-medium mb-4 flex items-center gap-2 uppercase tracking-[1.5px]" style={{ color: 'var(--paper-secondary)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--paper-fg)' }}></span>
            {t("today.focus")}
          </h3>
          
          <div className="space-y-0">
            {focusTasks.length === 0 ? (
              <div
                className="text-center py-12 rounded-lg border border-dashed cursor-pointer transition-colors font-body italic"
                style={{ color: 'var(--paper-subtle)', fontSize: '0.9rem', borderColor: 'var(--paper-border)', background: 'var(--paper-card-bg)' }}
                onClick={() => setLocation("/dump")}
                data-testid="button-go-to-dump"
              >
                {t("today.noFocus")}
              </div>
            ) : (
              <AnimatePresence>
                {focusTasks.map((task) => {
                  const isCompleting = completingIds.has(task.id);
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div
                        className={`py-4 transition-all duration-300 ${isCompleting ? "opacity-50" : ""}`}
                        style={{ borderBottom: '1px solid var(--paper-separator)' }}
                        data-testid={`task-focus-${task.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => handleComplete(task.id)}
                            disabled={isCompleting}
                            className="mt-0.5 shrink-0 transition-colors"
                            data-testid={`button-complete-${task.id}`}
                          >
                            {isCompleting ? (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ background: 'var(--paper-fg)' }}>
                                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--paper-bg)' }} />
                                </div>
                              </motion.div>
                            ) : (
                              <div className="w-[22px] h-[22px] rounded-full border-2" style={{ borderColor: 'var(--paper-tertiary)' }} />
                            )}
                          </button>
                          
                          <div className="flex-1 space-y-2.5 min-w-0">
                            <p
                              className={`text-[1.05rem] font-normal leading-[1.45] transition-all duration-300 ${isCompleting ? "line-through" : ""}`}
                              style={isCompleting
                                ? { color: 'var(--paper-subtle)', textDecorationColor: 'var(--paper-tertiary)' }
                                : { color: 'var(--paper-fg)' }
                              }
                            >
                              {task.content}
                            </p>
                            
                            {task.nudge && (
                              <div className="text-sm p-2.5 rounded-lg" style={{ background: 'var(--paper-hover)', color: 'var(--paper-muted)', borderLeft: '2px solid var(--paper-fg)' }}>
                                <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[1px] mr-1" style={{ color: 'var(--paper-secondary)' }}>{t("today.microStep")}</span> 
                                {task.nudge}
                              </div>
                            )}
                            
                            {!isCompleting && (
                              <div className="flex gap-2 pt-0.5 flex-wrap">
                                <button 
                                  onClick={() => handleNudge(task.id)}
                                  disabled={activeNudgeId === task.id}
                                  data-testid={`button-nudge-${task.id}`}
                                  className="font-mono text-[0.6rem] uppercase font-medium tracking-[1px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
                                  style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-muted)' }}
                                >
                                  {activeNudgeId === task.id ? <Zap className="w-3 h-3 animate-pulse" style={{ color: 'var(--paper-fg)' }} /> : <Zap className="w-3 h-3" />}
                                  {t("today.nudgeMe")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {completedToday.length > 0 && !allDone && (
        <div className="opacity-50 hover:opacity-80 transition-opacity duration-300 fade-up">
          <h4 className="font-mono text-[0.6rem] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--paper-secondary)' }}>{t("today.completedToday")}</h4>
          <div className="space-y-2">
             {completedToday.map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm line-through" style={{ color: 'var(--paper-subtle)', textDecorationColor: 'var(--paper-tertiary)' }}>
                 <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--paper-fg)' }}>
                   <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--paper-bg)' }} />
                 </div>
                 <span className="truncate">{task.content}</span>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
