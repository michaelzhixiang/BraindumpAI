import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, Clock, ListChecks, Plus, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useTasks, useUpdateTask, useCreateTasksBulk } from "@/hooks/use-tasks";
import { useUserState, useUpdateUserState } from "@/hooks/use-user-state";
import { useGenerateNudge, useGenerateBreakdown } from "@/hooks/use-ai";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MonthlyStreak } from "@/components/MonthlyStreak";
import type { Task } from "@shared/schema";

export default function Today() {
  const { data: tasks, isLoading } = useTasks();
  const { data: userState } = useUserState();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateUserState } = useUpdateUserState();
  const { mutateAsync: generateNudge } = useGenerateNudge();
  const { mutateAsync: generateBreakdown, isPending: isBreakingDown } = useGenerateBreakdown();
  const { mutateAsync: createTasksBulk } = useCreateTasksBulk();
  const { toast } = useToast();

  const [activeNudgeId, setActiveNudgeId] = useState<number | null>(null);
  const [breakdownTaskId, setBreakdownTaskId] = useState<number | null>(null);
  const [breakdownSteps, setBreakdownSteps] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isAddingSteps, setIsAddingSteps] = useState(false);

  const focusTasks = tasks?.filter(t => t.tier === "focus" && t.status === "pending" && !t.parentId) || [];
  const completedToday = tasks?.filter(t => 
    t.status === "completed" && 
    t.completedAt && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ) || [];

  const allDone = focusTasks.length === 0 && completedToday.length > 0;

  const handleComplete = (id: number) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#60A5FA', '#93C5FD']
    });

    updateTask({ id, status: "completed", completedAt: new Date().toISOString() });
    updateUserState({ screenTimeMinutes: (userState?.screenTimeMinutes || 0) + 10 });
    
    toast({
      title: "+10 min earned",
      description: "Guilt-free screen time banked.",
    });
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

  const handleBreakdown = async (task: Task) => {
    setBreakdownTaskId(task.id);
    setBreakdownSteps([]);
    setShowBreakdown(true);
    try {
      const result = await generateBreakdown(task.id);
      setBreakdownSteps(result.steps);
    } catch (e) {
      toast({ title: "Failed to break down task", variant: "destructive" });
      setShowBreakdown(false);
    }
  };

  const handleAddStepsToList = async () => {
    if (!breakdownTaskId || breakdownSteps.length === 0) return;
    setIsAddingSteps(true);
    try {
      const task = tasks?.find(t => t.id === breakdownTaskId);
      await createTasksBulk(
        breakdownSteps.map(step => ({
          content: step,
          tier: task?.tier || "focus",
          status: "pending" as const,
          parentId: breakdownTaskId,
        }))
      );
      toast({ title: `${breakdownSteps.length} steps added to your list` });
      setShowBreakdown(false);
    } catch (e) {
      toast({ title: "Failed to add steps", variant: "destructive" });
    } finally {
      setIsAddingSteps(false);
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

      <div className="glass-card rounded-2xl p-5 relative halo-ambient" data-testid="guilt-free-card">
        <div className="absolute top-4 right-4 opacity-[0.06]">
          <Clock className="w-16 h-16" />
        </div>
        <h2 className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1">Guilt-Free Time</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-semibold text-foreground tracking-tighter" data-testid="text-screen-time">
            {userState?.screenTimeMinutes || 0}
          </span>
          <span className="text-xs font-medium text-muted-foreground">min</span>
        </div>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-3"
        >
          <div className="text-3xl font-semibold">All done for today.</div>
          <p className="text-muted-foreground text-sm">
            You earned {completedToday.length * 10} minutes. Go enjoy them.
          </p>
        </motion.div>
      )}

      {!allDone && (
        <div>
          <h3 className="text-[10px] font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full animate-pulse"></span>
            Focus
          </h3>
          
          <div className="space-y-3">
            {focusTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground/60 text-sm glass-card rounded-xl border-dashed">
                No focus tasks. Dump some thoughts first.
              </div>
            ) : (
              focusTasks.map((task) => {
                const subTasks = tasks?.filter(t => t.parentId === task.id && t.status === "pending") || [];
                return (
                  <div key={task.id}>
                    <div
                      className="glass-card p-4 rounded-xl"
                      data-testid={`task-focus-${task.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => handleComplete(task.id)}
                          className="mt-0.5 text-muted-foreground/30 hover:text-[hsl(var(--primary))] transition-colors shrink-0"
                          data-testid={`button-complete-${task.id}`}
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 space-y-2.5 min-w-0">
                          <p className="text-sm font-medium leading-relaxed text-foreground/90">{task.content}</p>
                          
                          {task.nudge && (
                            <div className="text-xs bg-[hsl(var(--primary))]/[0.06] p-2.5 rounded-lg text-muted-foreground border-l-2 border-[hsl(var(--primary))]/30">
                              <span className="font-semibold mr-1 text-foreground/60">Micro-step:</span> 
                              {task.nudge}
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-0.5 flex-wrap">
                            <button 
                              onClick={() => handleNudge(task.id)}
                              disabled={activeNudgeId === task.id}
                              data-testid={`button-nudge-${task.id}`}
                              className="text-[10px] uppercase font-bold tracking-wider bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg text-foreground/70 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                            >
                              {activeNudgeId === task.id ? <Zap className="w-3 h-3 animate-pulse text-[hsl(var(--primary))]" /> : <Zap className="w-3 h-3" />}
                              Nudge Me
                            </button>
                            <button
                              onClick={() => handleBreakdown(task)}
                              disabled={breakdownTaskId === task.id && isBreakingDown}
                              data-testid={`button-breakdown-${task.id}`}
                              className="text-[10px] uppercase font-bold tracking-wider bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg text-foreground/70 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                            >
                              {breakdownTaskId === task.id && isBreakingDown ? (
                                <ListChecks className="w-3 h-3 animate-pulse text-[hsl(var(--primary))]" />
                              ) : (
                                <ListChecks className="w-3 h-3" />
                              )}
                              Break It Down
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {subTasks.length > 0 && (
                      <div className="ml-8 mt-1 space-y-0.5">
                        {subTasks.map(sub => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg"
                          >
                            <button
                              onClick={() => handleComplete(sub.id)}
                              className="text-muted-foreground/20 hover:text-[hsl(var(--primary))] transition-colors shrink-0"
                            >
                              <Circle className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-muted-foreground/70">{sub.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {completedToday.length > 0 && !allDone && (
        <div className="opacity-30 hover:opacity-70 transition-opacity duration-300">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-muted-foreground">Completed Today</h4>
          <div className="space-y-2">
             {completedToday.map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm text-muted-foreground/60 line-through">
                 <CheckCircle2 className="w-4 h-4 text-[hsl(var(--primary))]/30 shrink-0" />
                 <span className="truncate">{task.content}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="glass-card border-white/[0.06] text-foreground max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Task Breakdown</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {isBreakingDown ? "Thinking of steps..." : `${breakdownSteps.length} steps to get this done`}
            </DialogDescription>
          </DialogHeader>
          
          {isBreakingDown ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                {breakdownSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03]"
                  >
                    <span className="text-[10px] font-mono text-[hsl(var(--primary))]/50 mt-0.5 w-4 shrink-0 text-right">{i + 1}</span>
                    <p className="text-sm text-foreground/80">{step}</p>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={handleAddStepsToList}
                disabled={isAddingSteps}
                className="w-full bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/80"
                data-testid="button-add-steps"
              >
                {isAddingSteps ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add All Steps to My List
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
