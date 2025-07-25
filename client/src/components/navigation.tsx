import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Terminal, Menu, X, LogOut, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const preferred = storedTheme || "dark";
    setTheme(preferred);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(preferred);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      localStorage.removeItem("sessionId");
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    } catch (error) {
      localStorage.removeItem("sessionId");
      queryClient.clear();
      setLocation("/");
    }
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/challenges", label: "Challenges" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/my-progress", label: "My Progress", requireAuth: true },
    { path: "/admin", label: "Admin", requireAdmin: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div
              className="flex items-center space-x-4 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Terminal className="text-primary" />
              <span className="text-lg font-semibold">CTF Platform</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null;
              if (item.requireAdmin && (!user || !user.isAdmin)) return null;

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`transition-all duration-300 ${
                      location === item.path
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm">{user.username}</span>
                  <span className="text-xs text-muted-foreground">({user.score} pts)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-secondary border-b border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null;
              if (item.requireAdmin && (!user || !user.isAdmin)) return null;

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`block w-full text-left ${
                      location === item.path
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Theme Toggle in Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="text-foreground hover:text-primary w-full text-left"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>

            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-4">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm">{user.username}</span>
                  <span className="text-xs text-muted-foreground">({user.score} pts)</span>
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-left text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
