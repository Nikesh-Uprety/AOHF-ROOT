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
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [registerErrors, setRegisterErrors] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear previous errors
    setLoginErrors({ email: "", password: "" });
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", loginData);
      const data = await response.json();
      
      localStorage.setItem("sessionId", data.sessionId);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      // Redirect based on user role
      if (data.user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/my-progress");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      let errorMessage = "Email or password is incorrect.";
      let errorTitle = "Login Failed";
      let fieldErrors = { email: "", password: "" };
      
      try {
        // Check if error has a response (from fetch)
        if (error.response) {
          const errorData = await error.response.json();
          if (errorData.needsVerification) {
            errorTitle = "Email Verification Required";
            errorMessage = "Please verify your email in order to login.";
          } else if (errorData.message) {
            errorMessage = errorData.message;
            
            // Set field-specific errors
            if (errorData.field === "email") {
              fieldErrors.email = errorData.message;
            } else if (errorData.field === "password") {
              fieldErrors.password = errorData.message;
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // Use default error message
      }
      
      setLoginErrors(fieldErrors);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setRegisterErrors({ username: "", email: "", password: "", confirmPassword: "" });
    
    // Client-side validation
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterErrors({ ...registerErrors, confirmPassword: "Passwords do not match." });
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
        email: registerData.email,
        password: registerData.password,
      });
      const data = await response.json();
      
      toast({
        title: "Registration Successful",
        description: data.message || "Please check your Gmail to verify your email address.",
      });
      
      // Redirect to verify email page
      if (data.redirectTo) {
        setLocation(data.redirectTo);
      } else {
        setLocation("/verify-email");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "Username or email might already exist.";
      let errorTitle = "Registration Failed";
      let fieldErrors = { username: "", email: "", password: "", confirmPassword: "" };
      
      try {
        if (error.response) {
          const errorData = await error.response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
            
            // Set field-specific errors
            if (errorData.field === "username") {
              fieldErrors.username = errorData.message;
            } else if (errorData.field === "email") {
              fieldErrors.email = errorData.message;
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }
      
      setRegisterErrors(fieldErrors);
      
      toast({
        title: errorTitle,
        description: errorMessage,
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
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">@</span>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className={`pl-8 bg-secondary border-border text-primary font-mono focus:border-primary ${
                          loginErrors.email ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>
                    )}
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
                        className={`pl-8 bg-secondary border-border text-primary font-mono focus:border-primary ${
                          loginErrors.password ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {loginErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>
                    )}
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
                        className={`pl-8 bg-secondary border-border text-primary font-mono focus:border-primary ${
                          registerErrors.username ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="username"
                        required
                      />
                    </div>
                    {registerErrors.username && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.username}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">@</span>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className={`pl-8 bg-secondary border-border text-primary font-mono focus:border-primary ${
                          registerErrors.email ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    {registerErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.email}</p>
                    )}
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
                        className={`pl-8 bg-secondary border-border text-primary font-mono focus:border-primary ${
                          registerErrors.password ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {registerErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.password}</p>
                    )}
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
                        className={`pl-8 bg-secondary border-border text-primary font-mono focus:border-primary ${
                          registerErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {registerErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{registerErrors.confirmPassword}</p>
                    )}
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