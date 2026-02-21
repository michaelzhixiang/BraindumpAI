import { Link, useLocation } from "wouter";
import { Calendar, ListTodo, Inbox, Settings } from "lucide-react";
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
      <div className="w-full max-w-[480px] bg-background/80 backdrop-blur-xl border-t border-white/5 pb-6 pt-2 px-6">
        <ul className="flex justify-between items-center relative">
          {tabs.map((tab) => {
            const isActive = location === tab.href;
            return (
              <li key={tab.href} className="flex-1">
                <Link href={tab.href} className="flex flex-col items-center justify-center p-2 group relative">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-2 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    className={`w-6 h-6 transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
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
