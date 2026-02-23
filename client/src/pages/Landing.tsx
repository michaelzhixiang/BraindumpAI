import { motion } from "framer-motion";
import { Brain, Sparkles, Timer, ArrowRight, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AuroraBackground } from "@/components/AuroraBackground";

export default function Landing() {
  const { t, lang, toggle } = useI18n();

  const features = [
    { icon: Brain, title: t("landing.feature1"), desc: t("landing.feature1.desc") },
    { icon: Sparkles, title: t("landing.feature2"), desc: t("landing.feature2.desc") },
    { icon: Timer, title: t("landing.feature3"), desc: t("landing.feature3.desc") },
  ];

  return (
    <div className="app-container">
      <AuroraBackground />
      <div className="flex-1 overflow-y-auto relative z-10 flex flex-col items-center justify-center px-6 py-12">
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
              className="w-3 h-3 rounded-full bg-[#3B82F6] neon-dot"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-landing-title">
              BrainDump AI
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base text-foreground/80 text-center max-w-[320px] mb-1.5"
            data-testid="text-landing-tagline"
          >
            {t("landing.tagline")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-muted-foreground text-center max-w-[280px] mb-8"
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
          className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-base transition-colors neon-pulse mb-10"
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
              className="glass-card p-4 rounded-xl flex items-start gap-3"
              data-testid={`card-feature-${i}`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <f.icon className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={toggle}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground/80 transition-all neon-border-subtle"
          data-testid="button-landing-lang"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === "en" ? "中文" : "EN"}
        </motion.button>
      </div>
    </div>
  );
}
