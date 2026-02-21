import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserState } from "@/hooks/use-user-state";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Today from "@/pages/Today";
import Dump from "@/pages/Dump";
import Queue from "@/pages/Queue";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { AuroraBackground } from "@/components/AuroraBackground";

function AppContent() {
  const { data: userState, isLoading } = useUserState();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!userState?.hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="app-container">
      <AuroraBackground />
      <Header />
      <div className="flex-1 overflow-y-auto relative z-10">
        <Switch>
          <Route path="/" component={Dump} />
          <Route path="/today" component={Today} />
          <Route path="/dump" component={Dump} />
          <Route path="/queue" component={Queue} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
