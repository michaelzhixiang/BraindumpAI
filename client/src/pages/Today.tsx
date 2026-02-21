import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const focusTasks = tasks?.filter(t => t.tier === "focus" && t.status === "pending") || [];
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
      colors: ['#ffffff', '#a8a8a8', '#555555']
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
    <div className="p-6 space-y-8 pb-32" data-testid="today-page">
      <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/5 rounded-2xl p-6 relative">
        <div className="absolute top-4 right-4 opacity-10">
          <Clock className="w-20 h-20" />
        </div>
        <h2 className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1">Guilt-Free Time</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-mono font-medium text-foreground tracking-tighter" data-testid="text-screen-time">
            {userState?.screenTimeMinutes || 0}
          </span>
          <span className="text-sm font-medium text-muted-foreground">min</span>
        </div>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-3"
        >
          <div className="text-4xl">All done for today.</div>
          <p className="text-muted-foreground text-sm">
            You earned {completedToday.length * 10} minutes. Go enjoy them.
          </p>
        </motion.div>
      )}

      {!allDone && (
        <div>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            Focus
          </h3>
          
          <div className="space-y-3">
            {focusTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-white/10 rounded-xl">
                No focus tasks. Dump some thoughts first.
              </div>
            ) : (
              focusTasks.map((task) => {
                const subTasks = tasks?.filter(t => t.parentId === task.id && t.status === "pending") || [];
                return (
                  <div key={task.id}>
                    <motion.div
                      layout="position"
                      className="bg-card border border-white/5 p-4 rounded-xl"
                      data-testid={`task-focus-${task.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => handleComplete(task.id)}
                          className="mt-0.5 text-muted-foreground/40 hover:text-green-500 transition-colors shrink-0"
                          data-testid={`button-complete-${task.id}`}
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 space-y-2 min-w-0">
                          <p className="text-sm font-medium leading-relaxed">{task.content}</p>
                          
                          {task.nudge && (
                            <div className="text-xs bg-white/5 p-2.5 rounded-lg text-muted-foreground border-l-2 border-primary/30">
                              <span className="font-bold mr-1 text-foreground/70">Micro-step:</span> 
                              {task.nudge}
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-1 flex-wrap">
                            <button 
                              onClick={() => handleNudge(task.id)}
                              disabled={activeNudgeId === task.id}
                              data-testid={`button-nudge-${task.id}`}
                              className="text-[10px] uppercase font-bold tracking-wider bg-secondary px-3 py-1.5 rounded-md text-secondary-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {activeNudgeId === task.id ? <Zap className="w-3 h-3 animate-pulse" /> : <Zap className="w-3 h-3" />}
                              Nudge Me
                            </button>
                            <button
                              onClick={() => handleBreakdown(task)}
                              disabled={breakdownTaskId === task.id && isBreakingDown}
                              data-testid={`button-breakdown-${task.id}`}
                              className="text-[10px] uppercase font-bold tracking-wider bg-secondary px-3 py-1.5 rounded-md text-secondary-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {breakdownTaskId === task.id && isBreakingDown ? (
                                <ListChecks className="w-3 h-3 animate-pulse" />
                              ) : (
                                <ListChecks className="w-3 h-3" />
                              )}
                              Break It Down
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {subTasks.length > 0 && (
                      <div className="ml-8 mt-1 space-y-1">
                        {subTasks.map(sub => (
                          <motion.div
                            key={sub.id}
                            layout="position"
                            className="flex items-center gap-3 py-2 px-3 rounded-lg border-l-2 border-primary/10"
                          >
                            <button
                              onClick={() => handleComplete(sub.id)}
                              className="text-muted-foreground/30 hover:text-green-500 transition-colors shrink-0"
                            >
                              <Circle className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-muted-foreground">{sub.content}</p>
                          </motion.div>
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
        <div className="opacity-40 hover:opacity-80 transition-opacity duration-300">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-muted-foreground">Completed Today</h4>
          <div className="space-y-2">
             {completedToday.map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm text-muted-foreground line-through">
                 <CheckCircle2 className="w-4 h-4 text-green-500/40 shrink-0" />
                 <span className="truncate">{task.content}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="bg-card border-white/10 text-foreground max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Task Breakdown</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {isBreakingDown ? "Thinking of steps..." : `${breakdownSteps.length} steps to get this done`}
            </DialogDescription>
          </DialogHeader>
          
          {isBreakingDown ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {breakdownSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 py-2"
                  >
                    <span className="text-xs font-mono text-muted-foreground/50 mt-0.5 w-5 shrink-0">{i + 1}.</span>
                    <p className="text-sm">{step}</p>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={handleAddStepsToList}
                disabled={isAddingSteps}
                className="w-full"
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
