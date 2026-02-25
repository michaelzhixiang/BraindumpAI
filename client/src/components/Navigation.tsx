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
    <nav className="shrink-0 relative z-50" style={{ background: 'var(--paper-bg)', borderTop: '1px solid var(--paper-border)' }}>
      <div className="pb-1 pt-1 px-4">
        <ul className="flex justify-between items-center relative p-0.5">
          {tabs.map((tab) => {
            const isActive = location === tab.href || (location === "/" && tab.href === "/dump");
            return (
              <li key={tab.href} className="flex-1">
                <Link href={tab.href} className="flex flex-col items-center justify-center py-1.5 group relative rounded-lg transition-colors">
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'var(--paper-active)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    className="w-5 h-5 transition-colors duration-200 relative z-10"
                    style={{ color: isActive ? 'var(--paper-fg)' : 'var(--paper-subtle)' }}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span
                    className="font-mono text-[0.72rem] tracking-[0.5px] mt-0.5 transition-colors duration-200 relative z-10"
                    style={{ color: isActive ? 'var(--paper-fg)' : 'var(--paper-subtle)', fontWeight: isActive ? 500 : 400 }}
                  >
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
