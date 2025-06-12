import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import TerminalWindow from "@/components/terminal-window";
import LeaderboardChart from "@/components/leaderboard-chart";
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
    queryKey: ["/api/leaderboard?limit=5"],
  });

  if (isLoading) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Loading leaderboard...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <TerminalWindow title="leaderboard@ctf-platform:~">
          <div className="mb-6">
            <div className="text-sm mb-4">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">python3 leaderboard.py --top 5</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Top 5 Hackers</h2>
            <p className="text-muted-foreground">Current competition standings</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Leaderboard Table */}
            <div className="space-y-4">
              {leaderboard?.map((player, index) => (
                <motion.div
                  key={player.id}
                  className="terminal-window rounded-lg p-4 flex items-center space-x-4 hover:animate-pulse-green transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankColor(index + 1)} text-black font-bold text-lg`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{player.username}</h3>
                    <p className="text-muted-foreground text-sm">{player.challengesSolved} challenges solved</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{player.score.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </motion.div>
              ))}
              
              {!leaderboard?.length && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No players on the leaderboard yet.</p>
                </div>
              )}
            </div>
            
            {/* Stats Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LeaderboardChart players={leaderboard || []} />
            </motion.div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  );
}
