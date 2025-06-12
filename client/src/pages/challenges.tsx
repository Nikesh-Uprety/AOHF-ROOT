import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Key, Network, Bug, Code, Search } from "lucide-react";
import TerminalWindow from "@/components/terminal-window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Challenge } from "@shared/schema";

const categoryIcons = {
  Web: Code,
  Crypto: Key,
  Network: Network,
  Binary: Bug,
  Forensics: Search,
  default: Lock
};

const difficultyColors = {
  EASY: "bg-green-500",
  MEDIUM: "bg-yellow-500", 
  HARD: "bg-red-500"
};

interface CompactChallengeCardProps {
  challenge: Challenge;
  icon: React.ComponentType<any>;
  difficultyColor: string;
}

function CompactChallengeCard({ challenge, icon: Icon, difficultyColor }: CompactChallengeCardProps) {
  const [flag, setFlag] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitFlagMutation = useMutation({
    mutationFn: async (flagValue: string) => {
      const response = await apiRequest("POST", `/api/challenges/${challenge.id}/submit`, {
        flag: flagValue,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.correct) {
        toast({
          title: "Correct Flag!",
          description: `Congratulations! You earned ${data.points} points.`,
        });
        setIsDialogOpen(false);
        setFlag("");
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      } else {
        toast({
          title: "Incorrect Flag",
          description: data.message || "Try again!",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit flag",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flag.trim()) {
      submitFlagMutation.mutate(flag.trim());
    }
  };

  return (
    <motion.div
      className="flex items-center justify-between p-3 bg-secondary/50 rounded border border-border hover:bg-secondary/80 transition-all"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center space-x-3 flex-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">{challenge.title}</span>
        <Badge className={`${difficultyColor} text-black text-xs px-2 py-0`}>
          {challenge.difficulty}
        </Badge>
        <span className="text-primary text-xs">+ {challenge.points}</span>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            SOLVE
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-secondary border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Icon className="text-primary" />
              <span>{challenge.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Challenge Description</Label>
              <p className="text-muted-foreground text-sm">{challenge.description}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="flag-input" className="text-sm font-medium mb-2 block">
                  Submit Flag
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">
                    FLAG{"{"}
                  </span>
                  <Input
                    id="flag-input"
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    className="pl-16 bg-background border-border text-primary font-mono focus:border-primary"
                    placeholder="your_flag_here}"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={submitFlagMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitFlagMutation.isPending ? "SUBMITTING..." : "SUBMIT FLAG"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function Challenges() {
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  if (isLoading) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Loading challenges...</div>
      </section>
    );
  }

  // Group challenges by category
  const challengesByCategory = challenges?.reduce((acc, challenge) => {
    const category = challenge.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>) || {};

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <TerminalWindow title="challenges@ctf-platform:~">
          <div className="mb-6">
            <div className="text-sm mb-4">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">cat challenges/available.txt</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Available Challenges</h2>
            <p className="text-muted-foreground">Select a challenge to test your cybersecurity skills</p>
          </div>
          
          <div className="space-y-8">
            {Object.entries(challengesByCategory).map(([category, categoryTasks], categoryIndex) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
                      <IconComponent className="w-5 h-5" />
                      <span>{category.toUpperCase()} Challenges</span>
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryTasks.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                      >
                        <CompactChallengeCard
                          challenge={challenge}
                          icon={IconComponent}
                          difficultyColor={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {!challenges?.length && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No challenges available at the moment.</p>
            </div>
          )}
        </TerminalWindow>
      </div>
    </section>
  );
}
