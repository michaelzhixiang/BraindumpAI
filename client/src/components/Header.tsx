import { useState } from "react";
import { Languages, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { lang, toggle, t } = useI18n();
  const { user } = useAuth();
  const [showExitDialog, setShowExitDialog] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center px-6 pt-4 pb-2 relative z-10 shrink-0">
        <h1 className="text-base font-semibold tracking-tight text-foreground/90" data-testid="text-header-title">
          {t("header.title")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground/80 transition-all neon-border-subtle"
            data-testid="button-lang-toggle"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "中文" : "EN"}
          </button>
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground/80 transition-all neon-border-subtle"
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-2 h-2 rounded-full bg-[#3B82F6] neon-dot" />
        </div>
      </div>

      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExitDialog(false)}
            data-testid="dialog-exit-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              className="glass-card rounded-2xl p-6 mx-6 max-w-[320px] w-full neon-border-subtle text-center"
              onClick={(e) => e.stopPropagation()}
              data-testid="dialog-exit"
            >
              <p className="text-foreground/90 text-sm font-medium mb-5">
                {t("exit.confirm")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-muted-foreground transition-all"
                  data-testid="button-exit-cancel"
                >
                  {t("exit.cancel")}
                </button>
                <a
                  href="/api/logout"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all text-center"
                  data-testid="button-exit-confirm"
                >
                  {t("exit.yes")}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
