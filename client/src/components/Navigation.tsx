import { Link, useLocation } from "wouter";
import { Calendar, Inbox, ListTodo } from "lucide-react";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();

  const tabs = [
    { href: "/today", icon: Calendar, label: "Today" },
    { href: "/dump", icon: Inbox, label: "Dump" },
    { href: "/queue", icon: ListTodo, label: "Queue" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-[480px] border-t border-white/[0.04] pb-6 pt-2 px-8" style={{ background: 'linear-gradient(to top, hsl(228 12% 4%) 60%, transparent)' }}>
        <ul className="flex justify-between items-center relative bg-white/[0.03] rounded-2xl p-1">
          {tabs.map((tab) => {
            const isActive = location === tab.href || (location === "/" && tab.href === "/today");
            return (
              <li key={tab.href} className="flex-1">
                <Link href={tab.href} className="flex flex-col items-center justify-center py-2.5 group relative rounded-xl transition-colors">
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    className={`w-5 h-5 transition-colors duration-200 relative z-10 ${
                      isActive ? "text-[hsl(var(--primary))]" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className={`text-[10px] mt-1 font-medium transition-colors duration-200 relative z-10 ${
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
