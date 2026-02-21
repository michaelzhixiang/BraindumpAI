import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreatePriorities } from "@/hooks/use-priorities";
import { useUpdateUserState } from "@/hooks/use-user-state";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [priorities, setPriorities] = useState(["", "", ""]);
  const { mutateAsync: createPriorities, isPending: isCreating } = useCreatePriorities();
  const { mutateAsync: updateUserState } = useUpdateUserState();
  const { toast } = useToast();
  const { t } = useI18n();

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  const handleComplete = async () => {
    try {
      const validPriorities = priorities.filter(p => p.trim().length > 0);
      
      if (validPriorities.length === 0) {
        toast({ title: t("onboarding.addPriority"), variant: "destructive" });
        return;
      }

      await createPriorities(validPriorities.map(content => ({ content })));
      await updateUserState({ hasOnboarded: true });
    } catch (error) {
      toast({ title: t("onboarding.error"), description: t("onboarding.tryAgain"), variant: "destructive" });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between p-8 bg-background text-foreground relative overflow-hidden">
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
      </div>

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
                {t("onboarding.declutter")}<br/>
                <span className="text-muted-foreground">{t("onboarding.yourMind")}</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t("onboarding.desc")}
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
                <h2 className="text-2xl font-bold">{t("onboarding.whatMatters")}</h2>
                <p className="text-muted-foreground text-sm">{t("onboarding.defineTop3")}</p>
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
                      placeholder={`${t("onboarding.priority")} #${i + 1}`}
                      value={priority}
                      onChange={(e) => handlePriorityChange(i, e.target.value)}
                      className="w-full bg-transparent border-b border-white/[0.06] py-4 text-lg focus:outline-none focus:border-[#3B82F6]/50 transition-colors placeholder:text-muted-foreground/20"
                      autoFocus={i === 0}
                      data-testid={`input-priority-${i}`}
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
            data-testid="button-get-started"
          >
            {t("onboarding.getStarted")} <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCreating}
            className="bg-[#3B82F6] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 neon-btn"
            data-testid="button-all-set"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {t("onboarding.allSet")}</>}
          </button>
        )}
      </div>
    </div>
  );
}
