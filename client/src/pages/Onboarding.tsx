import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreatePriorities } from "@/hooks/use-priorities";
import { useUpdateUserState } from "@/hooks/use-user-state";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [priorities, setPriorities] = useState(["", "", ""]);
  const { mutateAsync: createPriorities, isPending: isCreating } = useCreatePriorities();
  const { mutateAsync: updateUserState } = useUpdateUserState();
  const { toast } = useToast();

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  const handleComplete = async () => {
    try {
      const validPriorities = priorities.filter(p => p.trim().length > 0);
      
      if (validPriorities.length === 0) {
        toast({ title: "Please add at least one priority", variant: "destructive" });
        return;
      }

      await createPriorities(validPriorities.map(content => ({ content })));
      await updateUserState({ hasOnboarded: true });
    } catch (error) {
      toast({ title: "Something went wrong", description: "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between p-8 bg-background text-foreground relative">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 50%)',
      }} />

      <div className="mt-16 relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h1 className="text-4xl font-bold tracking-tighter leading-tight">
                Declutter<br/>
                <span className="text-muted-foreground">your mind.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                BrainDump helps you capture thoughts instantly and uses AI to sort them into actionable tasks based on what actually matters to you.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="priorities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">What matters most?</h2>
                <p className="text-muted-foreground text-sm">Define your top 3 life priorities. The AI will use these to sort your tasks.</p>
              </div>

              <div className="space-y-4">
                {priorities.map((priority, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <input
                      type="text"
                      placeholder={`Priority #${i + 1}`}
                      value={priority}
                      onChange={(e) => handlePriorityChange(i, e.target.value)}
                      className="w-full bg-transparent border-b border-white/[0.06] py-4 text-lg focus:outline-none focus:border-[hsl(var(--primary))]/50 transition-colors placeholder:text-muted-foreground/20"
                      autoFocus={i === 0}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end mb-8 relative z-10">
        {step === 0 ? (
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-base font-medium hover:opacity-80 transition-opacity text-foreground/80"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCreating}
            className="bg-[hsl(var(--primary))] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[hsl(var(--primary))]/20"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> All Set</>}
          </button>
        )}
      </div>
    </div>
  );
}
