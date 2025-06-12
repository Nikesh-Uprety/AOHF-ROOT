import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Target, CheckCircle, XCircle, TrendingUp, BarChart3 } from "lucide-react";
import TerminalWindow from "@/components/terminal-window";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User, Challenge, Submission } from "@shared/schema";

interface CategoryProgress {
  category: string;
  solved: number;
  total: number;
  percentage: number;
}

interface ProgressStats {
  totalChallenges: number;
  solvedChallenges: number;
  totalSubmissions: number;
  correctSubmissions: number;
  successRate: number;
  categoryProgress: CategoryProgress[];
}

export default function MyProgress() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: progressData } = useQuery<ProgressStats>({
    queryKey: ["/api/user/progress"],
    enabled: !!user,
  });

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/user/submissions"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Please log in to view your progress.</div>
      </section>
    );
  }

  const progressStats = progressData || {
    totalChallenges: 0,
    solvedChallenges: 0,
    totalSubmissions: 0,
    correctSubmissions: 0,
    successRate: 0,
    categoryProgress: [],
  };

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <TerminalWindow title="progress@ctf-platform:~">
          <div className="mb-6">
            <div className="text-sm mb-4">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">python3 analyze_progress.py --user {user.username}</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">My Progress Dashboard</h2>
            <p className="text-muted-foreground">Track your CTF journey and achievements</p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="terminal-window rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-primary">{user.score || 0}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </motion.div>

            <motion.div
              className="terminal-window rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Target className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-primary">{progressStats.solvedChallenges}</div>
              <div className="text-sm text-muted-foreground">Challenges Solved</div>
            </motion.div>

            <motion.div
              className="terminal-window rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-primary">{progressStats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </motion.div>

            <motion.div
              className="terminal-window rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-primary">{progressStats.totalSubmissions}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </motion.div>
          </div>

          {/* Overall Progress */}
          <motion.div
            className="terminal-window rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4">Overall Challenge Progress</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Challenges Completed</span>
              <span className="text-sm">{progressStats.solvedChallenges} / {progressStats.totalChallenges}</span>
            </div>
            <Progress 
              value={progressStats.totalChallenges > 0 ? (progressStats.solvedChallenges / progressStats.totalChallenges) * 100 : 0} 
              className="h-3 mb-4"
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Solved: {progressStats.solvedChallenges}</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Remaining: {progressStats.totalChallenges - progressStats.solvedChallenges}</span>
              </div>
            </div>
          </motion.div>

          {/* Category Progress */}
          <motion.div
            className="terminal-window rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-6">Progress by Category</h3>
            <div className="space-y-6">
              {progressStats.categoryProgress.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-primary">
                        {category.category.toUpperCase()}
                      </Badge>
                      <span className="text-sm">{category.solved} / {category.total} solved</span>
                    </div>
                    <span className="text-sm text-primary font-semibold">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Chart Visualization */}
          <motion.div
            className="terminal-window rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Category Progress Visualization
            </h3>
            <div className="h-64 flex items-end justify-center gap-4 p-4">
              {progressStats.categoryProgress.map((category, index) => {
                const maxSolved = Math.max(...progressStats.categoryProgress.map(c => c.solved), 1);
                const height = (category.solved / maxSolved) * 200;
                const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={category.category} className="flex flex-col items-center">
                    <div className="text-xs text-primary mb-2 font-semibold">
                      {category.solved}
                    </div>
                    <motion.div
                      className="rounded-t-sm transition-all duration-1000 ease-out"
                      style={{ 
                        height: `${Math.max(height, 10)}px`, 
                        width: '40px',
                        backgroundColor: color
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 10)}px` }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                    />
                    <div className="text-xs text-center mt-2 max-w-[50px]">
                      {category.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.solved}/{category.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Submissions */}
          {submissions && submissions.length > 0 && (
            <motion.div
              className="terminal-window rounded-lg p-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-xl font-semibold mb-6">Recent Submissions</h3>
              <div className="space-y-3">
                {submissions.slice(-5).reverse().map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    className={`flex items-center justify-between p-3 rounded border ${
                      submission.isCorrect 
                        ? 'border-green-500/30 bg-green-500/10' 
                        : 'border-red-500/30 bg-red-500/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      {submission.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-mono">{submission.flag}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </TerminalWindow>
      </div>
    </section>
  );
}