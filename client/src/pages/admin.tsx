import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import TerminalWindow from "@/components/terminal-window";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const asciiWarning = `
⚠️  RESTRICTED AREA  ⚠️
╔═══════════════════════════════════════╗
║  AUTHORIZED PERSONNEL ONLY            ║
║  UNAUTHORIZED ACCESS IS PROHIBITED    ║
║  ALL ACTIVITIES ARE LOGGED            ║
╚═══════════════════════════════════════╝
`;

export default function Admin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();
      
      if (data.user.isAdmin) {
        localStorage.setItem("sessionId", data.sessionId);
        toast({
          title: "Access Granted",
          description: "Welcome, Administrator.",
        });
        // Refresh page to update auth state
        window.location.reload();
      } else {
        toast({
          title: "Access Denied",
          description: "Administrator privileges required.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials or insufficient privileges.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.isAdmin) {
    return (
      <section className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl">
          <TerminalWindow title="admin@ctf-platform:~">
            <div className="mb-6">
              <div className="text-sm mb-4">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">sudo access admin_panel</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Administration Panel</h2>
              <p className="text-muted-foreground">Welcome, {user.username}</p>
            </div>
            
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Platform Status:</span>
                      <span className="text-green-500">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Users:</span>
                      <span className="text-primary">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Challenges:</span>
                      <span className="text-primary">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TerminalWindow>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        <TerminalWindow title="admin@ctf-platform:~">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-sm mb-4">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">sudo access admin_panel</span>
              </div>
            </div>
            
            {/* Error Display */}
            <motion.div
              className="terminal-window rounded-lg p-8 mb-8 bg-destructive/10 border-destructive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl font-bold text-destructive mb-4">404</div>
              <h2 className="text-2xl font-bold text-destructive mb-4">ACCESS DENIED</h2>
              <p className="text-muted-foreground mb-6">You do not have sufficient privileges to access this area.</p>
              
              <pre className="text-destructive text-xs mb-6 font-mono whitespace-pre">
                {asciiWarning}
              </pre>
            </motion.div>
            
            {/* Login Form */}
            <motion.div
              className="terminal-window rounded-lg p-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Administrator Login
              </h3>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">$</span>
                    <Input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">#</span>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 animate-pulse-green"
                >
                  {isSubmitting ? "AUTHENTICATING..." : "AUTHENTICATE"}
                </Button>
              </form>
              
              <div className="mt-4 text-xs text-muted-foreground text-center">
                <p>Attempting unauthorized access will result in IP logging and possible prosecution.</p>
              </div>
            </motion.div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  );
}
