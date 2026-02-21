import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Archive, Flame, Snowflake, Trash2, ArrowRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Queue() {
  const { data: tasks, isLoading } = useTasks();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const [movingTask, setMovingTask] = useState<{ id: number, toTier: "backlog" | "icebox" } | null>(null);
  const { toast } = useToast();

  const pendingTasks = tasks?.filter(t => t.status === "pending") || [];
  const focus = pendingTasks.filter(t => t.tier === "focus");
  const backlog = pendingTasks.filter(t => t.tier === "backlog");
  const icebox = pendingTasks.filter(t => t.tier === "icebox");

  const confirmMove = () => {
    if (movingTask) {
      updateTask({ id: movingTask.id, tier: movingTask.toTier });
      setMovingTask(null);
      toast({ title: "Moved to " + movingTask.toTier });
    }
  };

  const handleTierChange = (id: number, currentTier: string, newTier: "focus" | "backlog" | "icebox") => {
    if (currentTier === "focus" && newTier !== "focus") {
      setMovingTask({ id, toTier: newTier });
    } else {
      updateTask({ id, tier: newTier });
    }
  };

  const Section = ({ title, icon: Icon, items, tierColor, targetTier }: any) => (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${tierColor}`}>
        <Icon className="w-4 h-4" />
        {title} <span className="opacity-50 ml-1 text-xs">({items.length})</span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs text-muted-foreground">
            Empty
          </div>
        ) : (
          items.map((task: any) => (
            <motion.div
              key={task.id}
              layout
              className="bg-card border border-white/5 p-4 rounded-xl group relative"
            >
              <div className="flex justify-between items-start gap-4">
                <p className="text-sm font-medium">{task.content}</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {targetTier !== "focus" && (
                     <button 
                       onClick={() => handleTierChange(task.id, targetTier, "focus")}
                       className="p-1 hover:text-red-400" 
                       title="Move to Focus"
                     >
                       <Flame className="w-4 h-4" />
                     </button>
                  )}
                  {targetTier !== "backlog" && (
                    <button 
                      onClick={() => handleTierChange(task.id, targetTier, "backlog")}
                      className="p-1 hover:text-yellow-400"
                      title="Move to Backlog"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  {targetTier !== "icebox" && (
                    <button 
                      onClick={() => handleTierChange(task.id, targetTier, "icebox")}
                      className="p-1 hover:text-blue-400"
                      title="Move to Icebox"
                    >
                      <Snowflake className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-1 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  if (isLoading) return null;

  return (
    <div className="p-6 space-y-8 pb-32">
      <Section title="Focus" icon={Flame} items={focus} tierColor="text-red-400" targetTier="focus" />
      <Section title="Backlog" icon={Archive} items={backlog} tierColor="text-yellow-400" targetTier="backlog" />
      <Section title="Icebox" icon={Snowflake} items={icebox} tierColor="text-blue-400" targetTier="icebox" />

      <AlertDialog open={!!movingTask} onOpenChange={(open) => !open && setMovingTask(null)}>
        <AlertDialogContent className="bg-card border-white/10 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Pushing it back?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you moving this because it's genuinely not urgent, or because it feels overwhelming?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5 hover:text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMove} className="bg-primary text-primary-foreground hover:opacity-90">
              Move Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
