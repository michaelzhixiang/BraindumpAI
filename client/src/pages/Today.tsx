import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, MoreHorizontal, Zap, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useUserState, useUpdateUserState } from "@/hooks/use-user-state";
import { useGenerateNudge } from "@/hooks/use-ai";
import { useToast } from "@/hooks/use-toast";

export default function Today() {
  const { data: tasks, isLoading } = useTasks();
  const { data: userState } = useUserState();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateUserState } = useUpdateUserState();
  const { mutateAsync: generateNudge, isPending: isNudging } = useGenerateNudge();
  const { toast } = useToast();

  const [activeNudgeId, setActiveNudgeId] = useState<number | null>(null);

  const focusTasks = tasks?.filter(t => t.tier === "focus" && t.status === "pending") || [];
  const completedToday = tasks?.filter(t => t.status === "completed" && new Date(t.completedAt!).toDateString() === new Date().toDateString()) || [];

  const handleComplete = (id: number) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#a8a8a8', '#555555']
    });

    updateTask({ id, status: "completed" });
    updateUserState({ screenTimeMinutes: (userState?.screenTimeMinutes || 0) + 10 });
    
    toast({
      title: "Task crushed! 🎯",
      description: "+10 minutes of guilt-free screen time earned.",
    });
  };

  const handleNudge = async (id: number) => {
    setActiveNudgeId(id);
    try {
      const { nudge } = await generateNudge(id);
      updateTask({ id, nudge });
      toast({ title: "Micro-step generated", description: "Check the task for a smaller starting point." });
    } catch (e) {
      toast({ title: "Failed to generate nudge", variant: "destructive" });
    } finally {
      setActiveNudgeId(null);
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><div className="animate-spin text-primary font-mono text-xl">Loading...</div></div>;

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header Stats */}
      <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock className="w-24 h-24" />
        </div>
        <h2 className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Guilt-Free Time</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-mono font-medium text-foreground tracking-tighter">
            {userState?.screenTimeMinutes || 0}
          </span>
          <span className="text-sm font-medium text-muted-foreground">min</span>
        </div>
      </div>

      {/* Focus List */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Focus Zone
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {focusTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground text-sm border border-dashed border-white/10 rounded-xl"
              >
                No focus tasks. Check the Dump tab to add some.
              </motion.div>
            ) : (
              focusTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-white/5 p-4 rounded-xl group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 z-10 relative">
                    <button 
                      onClick={() => handleComplete(task.id)}
                      className="mt-1 text-muted-foreground hover:text-green-500 transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium leading-relaxed">{task.content}</p>
                      
                      {task.nudge && (
                        <div className="text-xs bg-white/5 p-2 rounded-lg text-muted-foreground border-l-2 border-primary/50">
                          <span className="text-primary font-bold mr-1">Micro-step:</span> 
                          {task.nudge}
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleNudge(task.id)}
                          disabled={activeNudgeId === task.id || !!task.nudge}
                          className="text-[10px] uppercase font-bold tracking-wider bg-secondary hover:bg-secondary/80 px-2 py-1 rounded text-secondary-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {activeNudgeId === task.id ? <Zap className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          Nudge Me
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Completed Today (Subtle) */}
      {completedToday.length > 0 && (
        <div className="opacity-50 hover:opacity-100 transition-opacity duration-300">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Completed Today</h4>
          <div className="space-y-2">
             {completedToday.map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm text-muted-foreground line-through">
                 <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                 {task.content}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
