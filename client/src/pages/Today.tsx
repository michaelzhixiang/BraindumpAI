import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Clock, Loader2, Plus, Inbox } from "lucide-react";
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
        <Loader2 className="w-6 h-6 animate-spin text-[#9e9484]" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-8" data-testid="today-page">
      <MonthlyStreak tasks={tasks || []} />

      <div className="paper-card rounded-lg p-5 relative fade-up" data-testid="guilt-free-card">
        <div className="absolute top-4 right-4 opacity-[0.06]">
          <Clock className="w-16 h-16" />
        </div>
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[1.5px] text-[#9e9484] mb-1">{t("today.guiltFreeTime")}</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-[2rem] font-serif font-bold text-[#2b2520] tracking-tighter" data-testid="text-screen-time">
            {userState?.screenTimeMinutes || 0}
          </span>
          <span className="font-mono text-[0.65rem] text-[#9e9484]">{t("today.min")}</span>
        </div>
        <div className="mt-3 h-[3px] bg-[#e0d8cc] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2b2520] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((userState?.screenTimeMinutes || 0) / 120) * 100)}%` }}
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
            <div className="text-3xl font-serif font-bold text-[#2b2520]">{t("today.allDone")}</div>
            <p className="text-[#9e9484] text-sm">
              {t("today.youEarned")} {completedToday.length * 10} {t("today.earned")}
            </p>
          </div>

          {waitingTasks.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[1.5px] font-medium text-[#9e9484]">
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
                    className={`w-full text-left paper-card p-3 rounded-lg flex items-center gap-3 transition-all duration-150 ${
                      selectedTaskIds.has(task.id)
                        ? "border-[#2b2520]"
                        : "hover:bg-[#efe8dd]"
                    }`}
                    data-testid={`button-pick-task-${task.id}`}
                  >
                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selectedTaskIds.has(task.id)
                        ? "border-[#2b2520] bg-[#2b2520]"
                        : "border-[#c5baa8]"
                    }`}>
                      {selectedTaskIds.has(task.id) && (
                        <CheckCircle2 className="w-4 h-4 text-[#f6f1eb]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[1.05rem] font-normal text-[#2b2520] leading-[1.45] truncate">{task.content}</p>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[1px] text-[#b5a998]">
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
              className="font-mono text-[0.6rem] uppercase font-medium tracking-[1px] paper-card px-4 py-2.5 rounded-lg text-[#9e9484] flex items-center gap-1.5 hover:text-[#2b2520] transition-colors"
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
          <h3 className="font-mono text-[0.6rem] font-medium mb-4 flex items-center gap-2 uppercase tracking-[1.5px] text-[#9e9484]">
            <span className="w-1.5 h-1.5 bg-[#2b2520] rounded-full"></span>
            {t("today.focus")}
          </h3>
          
          <div className="space-y-0">
            {focusTasks.length === 0 ? (
              <div
                className="text-center py-12 text-[#c5baa8] text-sm paper-card rounded-lg border-dashed cursor-pointer hover:bg-[#efe8dd] transition-colors"
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
                        className={`py-4 border-b border-[#e8e0d4] transition-all duration-300 ${isCompleting ? "opacity-50" : ""}`}
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
                                <div className="w-[22px] h-[22px] rounded-full bg-[#2b2520] flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-[#f6f1eb]" />
                                </div>
                              </motion.div>
                            ) : (
                              <div className="w-[22px] h-[22px] rounded-full border-2 border-[#c5baa8]" />
                            )}
                          </button>
                          
                          <div className="flex-1 space-y-2.5 min-w-0">
                            <p className={`text-[1.05rem] font-normal leading-[1.45] transition-all duration-300 ${isCompleting ? "line-through text-[#b5a998]" : "text-[#2b2520]"}`}
                              style={isCompleting ? { textDecorationColor: '#c5baa8' } : undefined}
                            >
                              {task.content}
                            </p>
                            
                            {task.nudge && (
                              <div className="text-sm bg-[#efe8dd] p-2.5 rounded-lg text-[#5c4f3d] border-l-2 border-[#2b2520]">
                                <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[1px] text-[#9e9484] mr-1">{t("today.microStep")}</span> 
                                {task.nudge}
                              </div>
                            )}
                            
                            {!isCompleting && (
                              <div className="flex gap-2 pt-0.5 flex-wrap">
                                <button 
                                  onClick={() => handleNudge(task.id)}
                                  disabled={activeNudgeId === task.id}
                                  data-testid={`button-nudge-${task.id}`}
                                  className="font-mono text-[0.6rem] uppercase font-medium tracking-[1px] border border-[#ddd5c8] hover:bg-[#efe8dd] px-3 py-1.5 rounded-lg text-[#5c4f3d] flex items-center gap-1.5 transition-colors disabled:opacity-40"
                                >
                                  {activeNudgeId === task.id ? <Zap className="w-3 h-3 animate-pulse text-[#2b2520]" /> : <Zap className="w-3 h-3" />}
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
          <h4 className="font-mono text-[0.6rem] font-medium uppercase tracking-[1.5px] mb-3 text-[#9e9484]">{t("today.completedToday")}</h4>
          <div className="space-y-2">
             {completedToday.map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm line-through text-[#b5a998]" style={{ textDecorationColor: '#c5baa8' }}>
                 <div className="w-4 h-4 rounded-full bg-[#2b2520] flex items-center justify-center shrink-0">
                   <CheckCircle2 className="w-3 h-3 text-[#f6f1eb]" />
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
