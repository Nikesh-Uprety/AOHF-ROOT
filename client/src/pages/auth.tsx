import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TerminalWindow from "@/components/terminal-window";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", loginData);
      const data = await response.json();
      
      localStorage.setItem("sessionId", data.sessionId);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        username: registerData.username,
        password: registerData.password,
      });
      const data = await response.json();
      
      localStorage.setItem("sessionId", data.sessionId);
      toast({
        title: "Registration Successful",
        description: `Welcome to the platform, ${data.user.username}!`,
      });
      
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Username might already exist.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen p-4 flex items-center justify-center">
      <div className="container mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TerminalWindow title="auth@ctf-platform:~">
            <div className="mb-6">
              <div className="text-sm mb-4">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">./authenticate</span>
              </div>
              <h2 className="text-2xl font-bold text-center">Authentication Portal</h2>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">$</span>
                      <Input
                        id="login-username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                        placeholder="username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">#</span>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    {isSubmitting ? "AUTHENTICATING..." : "LOGIN"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">$</span>
                      <Input
                        id="register-username"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                        placeholder="username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">#</span>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">#</span>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    {isSubmitting ? "CREATING ACCOUNT..." : "REGISTER"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
}
