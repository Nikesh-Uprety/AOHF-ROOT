import { motion } from "framer-motion";
import { Terminal, Flag, Trophy, Shield, Zap, Code, Users, Target, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TerminalWindow from "@/components/terminal-window";
import Typewriter from "@/components/typewriter";
import type { User } from "@shared/schema";

// Enhanced ASCII Art with better styling and symmetry
const enhancedAsciiArt = `
    ╔═══════════════════════════════════════════════════════════════╗
    ║  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  ║
    ║  ██  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  ██  ║
    ║  ██  ██████╗  ██████╗ ██╗  ██╗███████╗                ██  ║
    ║  ██  ██╔══██╗██╔═══██╗██║  ██║██╔════╝                ██  ║
    ║  ██  ███████║██║   ██║███████║█████╗                  ██  ║
    ║  ██  ██╔══██║██║   ██║██╔══██║██╔══╝                  ██  ║
    ║  ██  ██║  ██║╚██████╔╝██║  ██║██║                     ██  ║
    ║  ██  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝                     ██  ║
    ║  ██  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ██  ║
    ║  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ║
    ╚═══════════════════════════════════════════════════════════════╝
`;

const features = [
  {
    icon: Zap,
    title: "Real-time Challenges",
    description: "Dynamic CTF challenges that adapt to your skill level with instant feedback and scoring.",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description: "Compete with elite hackers worldwide in real-time rankings and achievement systems.",
    color: "from-purple-400 to-pink-500"
  },
  {
    icon: Shield,
    title: "Secure Infrastructure",
    description: "Military-grade security protocols ensuring a safe and fair competitive environment.",
    color: "from-blue-400 to-cyan-500"
  },
  {
    icon: Code,
    title: "Multi-Category",
    description: "Web, Crypto, Binary, Forensics, Network - master all domains of cybersecurity.",
    color: "from-green-400 to-emerald-500"
  }
];

// Animation variants
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
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const glowVariants = {
  initial: { boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)" },
  animate: {
    boxShadow: [
      "0 0 20px rgba(0, 255, 0, 0.3)",
      "0 0 40px rgba(0, 255, 0, 0.6)",
      "0 0 20px rgba(0, 255, 0, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-30"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center py-12">
            {/* Terminal Command Prompt */}
            <motion.div 
              className="text-left mb-8 font-mono text-sm text-primary/70"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-primary">root@battlefield:~$</span>{" "}
              <span className="text-foreground">./initialize_combat_zone.sh</span>
            </motion.div>

            {/* Enhanced ASCII Art */}
            <motion.div
              className="relative mb-8"
              variants={glowVariants}
              initial="initial"
              animate="animate"
            >
              <pre className="text-primary text-xs md:text-sm font-mono leading-tight bg-black/20 backdrop-blur-sm border border-primary/20 rounded-lg p-6 mx-auto max-w-4xl shadow-2xl">
                {enhancedAsciiArt}
              </pre>
            </motion.div>

            {/* Main Title with Typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                <Typewriter
                  text="ATTACK ON HASH FUNCTION"
                  delay={1000}
                  speed={50}
                  className="font-mono tracking-wider"
                />
              </h1>
              <div className="flex items-center justify-center gap-2 text-primary/60">
                <Terminal className="w-4 h-4" />
                <span className="font-mono text-sm animate-pulse">CYBER_WARFARE_INITIATED</span>
                <div className="w-2 h-4 bg-primary animate-pulse" />
              </div>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              Enter the digital battlefield where elite hackers forge their legends. 
              Master cryptographic puzzles, exploit vulnerabilities, and ascend the ranks 
              in the ultimate cybersecurity proving ground.
            </motion.p>
          </motion.div>

          {/* Terminal Separator */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 text-primary/40 font-mono text-sm"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span>[ SYSTEM_MODULES_LOADED ]</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground font-mono">
                &gt; COMBAT_SYSTEMS.exe
              </h2>
              <p className="text-muted-foreground">Advanced warfare capabilities at your disposal</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="relative bg-black/40 backdrop-blur-sm border border-primary/20 rounded-xl p-6 h-full hover:border-primary/40 transition-all duration-300 overflow-hidden">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Icon */}
                    <div className="relative z-10 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold mb-2 text-foreground font-mono">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Terminal Separator */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 text-primary/40 font-mono text-sm"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span>[ LEADERBOARD_SYNC_ACTIVE ]</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>

          {/* Elite Leaderboard Preview */}
          <motion.div variants={itemVariants}>
            <SystemLogLeaderboard />
          </motion.div>

          {/* Terminal Separator */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 text-primary/40 font-mono text-sm"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span>[ DEPLOYMENT_READY ]</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            variants={itemVariants}
            className="text-center py-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-foreground font-mono">
              &gt; INITIATE_COMBAT_SEQUENCE
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the ranks of elite cyber warriors. Your battlefield awaits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <CyberButton variant="primary" icon={Users}>
                  DEPLOY_AGENT
                </CyberButton>
              </Link>
              
              <Link href="/challenges">
                <CyberButton variant="secondary" icon={Target}>
                  SCAN_TARGETS
                </CyberButton>
              </Link>
            </div>

            {/* Status Indicator */}
            <motion.div 
              className="mt-8 flex items-center justify-center gap-2 text-primary/60 font-mono text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>SYSTEM_STATUS: OPERATIONAL</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// System Log Style Leaderboard Component
function SystemLogLeaderboard() {
  const { data: topPlayers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard?limit=5"],
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-foreground font-mono">
          &gt; ELITE_OPERATIVES.log
        </h2>
        <p className="text-muted-foreground">Real-time combat effectiveness rankings</p>
      </div>

      <div className="bg-black/60 backdrop-blur-sm border border-primary/30 rounded-xl p-6 font-mono text-sm">
        {/* Log Header */}
        <div className="text-primary/60 mb-4 pb-2 border-b border-primary/20">
          <span>[TIMESTAMP]</span>
          <span className="ml-8">[AGENT_ID]</span>
          <span className="ml-16">[COMBAT_SCORE]</span>
          <span className="ml-8">[STATUS]</span>
        </div>

        {/* Log Entries */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <motion.div
                key={index}
                className="flex items-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
              >
                <span className="text-primary/40">
                  {new Date().toISOString().slice(0, 19)}
                </span>
                <span className="ml-4 w-20 h-4 bg-muted/20 rounded animate-pulse" />
                <span className="ml-8 w-16 h-4 bg-muted/20 rounded animate-pulse" />
                <span className="ml-8 text-yellow-400">[SCANNING...]</span>
              </motion.div>
            ))
          ) : topPlayers?.length ? (
            topPlayers.map((player, index) => (
              <motion.div
                key={`${player.id}-${index}`}
                className="flex items-center hover:bg-primary/5 p-2 rounded transition-colors duration-200 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-primary/60">
                  {new Date().toISOString().slice(0, 19)}
                </span>
                <span className="ml-4 text-foreground font-semibold min-w-[120px]">
                  {player.username}
                </span>
                <span className="ml-8 text-primary font-bold">
                  {(player.score || 0).toLocaleString()}pts
                </span>
                <span className={`ml-8 ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-green-400'
                }`}>
                  [{index === 0 ? 'ELITE' : index === 1 ? 'VETERAN' : index === 2 ? 'EXPERT' : 'ACTIVE'}]
                </span>
                
                {/* Flickering Effect */}
                <motion.div
                  className="ml-2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-yellow-400">[WAITING_FOR_OPERATIVES...]</span>
            </div>
          )}
        </div>

        {/* Log Footer */}
        <div className="mt-6 pt-4 border-t border-primary/20 text-center">
          <Link href="/leaderboard">
            <motion.button
              className="text-primary hover:text-primary/80 font-mono text-sm flex items-center gap-2 mx-auto group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>&gt; ACCESS_FULL_RECORDS</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Cyber-styled Button Component
interface CyberButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

function CyberButton({ children, variant, icon: Icon, onClick }: CyberButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <motion.button
      className={`
        relative group px-8 py-4 font-mono font-bold text-sm tracking-wider
        border-2 rounded-lg overflow-hidden transition-all duration-300
        ${isPrimary 
          ? 'border-primary text-primary hover:text-black bg-transparent hover:bg-primary' 
          : 'border-muted-foreground text-muted-foreground hover:text-primary hover:border-primary'
        }
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Effect */}
      <div className={`
        absolute inset-0 transform scale-x-0 group-hover:scale-x-100 
        transition-transform duration-300 origin-left
        ${isPrimary ? 'bg-primary' : 'bg-primary/10'}
      `} />
      
      {/* Content */}
      <div className="relative flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span>{children}</span>
        <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
      
      {/* Glow Effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isPrimary ? 'shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'shadow-[0_0_20px_rgba(0,255,0,0.1)]'}
      `} />
    </motion.button>
  );
}