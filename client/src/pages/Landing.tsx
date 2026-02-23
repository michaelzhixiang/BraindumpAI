import { Brain, Sparkles, Timer, ArrowRight } from "lucide-react";
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
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] neon-dot" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-landing-title">
            BrainDump AI
          </h1>
        </div>

        <p className="text-base text-foreground/80 text-center max-w-[320px] mb-2" data-testid="text-landing-tagline">
          {t("landing.tagline")}
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-[280px] mb-8">
          {t("landing.subtitle")}
        </p>

        <a
          href="/api/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] mb-10"
          data-testid="button-login"
        >
          {t("landing.login")}
          <ArrowRight className="w-4 h-4" />
        </a>

        <div className="w-full space-y-3 mb-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card p-4 rounded-xl flex items-start gap-3"
              data-testid={`card-feature-${i}`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <f.icon className="w-4.5 h-4.5 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={toggle}
          className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground/80 transition-all neon-border-subtle"
          data-testid="button-landing-lang"
        >
          {lang === "en" ? "中文" : "EN"}
        </button>
      </div>
    </div>
  );
}
