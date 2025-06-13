import { motion } from "framer-motion";
import { Terminal, Flag, Trophy, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TerminalWindow from "@/components/terminal-window";
import Typewriter from "@/components/typewriter";
import type { User } from "@shared/schema";

const asciiArt = `
 █████╗  ██████╗ ██╗  ██╗███████╗
██╔══██╗██╔═══██╗██║  ██║██╔════╝
███████║██║   ██║███████║█████╗  
██╔══██║██║   ██║██╔══██║██╔══╝  
██║  ██║╚██████╔╝██║  ██║██║     
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     
`;

const features = [
  {
    icon: Flag,
    title: "Real-time Challenges",
    description: "Engage with dynamic CTF challenges that test your cybersecurity knowledge and skills."
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description: "Track your progress and compete with other security enthusiasts in real-time."
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Built with industry-standard security practices to ensure a safe learning environment."
  }
];

export default function Home() {
  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <TerminalWindow title="root@ctf-platform:~">
          <div className="space-y-4">
            <div className="text-sm">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">cat welcome.txt</span>
            </div>
            
            <div className="text-center py-8">
              <pre className="ascii-art mb-6 text-xs md:text-sm text-primary">
                {asciiArt}
              </pre>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <h1 className="text-2xl md:text-4xl font-bold mb-4">
                  <Typewriter
                    text="ATTACK ON HASH FUNCTION"
                    delay={1000}
                    speed={50}
                    className="animate-glow"
                  />
                </h1>
              </motion.div>
              
              <motion.p
                className="text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
              >
                Welcome to the ultimate cybersecurity challenge platform. Test your skills, solve complex puzzles, and climb the leaderboard.
              </motion.p>
            </div>
            
            <div className="text-sm">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">ls -la features/</span>
            </div>
            
            <motion.div
              className="grid md:grid-cols-3 gap-6 mt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="terminal-window rounded-lg p-6 hover:animate-pulse-green transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 + index * 0.2 }}
                >
                  <div className="text-primary mb-3">
                    <feature.icon size={32} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
            
            <div className="text-sm mt-8">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">tail -5 /var/log/leaderboard.log</span>
            </div>
            
            <TopPlayersPreview />
            
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4 }}
            >
              <div className="flex gap-4 justify-center">
                <Link href="/auth">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 font-semibold"
                  >
                    JOIN CTF
                  </Button>
                </Link>
                <Link href="/challenges">
                  <Button 
                    size="lg"
                    className="bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 animate-pulse-green"
                  >
                    START HACKING
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  );
}

function TopPlayersPreview() {
  const { data: topPlayers } = useQuery<User[]>({
    queryKey: ["/api/leaderboard?limit=5"],
  });

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.5 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-primary">Top 5 CTF Players</h3>
      <div className="space-y-2">
        {topPlayers?.map((player, index) => (
          <motion.div
            key={`${player.id}-${index}`}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3.7 + index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' :
                index === 1 ? 'bg-gray-300 text-black' :
                index === 2 ? 'bg-orange-500 text-black' :
                'bg-muted text-foreground'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm font-medium">{player.username}</span>
            </div>
            <span className="text-primary text-sm font-semibold">{player.score || 0} pts</span>
          </motion.div>
        ))}
        
        {!topPlayers?.length && (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No players on the leaderboard yet. Be the first!</p>
          </div>
        )}
      </div>
      
      <div className="text-center mt-4">
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View Full Leaderboard →
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
