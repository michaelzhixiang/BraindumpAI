import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { lang, toggle, t } = useI18n();

  return (
    <div className="flex justify-between items-center px-6 pt-4 pb-2 relative z-10">
      <h1 className="text-base font-semibold tracking-tight text-foreground/90" data-testid="text-header-title">
        {t("header.title")}
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground/80 transition-all neon-border-subtle"
          data-testid="button-lang-toggle"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === "en" ? "中文" : "EN"}
        </button>
        <div className="w-2 h-2 rounded-full bg-[#3B82F6] neon-dot" />
      </div>
    </div>
  );
}
