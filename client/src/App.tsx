import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserState } from "@/hooks/use-user-state";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/lib/theme";

import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Today from "@/pages/Today";
import Dump from "@/pages/Dump";
import Queue from "@/pages/Queue";
import Landing from "@/pages/Landing";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";

function LoadingScreen() {
  return (
    <div className="app-container">
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--paper-fg)' }} />
            <span className="text-lg font-heading font-bold tracking-tight" style={{ color: 'var(--paper-fg)' }}>BrainDump</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--paper-fg)' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AuthenticatedContent() {
  const { data: userState, isLoading } = useUserState();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!userState?.hasOnboarded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Onboarding />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="app-container"
    >
      <Header />
      <div className="flex-1 min-h-0 flex flex-col relative z-10">
        <Switch>
          <Route path="/" component={Dump} />
          <Route path="/today" component={Today} />
          <Route path="/dump" component={Dump} />
          <Route path="/queue" component={Queue} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Navigation />
    </motion.div>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Landing />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthenticatedContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
