import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import TerminalWindow from "@/components/terminal-window";
import type { User } from "@shared/schema";

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return "bg-yellow-500"; // Gold
    case 2: return "bg-gray-300"; // Silver
    case 3: return "bg-orange-500"; // Bronze
    default: return "bg-muted";
  }
};

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard?limit=10"],
  });

  if (isLoading) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Loading leaderboard...</div>
      </section>
    );
  }

  const maxScore = Math.max(...(leaderboard?.map(p => p.score) || [1]), 1);

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">ATTACK ON HASH FUNCTION</h1>
          <p className="text-muted-foreground">
            Discord CTF Dynamic Scoreboard - Real-time tracking of competitors' progress and rankings
          </p>
        </div>

        {/* Bar Chart Section */}
        <TerminalWindow title="stats-visualization">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Top 10 CTF Competitors (Points Distribution)</h2>
            
            <div className="relative h-80 flex items-end justify-center space-x-2 px-4">
              {leaderboard?.slice(0, 10).map((player, index) => {
                const height = (player.score / maxScore) * 100;
                const barHeight = Math.max(height, 5); // Minimum height for visibility
                
                return (
                  <motion.div
                    key={player.id}
                    className="flex flex-col items-center group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Score display above bar */}
                    <div className="text-xs text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {player.score.toLocaleString()}
                    </div>
                    
                    {/* Bar */}
                    <motion.div
                      className="bg-primary rounded-t w-12 flex items-end justify-center relative"
                      style={{ height: `${barHeight}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      whileHover={{ 
                        backgroundColor: "hsl(120, 100%, 60%)",
                        scale: 1.05 
                      }}
                    >
                      {/* Height indicators */}
                      <div className="absolute -top-6 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {player.score}
                      </div>
                    </motion.div>
                    
                    {/* Username below bar */}
                    <div className="text-xs text-foreground mt-2 transform -rotate-45 origin-top-left w-16 text-left">
                      {player.username}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-80 flex flex-col justify-between text-xs text-muted-foreground py-4">
              <span>{maxScore.toLocaleString()}</span>
              <span>{Math.round(maxScore * 0.75).toLocaleString()}</span>
              <span>{Math.round(maxScore * 0.5).toLocaleString()}</span>
              <span>{Math.round(maxScore * 0.25).toLocaleString()}</span>
              <span>0</span>
            </div>
          </div>
        </TerminalWindow>

        {/* Leaderboard Table */}
        <TerminalWindow title="leaderboard@ctf-platform:~">
          <div className="mb-6">
            <div className="text-sm mb-4">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">python3 leaderboard.py --format table</span>
            </div>
          </div>
          
          {/* Table Header */}
          <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3">
            <div className="grid grid-cols-3 text-sm font-semibold">
              <div>RANK</div>
              <div>USER</div>
              <div className="text-right">POINTS</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="space-y-0">
            {leaderboard?.map((player, index) => (
              <motion.div
                key={player.id}
                className={`grid grid-cols-3 p-4 border-l border-r border-b border-border hover:bg-secondary/50 transition-colors ${
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
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-muted text-foreground'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">{player.username}</span>
                </div>
                
                <div className="flex items-center justify-end">
                  <span className="text-primary font-bold">{player.score.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          {!leaderboard?.length && (
            <div className="text-center py-12 border border-border rounded-b-lg">
              <p className="text-muted-foreground">No players on the leaderboard yet.</p>
            </div>
          )}
        </TerminalWindow>
      </div>
    </section>
  );
}
