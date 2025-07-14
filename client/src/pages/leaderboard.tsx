import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import TerminalWindow from "@/components/terminal-window";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Users, Star, Crown, Award, Shield, Code, Key, Network, Bug, Search, Lock } from "lucide-react";
import type { User } from "@shared/schema";

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600"; // Gold
    case 2: return "bg-gradient-to-r from-gray-300 to-gray-500"; // Silver
    case 3: return "bg-gradient-to-r from-orange-400 to-orange-600"; // Bronze
    default: return "bg-muted";
  }
};

const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2: return <Award className="w-5 h-5 text-gray-300" />;
    case 3: return <Trophy className="w-5 h-5 text-orange-400" />;
    default: return <Target className="w-4 h-4 text-muted-foreground" />;
  }
};

const categoryIcons = {
  WEB: Code,
  CRYPTO: Key,
  NETWORK: Network,
  PWNING: Bug,
  REVERSE: Search,
  FORENSICS: Shield,
  MISC: Lock,
};

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard?limit=50"],
  });

  const { data: challenges } = useQuery<any[]>({
    queryKey: ["/api/challenges"],
  });

  if (isLoading) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Loading leaderboard...</div>
      </section>
    );
  }

  const maxScore = Math.max(...(leaderboard?.map(p => p.score || 0) || [1]), 1);
  const totalChallenges = challenges?.length || 0;

  // Calculate category progress for top players
  const getCategoryProgress = (challengesSolved: number) => {
    const categories = ['WEB', 'CRYPTO', 'NETWORK', 'PWNING', 'REVERSE', 'FORENSICS', 'MISC'];
    const progress = categories.map(category => {
      const categoryCount = Math.floor(challengesSolved / categories.length);
      const remainder = challengesSolved % categories.length;
      const extra = categories.indexOf(category) < remainder ? 1 : 0;
      return {
        category,
        solved: categoryCount + extra,
        total: Math.ceil(totalChallenges / categories.length),
        percentage: Math.min(((categoryCount + extra) / Math.ceil(totalChallenges / categories.length)) * 100, 100)
      };
    });
    return progress;
  };

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">ATTACK ON HASH FUNCTION</h1>
          <p className="text-muted-foreground">
            Advanced CTF Progress Tracking - Real-time competitor analysis and category breakdown
          </p>
        </div>

        {/* Dynamic Bar Chart for Top 10 Players */}
        <div className="mb-8">
          <Card className="border-border bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top 10 Elite Performers - Real-time Score Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard?.slice(0, 10).map((player, index) => {
                  const percentage = ((player.score || 0) / maxScore) * 100;
                  const challengesSolved = player.challengesSolved || 0;
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-center space-x-3 p-2 rounded hover:bg-secondary/50 transition-colors">
                        <div className="flex-shrink-0 w-8 text-center">
                          <span className={`text-sm font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' :
                            'text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-shrink-0 w-24 text-left">
                          <span className="text-sm font-medium text-primary truncate">{player.username}</span>
                        </div>
                        
                        <div className="flex-1 relative">
                          <div className="bg-secondary/50 rounded-full h-6 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                'bg-gradient-to-r from-primary to-primary/80'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-foreground/90">
                              {(player.score || 0).toLocaleString()} pts
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 w-20 text-right">
                          <span className="text-xs text-muted-foreground">
                            {challengesSolved} solved
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Complete Leaderboard Table */}
        <TerminalWindow title="leaderboard@ctf-platform:~">
          <div className="mb-6">
            <div className="text-sm mb-4">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">python3 leaderboard.py --format table --full</span>
            </div>
          </div>
          
          {/* Table Header */}
          <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3">
            <div className="grid grid-cols-4 text-sm font-semibold">
              <div>RANK</div>
              <div>USER</div>
              <div className="text-center">SOLVED</div>
              <div className="text-right">POINTS</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="space-y-0">
            {leaderboard?.map((player, index) => (
              <motion.div
                key={player.id}
                className={`grid grid-cols-4 p-4 border-l border-r border-b border-border hover:bg-secondary/50 transition-colors ${
                  index === 0 ? 'bg-yellow-500/10' : 
                  index === 1 ? 'bg-gray-300/10' : 
                  index === 2 ? 'bg-orange-500/10' : 
                  'bg-background'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center space-x-3">
                  {getRankBadge(index + 1)}
                  <span className="text-sm font-medium">#{index + 1}</span>
                </div>
                
                <div className="flex items-center">
                  <Link href={`/user/${player.id}`} className="font-medium hover:text-primary transition-colors cursor-pointer">
                    {player.username}
                  </Link>
                </div>
                
                <div className="flex items-center justify-center">
                  <span className="text-sm">
                    {player.challengesSolved || 0}<span className="text-muted-foreground">/{totalChallenges}</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-end">
                  <span className="text-primary font-bold">{(player.score || 0).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </TerminalWindow>
          
        {!leaderboard?.length && (
          <div className="text-center py-12 border border-border rounded-b-lg">
            <p className="text-muted-foreground">No players on the leaderboard yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
