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
      <div className="flex justify-between items-center px-6 pt-4 pb-2 relative z-10 shrink-0 border-b border-[#ddd5c8]">
        <h1 className="text-[1.9rem] font-bold tracking-tight text-[#2b2520] font-serif" data-testid="text-header-title">
          {t("header.title")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[1.5px] px-2.5 py-1.5 rounded-lg border border-[#ddd5c8] text-[#9e9484] hover:text-[#2b2520] transition-colors"
            data-testid="button-lang-toggle"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "中文" : "EN"}
          </button>
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1 font-mono text-[0.6rem] font-medium uppercase tracking-[1.5px] px-2.5 py-1.5 rounded-lg border border-[#ddd5c8] text-[#9e9484] hover:text-[#2b2520] transition-colors"
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2b2520]/40"
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
              <p className="text-[#2b2520] text-sm font-medium mb-5">
                {t("exit.confirm")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-[#ddd5c8] text-[#9e9484] hover:text-[#2b2520] transition-colors"
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
