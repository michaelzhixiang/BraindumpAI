import { useState } from "react";
import { Languages, LogOut, Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { lang, toggle, t } = useI18n();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const btnClass = "flex items-center gap-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[1.5px] px-2.5 py-1.5 rounded-lg transition-colors";

  return (
    <>
      <div className="flex justify-between items-center px-6 pt-4 pb-2 relative z-10 shrink-0" style={{ borderBottom: '1px solid var(--paper-border)' }}>
        <h1 className="text-[1.9rem] font-bold tracking-tight font-serif" style={{ color: 'var(--paper-fg)' }} data-testid="text-header-title">
          {t("header.title")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={btnClass}
            style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
            data-testid="button-lang-toggle"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "中文" : "EN"}
          </button>
          <button
            onClick={toggleTheme}
            className={btnClass}
            style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowExitDialog(true)}
            className={btnClass}
            style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'var(--paper-overlay)' }}
            onClick={() => setShowExitDialog(false)}
            data-testid="dialog-exit-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              className="paper-card rounded-lg p-6 mx-6 max-w-[320px] w-full text-center"
              onClick={(e) => e.stopPropagation()}
              data-testid="dialog-exit"
            >
              <p className="text-sm font-medium mb-5" style={{ color: 'var(--paper-fg)' }}>
                {t("exit.confirm")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors"
                  style={{ border: '1px solid var(--paper-border)', color: 'var(--paper-secondary)' }}
                  data-testid="button-exit-cancel"
                >
                  {t("exit.cancel")}
                </button>
                <a
                  href="/api/logout"
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold paper-btn text-center"
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
