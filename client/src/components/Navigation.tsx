import { Link, useLocation } from "wouter";
import { Calendar, Inbox, ListTodo } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useI18n();

  const tabs = [
    { href: "/today", icon: Calendar, label: t("nav.today") },
    { href: "/dump", icon: Inbox, label: t("nav.dump") },
    { href: "/queue", icon: ListTodo, label: t("nav.queue") },
  ];

  return (
    <nav className="shrink-0 relative z-50">
      <div className="border-t border-white/[0.04] pb-1 pt-1 px-4">
        <ul className="flex justify-between items-center relative glass-card rounded-xl p-0.5 neon-border-subtle">
          {tabs.map((tab) => {
            const isActive = location === tab.href || (location === "/" && tab.href === "/dump");
            return (
              <li key={tab.href} className="flex-1">
                <Link href={tab.href} className="flex flex-col items-center justify-center py-1.5 group relative rounded-lg transition-colors">
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#3B82F6]/[0.08] rounded-lg neon-border-subtle"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    className={`w-4 h-4 transition-colors duration-200 relative z-10 ${
                      isActive ? "text-[#3B82F6]" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className={`text-[9px] mt-0.5 font-medium transition-colors duration-200 relative z-10 ${
                    isActive ? "text-foreground/90" : "text-muted-foreground/40"
                  }`}>
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
