import { useState, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useCreatePriorities } from "@/hooks/use-priorities";
import { useUpdateUserState } from "@/hooks/use-user-state";
import { ArrowRight, Loader2, Check, Languages, Send, Sparkles, ChevronRight, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useLocation } from "wouter";

const TOTAL_PAGES = 7;
const SWIPE_THRESHOLD = 50;

function DumpDemo() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const messages = [
    { text: t("onboarding.demo.dump1"), type: "user" as const },
    { text: t("onboarding.demo.dump2"), type: "user" as const },
    { text: t("onboarding.demo.dump3"), type: "user" as const },
  ];

  return (
    <div className="space-y-2.5 w-full max-w-[300px] mx-auto">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={step > i ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex justify-end"
        >
          <div className="paper-card rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
            <p className="text-sm" style={{ color: 'var(--paper-fg)' }}>{msg.text}</p>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 pt-1"
      >
        <div className="h-px flex-1" style={{ background: 'var(--paper-border)' }} />
        <div className="flex items-center gap-1 font-mono text-[0.72rem] font-medium" style={{ color: 'var(--paper-muted)' }}>
          <Send className="w-3 h-3" />
          {t("onboarding.demo.sorting")}
        </div>
        <div className="h-px flex-1" style={{ background: 'var(--paper-border)' }} />
      </motion.div>
    </div>
  );
}

function SortDemo() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const tiers = [
    { label: t("queue.focus"), cssVar: 'var(--paper-muted)', items: [t("onboarding.demo.sort1")] },
    { label: t("queue.backlog"), cssVar: 'var(--paper-secondary)', items: [t("onboarding.demo.sort2")] },
    { label: t("queue.icebox"), cssVar: 'var(--paper-subtle)', items: [t("onboarding.demo.sort3")] },
  ];

  return (
    <div className="space-y-3 w-full max-w-[300px] mx-auto">
      {tiers.map((tier, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={step > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.cssVar }} />
            <span className="font-mono text-[0.72rem] font-medium uppercase tracking-[1px]" style={{ color: tier.cssVar }}>{tier.label}</span>
          </div>
          <div className="paper-card rounded-lg px-4 py-3">
            <p className="text-sm" style={{ color: 'var(--paper-fg)' }}>{tier.items[0]}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function NudgeDemo() {
  const { t } = useI18n();
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4 w-full max-w-[300px] mx-auto">
      <div className="paper-card rounded-lg p-4">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--paper-fg)' }}>{t("onboarding.demo.nudgeTask")}</p>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={showNudge ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="pl-3 py-1" style={{ borderLeft: '2px solid var(--paper-fg)' }}>
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[1px] mb-1" style={{ color: 'var(--paper-muted)' }}>{t("today.microStep")}</p>
            <p className="text-sm" style={{ color: 'var(--paper-muted)' }}>{t("onboarding.demo.nudgeStep")}</p>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={showNudge ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-1.5 text-xs"
        style={{ color: 'var(--paper-secondary)' }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--paper-muted)' }} />
        {t("onboarding.demo.nudgeHint")}
      </motion.div>
    </div>
  );
}

function RewardDemo() {
  const { t } = useI18n();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCount(10), 600),
      setTimeout(() => setCount(20), 1200),
      setTimeout(() => setCount(30), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-5 w-full max-w-[300px] mx-auto flex flex-col items-center">
      <div className="paper-card rounded-lg p-5 w-full text-center">
        <p className="font-mono text-[0.75rem] font-medium uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--paper-secondary)' }}>
          {t("today.guiltFreeTime")}
        </p>
        <motion.div
          key={count}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[2rem] font-heading font-bold tabular-nums"
          style={{ color: 'var(--paper-fg)' }}
        >
          {count}
          <span className="text-lg ml-1" style={{ color: 'var(--paper-secondary)' }}>{t("today.min")}</span>
        </motion.div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={count >= i * 10 ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 rounded-lg paper-card flex items-center justify-center"
          >
            <Check className="w-5 h-5" style={{ color: count >= i * 10 ? 'var(--paper-fg)' : 'var(--paper-tertiary)' }} />
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--paper-secondary)' }}>{t("onboarding.demo.rewardHint")}</p>
    </div>
  );
}

function StreakDemo() {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealed(prev => {
        if (prev >= 15) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const days = Array.from({ length: 28 }, (_, i) => {
    const active = [0, 1, 2, 4, 5, 7, 8, 9, 11, 14, 15, 18, 19, 20, 22].includes(i);
    const intensity = active ? (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1) : 0;
    return { active, intensity };
  });

  const getStreakColor = (intensity: number) => {
    if (intensity === 3) return 'var(--paper-fg)';
    if (intensity === 2) return 'var(--paper-subtle)';
    if (intensity === 1) return 'var(--paper-active)';
    return 'var(--paper-streak-empty)';
  };

  return (
    <div className="space-y-4 w-full max-w-[300px] mx-auto">
      <div className="paper-card rounded-lg p-4">
        <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--paper-secondary)' }}>{t("streak.title")}</p>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={i < revealed * 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.15 }}
              className="aspect-square rounded-sm"
              style={{ backgroundColor: getStreakColor(day.intensity) }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 font-mono text-[0.72rem]" style={{ color: 'var(--paper-secondary)' }}>
          <span>15 {t("streak.daysActive")}</span>
          <span>42 {t("streak.done")}</span>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [priorities, setPriorities] = useState(["", "", ""]);
  const { mutateAsync: createPriorities, isPending: isCreating } = useCreatePriorities();
  const { mutateAsync: updateUserState } = useUpdateUserState();
  const { toast } = useToast();
  const { t, lang, toggle } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const isPrioritiesPage = page === TOTAL_PAGES - 1;

  const goNext = () => {
    if (page < TOTAL_PAGES - 1) {
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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const pages = [
    {
      title: "BrainDump",
      subtitle: t("onboarding.catchphrase"),
      demo: null,
    },
    {
      title: t("onboarding.feature2.title"),
      subtitle: t("onboarding.feature2.desc"),
      demo: <DumpDemo />,
    },
    {
      title: t("onboarding.feature1.title"),
      subtitle: t("onboarding.feature1.desc"),
      demo: <SortDemo />,
    },
    {
      title: t("onboarding.feature3.title"),
      subtitle: t("onboarding.feature3.desc"),
      demo: <NudgeDemo />,
    },
    {
      title: t("onboarding.feature4.title"),
      subtitle: t("onboarding.feature4.desc"),
      demo: <RewardDemo />,
    },
    {
      title: t("onboarding.feature5.title"),
      subtitle: t("onboarding.feature5.desc"),
      demo: <StreakDemo />,
    },
  ];

  const btnClass = "flex items-center gap-1.5 font-mono text-[0.72rem] font-medium uppercase tracking-[1.5px] px-2.5 py-1.5 rounded-lg transition-colors";

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--paper-bg)', color: 'var(--paper-fg)' }} data-testid="onboarding-page">
      <div className="flex justify-end px-6 pt-4 relative z-10 gap-2">
        <button
          onClick={toggle}
          className={btnClass}
          style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
          data-testid="button-onboarding-lang-toggle"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === "en" ? "中文" : "EN"}
        </button>
        <button
          onClick={toggleTheme}
          className={btnClass}
          style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
          data-testid="button-onboarding-theme-toggle"
        >
          {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 relative z-10 max-w-[480px] mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {!isPrioritiesPage && page < pages.length && (
            <motion.div
              key={`page-${page}`}
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
              {page === 0 ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: 'var(--paper-fg)' }} />
                    <h1 className="text-[1.9rem] font-heading font-bold tracking-tighter" style={{ color: 'var(--paper-fg)' }} data-testid="text-app-title">
                      {pages[0].title}
                    </h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-xl leading-relaxed font-medium"
                    style={{ color: 'var(--paper-secondary)' }}
                    data-testid="text-catchphrase"
                  >
                    {pages[0].subtitle}
                  </motion.p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-heading font-bold tracking-tight" style={{ color: 'var(--paper-fg)' }} data-testid={`text-feature-title-${page}`}>
                      {pages[page].title}
                    </h2>
                    <p className="text-base leading-relaxed" style={{ color: 'var(--paper-secondary)' }} data-testid={`text-feature-desc-${page}`}>
                      {pages[page].subtitle}
                    </p>
                  </div>
                  <div className="pt-2">
                    {pages[page].demo}
                  </div>
                </div>
              )}
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
                <h2 className="text-xl font-heading font-bold" style={{ color: 'var(--paper-fg)' }} data-testid="text-priorities-title">{t("onboarding.whatMatters")}</h2>
                <p className="text-base" style={{ color: 'var(--paper-secondary)' }}>{t("onboarding.defineTop3")}</p>
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
                      className="w-full bg-transparent py-4 text-xl focus:outline-none transition-colors"
                      style={{ color: 'var(--paper-fg)', borderBottom: '1px solid var(--paper-border)' }}
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

      <div className="px-8 pb-10 relative z-10 space-y-5 max-w-[480px] mx-auto w-full">
        {!isPrioritiesPage && (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === page ? 24 : 6,
                }}
                transition={{ duration: 0.3 }}
                className="h-1 rounded-full"
                style={{ background: i === page ? 'var(--paper-fg)' : 'var(--paper-border)' }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          {!isPrioritiesPage ? (
            <>
              <p className="font-mono text-[0.72rem] uppercase tracking-[1.5px]" style={{ color: 'var(--paper-tertiary)' }}>
                {t("onboarding.swipeHint")}
              </p>
              {page < TOTAL_PAGES - 2 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--paper-fg)' }}
                  data-testid="button-next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--paper-fg)' }}
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
              className="w-full paper-btn py-4 rounded-full font-heading font-bold flex items-center justify-center gap-2 disabled:opacity-50"
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
