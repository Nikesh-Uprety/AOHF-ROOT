import { motion } from "framer-motion";
import TerminalWindow from "./terminal-window";
import type { User } from "@shared/schema";

interface LeaderboardChartProps {
  players: User[];
}

export default function LeaderboardChart({ players }: LeaderboardChartProps) {
  if (!players.length) {
    return (
      <TerminalWindow title="stats-visualization">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No data available for visualization.</p>
        </div>
      </TerminalWindow>
    );
  }

  const maxScore = Math.max(...players.map(p => p.score), 1);
  
  return (
    <TerminalWindow title="stats-visualization">
      <h3 className="text-xl font-semibold mb-6 text-center">Score Distribution</h3>
      <div className="space-y-4">
        {players.map((player, index) => {
          const percentage = (player.score / maxScore) * 100;
          
          return (
            <motion.div
              key={player.id}
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="w-20 text-sm text-right truncate">{player.username}</div>
              <div className="flex-1">
                <div className="bg-border rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="bg-primary h-full rounded-full animate-pulse-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.2, duration: 1 }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm">{player.score.toLocaleString()}</div>
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="text-sm text-muted-foreground">
          Last updated: <span id="last-updated">Live</span>
        </div>
      </motion.div>
    </TerminalWindow>
  );
}
