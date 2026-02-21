import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Clock, Loader2, ArrowRight, Inbox } from "lucide-react";
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

  const focusTasks = tasks?.filter(t => t.tier === "focus" && t.status === "pending" && !t.parentId) || [];
  const completedToday = tasks?.filter(t => 
    t.status === "completed" && 
    t.completedAt && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ) || [];

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
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 pb-32" data-testid="today-page">
      <MonthlyStreak tasks={tasks || []} />

      <div className="glass-card rounded-2xl p-5 relative halo-ambient neon-border-subtle" data-testid="guilt-free-card">
        <div className="absolute top-4 right-4 opacity-[0.06]">
          <Clock className="w-16 h-16" />
        </div>
        <h2 className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1">{t("today.guiltFreeTime")}</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-semibold text-foreground tracking-tighter" data-testid="text-screen-time">
            {userState?.screenTimeMinutes || 0}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{t("today.min")}</span>
        </div>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-4"
        >
          <div className="text-3xl font-semibold">{t("today.allDone")}</div>
          <p className="text-muted-foreground text-sm">
            {t("today.youEarned")} {completedToday.length * 10} {t("today.earned")}
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            {t("today.checkLowerPriority")}
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={() => setLocation("/queue")}
              className="text-[10px] uppercase font-bold tracking-wider glass-card px-4 py-2 rounded-lg text-foreground/70 flex items-center gap-1.5 neon-border-subtle"
              data-testid="button-view-queue"
            >
              <ArrowRight className="w-3 h-3" />
              {t("today.viewQueue")}
            </button>
            <button
              onClick={() => setLocation("/dump")}
              className="text-[10px] uppercase font-bold tracking-wider bg-[#3B82F6] text-white px-4 py-2 rounded-lg flex items-center gap-1.5 neon-btn"
              data-testid="button-add-more"
            >
              <Inbox className="w-3 h-3" />
              {t("today.addMore")}
            </button>
          </div>
        </motion.div>
      )}

      {!allDone && (
        <div>
          <h3 className="text-[10px] font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full neon-dot"></span>
            {t("today.focus")}
          </h3>
          
          <div className="space-y-3">
            {focusTasks.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground/60 text-sm glass-card rounded-xl border-dashed neon-border-subtle cursor-pointer hover:bg-white/[0.03] hover:text-muted-foreground/80 transition-all"
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
                        className={`glass-card p-4 rounded-xl neon-border-subtle transition-all duration-300 ${isCompleting ? "opacity-50 scale-[0.98]" : ""}`}
                        data-testid={`task-focus-${task.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => handleComplete(task.id)}
                            disabled={isCompleting}
                            className="mt-0.5 text-muted-foreground/30 hover:text-[#3B82F6] transition-all shrink-0"
                            data-testid={`button-complete-${task.id}`}
                          >
                            {isCompleting ? (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                              </motion.div>
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          
                          <div className="flex-1 space-y-2.5 min-w-0">
                            <p className={`text-sm font-medium leading-relaxed transition-all duration-300 ${isCompleting ? "line-through text-muted-foreground/40" : "text-foreground/90"}`}>
                              {task.content}
                            </p>
                            
                            {task.nudge && (
                              <div className="text-xs bg-[#3B82F6]/[0.06] p-2.5 rounded-lg text-muted-foreground border-l-2 border-[#3B82F6]/30">
                                <span className="font-semibold mr-1 text-foreground/60">{t("today.microStep")}</span> 
                                {task.nudge}
                              </div>
                            )}
                            
                            {!isCompleting && (
                              <div className="flex gap-2 pt-0.5 flex-wrap">
                                <button 
                                  onClick={() => handleNudge(task.id)}
                                  disabled={activeNudgeId === task.id}
                                  data-testid={`button-nudge-${task.id}`}
                                  className="text-[10px] uppercase font-bold tracking-wider glass-card hover:bg-white/[0.08] px-3 py-1.5 rounded-lg text-foreground/70 flex items-center gap-1.5 transition-colors disabled:opacity-40 neon-border-subtle"
                                >
                                  {activeNudgeId === task.id ? <Zap className="w-3 h-3 animate-pulse text-[#3B82F6]" /> : <Zap className="w-3 h-3" />}
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
        <div className="opacity-30 hover:opacity-70 transition-opacity duration-300">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-muted-foreground">{t("today.completedToday")}</h4>
          <div className="space-y-2">
             {completedToday.map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm text-muted-foreground/60 line-through">
                 <CheckCircle2 className="w-4 h-4 text-[#3B82F6]/30 shrink-0" />
                 <span className="truncate">{task.content}</span>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
