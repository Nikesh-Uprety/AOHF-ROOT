import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Key, Network, Bug, Code, Search, Shield, CheckCircle, Filter, SortAsc, Trophy, Clock, AlertCircle, Download, ExternalLink } from "lucide-react";
import TerminalWindow from "@/components/terminal-window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Challenge } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

const categoryIcons = {
  web: Code,
  crypto: Key,
  network: Network,
  pwn: Bug,
  rev: Search,
  forensics: Shield,
  misc: Lock,
  default: Lock
};

const difficultyColors: { [key: string]: string } = {
  EASY: "text-green-400 border-green-400",
  MEDIUM: "text-yellow-400 border-yellow-400", 
  HARD: "text-red-400 border-red-400"
};

const difficultyOrder: { [key: string]: number } = { EASY: 1, MEDIUM: 2, HARD: 3 };

interface ChallengeCardProps {
  challenge: Challenge;
  icon: React.ComponentType<any>;
  difficultyColor: string;
  isSolved?: boolean;
  firstBlood?: string;
  solveCount?: number;
}

function ChallengeCard({ challenge, icon: Icon, difficultyColor, isSolved, firstBlood, solveCount }: ChallengeCardProps) {
  const [flag, setFlag] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [canSubmit, setCanSubmit] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Rate limiting - 15 seconds between submissions
  const checkSubmissionCooldown = () => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const cooldownPeriod = 15000; // 15 seconds
    
    if (timeSinceLastSubmission < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastSubmission) / 1000);
      setCountdown(remainingTime);
      setCanSubmit(false);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanSubmit(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return false;
    }
    return true;
  };

  const submitFlagMutation = useMutation({
    mutationFn: async (flagValue: string) => {
      if (!checkSubmissionCooldown()) {
        throw new Error(`Please wait ${countdown} seconds before submitting again`);
      }
      
      setLastSubmissionTime(Date.now());
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
        queryClient.invalidateQueries({ queryKey: ["/api/user/submissions"] });
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
      <Card className={`h-full border-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ${
        isSolved ? 'bg-green-500/10 border-green-500/30' : 'bg-secondary/30 hover:bg-secondary/50'
      }`}>
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-lg text-primary group-hover:text-primary/80">
                {challenge.title}
              </h3>
              {isSolved && <CheckCircle className="w-5 h-5 text-green-400" />}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-primary">{challenge.points} pts</span>
            </div>
          </div>
          
          <div className="text-muted-foreground text-sm mb-4 flex-1">
            <p className="whitespace-pre-wrap">{challenge.description}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`${difficultyColor} text-xs`}>
                  {challenge.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                  {challenge.category?.toUpperCase() || 'MISC'}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{solveCount || 0} solves</span>
            </div>

            {firstBlood && (
              <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">First Blood: {firstBlood}</span>
              </div>
            )}

            {/* Attachment Links */}
            {(challenge.attachment || challenge.downloadUrl) && (
              <div className="flex gap-2 mb-3">
                {challenge.attachment && (
                  <a 
                    href={challenge.attachment} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1 bg-primary/10 rounded"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Challenge Site
                  </a>
                )}
                {challenge.downloadUrl && (
                  <a 
                    href={challenge.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1 bg-primary/10 rounded"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                )}
              </div>
            )}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className={`w-full ${isSolved ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/80'} text-primary-foreground`}
                  disabled={isSolved}
                >
                  {isSolved ? 'Completed' : 'Solve Challenge'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="bg-secondary border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Icon className="text-primary" />
                    <span>{challenge.title}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Submit your flag solution for this challenge.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {!canSubmit && countdown > 0 && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Rate limited: Please wait {countdown} seconds before submitting again.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Challenge Description</Label>
                    <div className="text-muted-foreground text-sm whitespace-pre-wrap bg-secondary/50 p-3 rounded border">
                      {challenge.description}
                    </div>
                  </div>

                  {/* Attachment Links in Dialog */}
                  {(challenge.attachment || challenge.downloadUrl) && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Resources</Label>
                      <div className="flex gap-2">
                        {challenge.attachment && (
                          <a 
                            href={challenge.attachment} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline px-3 py-2 bg-primary/10 rounded border border-primary/20"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Challenge Site
                          </a>
                        )}
                        {challenge.downloadUrl && (
                          <a 
                            href={challenge.downloadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline px-3 py-2 bg-primary/10 rounded border border-primary/20"
                          >
                            <Download className="w-4 h-4" />
                            Download Files
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="flag-input" className="text-sm font-medium mb-2 block">
                        Submit Flag
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">
                          CTF{"{"}
                        </span>
                        <Input
                          id="flag-input"
                          type="text"
                          value={flag}
                          onChange={(e) => setFlag(e.target.value)}
                          className="pl-16 bg-background border-border text-primary font-mono focus:border-primary"
                          placeholder="your_flag_here}"
                          required
                          disabled={!canSubmit}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        disabled={submitFlagMutation.isPending || !canSubmit}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {submitFlagMutation.isPending ? "SUBMITTING..." : !canSubmit ? `WAIT ${countdown}s` : "SUBMIT FLAG"}
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [pointsFilter, setPointsFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("difficulty");
  const [showSolvedOnly, setShowSolvedOnly] = useState(false);

  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: userSubmissions } = useQuery<any[]>({
    queryKey: ["/api/user/submissions"],
    enabled: true,
  });

  const { data: challengeStats } = useQuery<any[]>({
    queryKey: ["/api/challenges/stats"],
    enabled: true,
  });

  // Get solved challenge IDs
  const solvedChallengeIds = useMemo(() => {
    if (!userSubmissions) return new Set<number>();
    return new Set(
      userSubmissions
        .filter((sub: any) => sub.isCorrect)
        .map((sub: any) => sub.challengeId)
    );
  }, [userSubmissions]);

  // Filter and sort challenges
  const filteredAndSortedChallenges = useMemo(() => {
    if (!challenges) return [];

    let filtered = challenges.filter(challenge => {
      const categoryMatch = categoryFilter === "all" || challenge.category === categoryFilter;
      const difficultyMatch = difficultyFilter === "all" || challenge.difficulty === difficultyFilter;
      const pointsMatch = pointsFilter === "all" || 
        (pointsFilter === "low" && challenge.points <= 200) ||
        (pointsFilter === "medium" && challenge.points > 200 && challenge.points <= 400) ||
        (pointsFilter === "high" && challenge.points > 400);
      
      const isSolved = solvedChallengeIds.has(challenge.id);
      const solvedMatch = !showSolvedOnly || isSolved;

      return categoryMatch && difficultyMatch && pointsMatch && solvedMatch;
    });

    // Sort challenges
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "difficulty":
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "points":
          return a.points - b.points;
        case "title":
          return a.title.localeCompare(b.title);
        case "category":
          return (a.category || "misc").localeCompare(b.category || "misc");
        default:
          return 0;
      }
    });

    return filtered;
  }, [challenges, categoryFilter, difficultyFilter, pointsFilter, sortBy, showSolvedOnly, solvedChallengeIds]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!challenges) return [];
    return Array.from(new Set(challenges.map(c => c.category).filter(Boolean)));
  }, [challenges]);

  if (isLoading) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Loading challenges...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4">
      <TerminalWindow title="ctf-challenges">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-primary mb-2">CTF Challenges</h1>
            <p className="text-muted-foreground">
              Test your skills across various cybersecurity domains
            </p>
          </motion.div>

          {/* Filters and Sorting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/30 p-4 rounded border border-border"
          >
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pointsFilter} onValueChange={setPointsFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Points" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Points</SelectItem>
                  <SelectItem value="low">Low (≤200)</SelectItem>
                  <SelectItem value="medium">Medium (201-400)</SelectItem>
                  <SelectItem value="high">High ({'>'}400)</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Sort by:</span>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showSolvedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSolvedOnly(!showSolvedOnly)}
              >
                {showSolvedOnly ? "Show All" : "Solved Only"}
              </Button>
            </div>
          </motion.div>

          {/* Challenge Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedChallenges.map((challenge, index) => {
              const categoryKey = challenge.category?.toLowerCase() || 'misc';
              const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons] || categoryIcons.default;
              const difficultyColor = difficultyColors[challenge.difficulty];
              const isSolved = solvedChallengeIds.has(challenge.id);
              const stats = challengeStats?.find((s: any) => s.challengeId === challenge.id);

              return (
                <motion.div
                  key={`${challenge.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    icon={Icon}
                    difficultyColor={difficultyColor}
                    isSolved={isSolved}
                    firstBlood={stats?.firstBlood}
                    solveCount={stats?.solveCount}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {filteredAndSortedChallenges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No challenges match your current filters.</p>
            </motion.div>
          )}
        </div>
      </TerminalWindow>
    </section>
  );
}