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

// Animation variants for better performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Home() {
  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <TerminalWindow title="root@ctf-platform:~">
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="text-sm">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">cat welcome.txt</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center py-8"
              variants={itemVariants}
            >
              <motion.pre 
                className="ascii-art mb-6 text-xs md:text-sm text-primary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {asciiArt}
              </motion.pre>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h1 className="text-2xl md:text-4xl font-bold mb-4">
                  <Typewriter
                    text="ATTACK ON HASH FUNCTION"
                    delay={400}
                    speed={30}
                    className="animate-glow"
                  />
                </h1>
              </motion.div>
              
              <motion.p
                className="text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Welcome to the ultimate cybersecurity challenge platform. Test your skills, solve complex puzzles, and climb the leaderboard in this immersive hacking environment.
              </motion.p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="text-sm">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">ls -la features/</span>
              </div>
            </motion.div>
            
            <motion.div
              className="grid md:grid-cols-3 gap-6 mt-6"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="terminal-window rounded-lg p-6 hover:animate-pulse-green transition-all duration-300 cursor-pointer"
                  variants={featureVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="text-primary mb-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 1.2 + index * 0.1, 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <feature.icon size={32} />
                  </motion.div>
                  <motion.h3 
                    className="text-lg font-semibold mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="text-sm mt-8">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">tail -5 /var/log/leaderboard.log</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TopPlayersPreview />
            </motion.div>
            
            <motion.div
              className="text-center mt-8"
              variants={itemVariants}
            >
              <motion.div 
                className="flex gap-4 justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                <Link href="/auth">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 font-semibold transform hover:scale-105 transition-all duration-200"
                  >
                    JOIN CTF
                  </Button>
                </Link>
                <Link href="/challenges">
                  <Button 
                    size="lg"
                    className="bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 animate-pulse-green transform hover:scale-105 transition-all duration-200"
                  >
                    START HACKING
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </TerminalWindow>
      </div>
    </section>
  );
}

function TopPlayersPreview() {
  const { data: topPlayers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard?limit=5"],
  });

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-lg font-semibold mb-4 text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Top 5 CTF Players
      </motion.h3>
      
      <motion.div 
        className="space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          // Loading skeleton with animation
          Array.from({ length: 5 }).map((_, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-muted rounded animate-pulse" />
            </motion.div>
          ))
        ) : topPlayers?.length ? (
          topPlayers.map((player, index) => (
            <motion.div
              key={`${player.id}-${index}`}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border hover:bg-secondary/50 transition-colors duration-200"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-muted text-foreground'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                >
                  {index + 1}
                </motion.div>
                <span className="text-sm font-medium">{player.username}</span>
              </div>
              <span className="text-primary text-sm font-semibold">{player.score || 0} pts</span>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-center py-4"
            variants={itemVariants}
          >
            <p className="text-muted-foreground text-sm">No players on the leaderboard yet. Be the first!</p>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div 
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link href="/leaderboard">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 hover:scale-105 transition-all duration-200"
          >
            View Full Leaderboard →
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}