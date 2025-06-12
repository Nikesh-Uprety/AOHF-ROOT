import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Challenge } from "@shared/schema";

interface ChallengeCardProps {
  challenge: Challenge;
  icon: LucideIcon;
  difficultyColor: string;
}

export default function ChallengeCard({ challenge, icon: Icon, difficultyColor }: ChallengeCardProps) {
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
        // Refresh user data and leaderboard
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
      className="terminal-window rounded-lg p-6 hover:animate-pulse-green transition-all duration-300 group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className="text-primary" />
          <h3 className="font-semibold">{challenge.title}</h3>
        </div>
        <Badge className={`${difficultyColor} text-black font-semibold`}>
          {challenge.difficulty}
        </Badge>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">{challenge.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-primary text-sm">Points: {challenge.points}</span>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Badge variant="secondary">{challenge.category}</Badge>
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
    </motion.div>
  );
}
