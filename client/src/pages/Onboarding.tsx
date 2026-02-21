import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useCreatePriorities } from "@/hooks/use-priorities";
import { useUpdateUserState } from "@/hooks/use-user-state";
import { ArrowRight, Loader2, Check, Target, Brain, Zap, Trophy, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";

const TOTAL_INTRO_PAGES = 5;
const SWIPE_THRESHOLD = 50;

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [priorities, setPriorities] = useState(["", "", ""]);
  const { mutateAsync: createPriorities, isPending: isCreating } = useCreatePriorities();
  const { mutateAsync: updateUserState } = useUpdateUserState();
  const { toast } = useToast();
  const { t, lang, toggle } = useI18n();
  const [, setLocation] = useLocation();

  const isPrioritiesPage = page === TOTAL_INTRO_PAGES;

  const goNext = () => {
    if (page <= TOTAL_INTRO_PAGES - 1) {
      setDirection(1);
      setPage(p => p + 1);
    }
  };

  const goPrev = () => {
    if (page > 0) {
      setDirection(-1);
      setPage(p => p - 1);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isPrioritiesPage) return;
    if (info.offset.x < -SWIPE_THRESHOLD && info.velocity.x < 0) {
      goNext();
    } else if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > 0) {
      goPrev();
    }
  };

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
      setLocation("/dump");
    } catch (error) {
      toast({ title: t("onboarding.error"), description: t("onboarding.tryAgain"), variant: "destructive" });
    }
  };

  const features = [
    { icon: Target, titleKey: "onboarding.feature1.title", descKey: "onboarding.feature1.desc" },
    { icon: Brain, titleKey: "onboarding.feature2.title", descKey: "onboarding.feature2.desc" },
    { icon: Zap, titleKey: "onboarding.feature3.title", descKey: "onboarding.feature3.desc" },
    { icon: Trophy, titleKey: "onboarding.feature4.title", descKey: "onboarding.feature4.desc" },
  ];

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground relative overflow-hidden" data-testid="onboarding-page">
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-band aurora-band-1" />
        <div className="aurora-band aurora-band-2" />
        <div className="aurora-band aurora-band-3" />
      </div>

      <div className="flex justify-end px-6 pt-4 relative z-10">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground/80 transition-all neon-border-subtle"
          data-testid="button-onboarding-lang-toggle"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === "en" ? "中文" : "EN"}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          {page === 0 && (
            <motion.div
              key="hero"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="space-y-6 touch-pan-y"
            >
              <h1 className="text-3xl font-bold tracking-tighter leading-tight" data-testid="text-app-title">
                BrainDump AI
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium" data-testid="text-catchphrase">
                {t("onboarding.catchphrase")}
              </p>
            </motion.div>
          )}

          {page >= 1 && page <= 4 && (
            <motion.div
              key={`feature-${page}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="space-y-6 touch-pan-y"
            >
              {(() => {
                const feature = features[page - 1];
                const Icon = feature.icon;
                return (
                  <>
                    <div className="w-14 h-14 rounded-2xl glass-card neon-border-subtle flex items-center justify-center">
                      <Icon className="w-7 h-7 text-[#3B82F6]" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold tracking-tight" data-testid={`text-feature-title-${page}`}>
                        {t(feature.titleKey)}
                      </h2>
                      <p className="text-base text-muted-foreground leading-relaxed" data-testid={`text-feature-desc-${page}`}>
                        {t(feature.descKey)}
                      </p>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}

          {isPrioritiesPage && (
            <motion.div
              key="priorities"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold" data-testid="text-priorities-title">{t("onboarding.whatMatters")}</h2>
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

      <div className="px-8 pb-10 relative z-10 space-y-5">
        {!isPrioritiesPage && (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_INTRO_PAGES }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === page ? "w-6 bg-[#3B82F6] neon-dot" : "w-1.5 bg-white/[0.12]"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          {!isPrioritiesPage ? (
            <>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                {t("onboarding.swipeHint")}
              </p>
              {page < TOTAL_INTRO_PAGES - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity text-foreground/80"
                  data-testid="button-next"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity text-[#3B82F6]"
                  data-testid="button-lets-go"
                >
                  {t("onboarding.letsGo")} <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCreating}
              className="w-full bg-[#3B82F6] text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 neon-btn"
              data-testid="button-all-set"
            >
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {t("onboarding.allSet")}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
