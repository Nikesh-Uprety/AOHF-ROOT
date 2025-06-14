import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import Challenges from "@/pages/challenges";
import Leaderboard from "@/pages/leaderboard";
import Admin from "@/pages/admin";
import Auth from "@/pages/auth";
import MyProgress from "@/pages/my-progress";
import UserProfile from "@/pages/user-profile";
import Settings from "@/pages/settings";
import VerifyEmail from "@/pages/verify-email";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Matrix background effect */}
      <div className="matrix-rain">
        <div className="absolute text-primary text-xs animate-[matrix_20s_linear_infinite]" style={{ left: '10%', animationDelay: '0s' }}>01001000</div>
        <div className="absolute text-primary text-xs animate-[matrix_20s_linear_infinite]" style={{ left: '30%', animationDelay: '2s' }}>11010101</div>
        <div className="absolute text-primary text-xs animate-[matrix_20s_linear_infinite]" style={{ left: '50%', animationDelay: '4s' }}>10101010</div>
        <div className="absolute text-primary text-xs animate-[matrix_20s_linear_infinite]" style={{ left: '70%', animationDelay: '6s' }}>01110011</div>
        <div className="absolute text-primary text-xs animate-[matrix_20s_linear_infinite]" style={{ left: '90%', animationDelay: '8s' }}>11001100</div>
      </div>
      
      <Navigation />
      <main className="pt-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/my-progress" component={MyProgress} />
          <Route path="/user/:id" component={UserProfile} />
          <Route path="/admin" component={Admin} />
          <Route path="/auth" component={Auth} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
