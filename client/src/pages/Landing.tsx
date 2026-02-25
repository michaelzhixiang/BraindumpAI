import { motion } from "framer-motion";
import { Brain, Sparkles, Timer, ArrowRight, Languages, Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export default function Landing() {
  const { t, lang, toggle } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const features = [
    { icon: Brain, title: t("landing.feature1"), desc: t("landing.feature1.desc") },
    { icon: Sparkles, title: t("landing.feature2"), desc: t("landing.feature2.desc") },
    { icon: Timer, title: t("landing.feature3"), desc: t("landing.feature3.desc") },
  ];

  const btnClass = "flex items-center gap-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[1.5px] px-3 py-1.5 rounded-lg transition-colors";

  return (
    <div className="app-container">
      <div className="flex-1 overflow-y-auto relative z-10 flex flex-col items-center justify-center px-6 py-12 max-w-[480px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-3 h-3 rounded-full"
              style={{ background: 'var(--paper-fg)' }}
            />
            <h1 className="text-[1.9rem] font-heading font-bold tracking-tight" style={{ color: 'var(--paper-fg)' }} data-testid="text-landing-title">
              BrainDump
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base text-center max-w-[320px] mb-1.5"
            style={{ color: 'var(--paper-fg)' }}
            data-testid="text-landing-tagline"
          >
            {t("landing.tagline")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-center max-w-[280px] mb-8"
            style={{ color: 'var(--paper-secondary)' }}
          >
            {t("landing.subtitle")}
          </motion.p>
        </motion.div>

        <motion.a
          href="/api/login"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full paper-btn font-heading font-bold text-base mb-10"
          data-testid="button-login"
        >
          {t("landing.login")}
          <ArrowRight className="w-4 h-4" />
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full space-y-3 mb-8"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
              className="paper-card p-4 rounded-lg flex items-start gap-3"
              data-testid={`card-feature-${i}`}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--paper-active)' }}>
                <f.icon className="w-4 h-4" style={{ color: 'var(--paper-muted)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--paper-fg)' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--paper-secondary)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={toggle}
            className={btnClass}
            style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
            data-testid="button-landing-lang"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "中文" : "EN"}
          </button>
          <button
            onClick={toggleTheme}
            className={btnClass}
            style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
            data-testid="button-landing-theme"
          >
            {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
