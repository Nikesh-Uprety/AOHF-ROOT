import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Key, Network, Bug, Code, Search, Zap, Shield } from "lucide-react";
import TerminalWindow from "@/components/terminal-window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Challenge } from "@shared/schema";

const categoryIcons = {
  WEB: Code,
  CRYPTO: Key,
  NETWORK: Network,
  BINARY: Bug,
  FORENSICS: Search,
  MISC: Shield,
  default: Lock
};

const difficultyColors = {
  EASY: "text-green-400 border-green-400",
  MEDIUM: "text-yellow-400 border-yellow-400", 
  HARD: "text-red-400 border-red-400"
};

interface ChallengeCardProps {
  challenge: Challenge;
  icon: React.ComponentType<any>;
  difficultyColor: string;
}

function ChallengeCard({ challenge, icon: Icon, difficultyColor }: ChallengeCardProps) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="h-full bg-secondary/30 border-border hover:bg-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-lg text-primary group-hover:text-primary/80">
                {challenge.title}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{challenge.points}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 flex-1">
            {challenge.description}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${difficultyColor} bg-transparent font-semibold`}
            >
              {challenge.difficulty}
            </Badge>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
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
          </div>
        </CardContent>
      </Card>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTasks.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                      >
                        <ChallengeCard
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
