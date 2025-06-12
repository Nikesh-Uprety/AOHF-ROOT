import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Key, Network, Bug, Code, Search } from "lucide-react";
import TerminalWindow from "@/components/terminal-window";
import ChallengeCard from "@/components/challenge-card";
import type { Challenge } from "@shared/schema";

const categoryIcons = {
  Web: Code,
  Crypto: Key,
  Network: Network,
  Binary: Bug,
  Forensics: Search,
  default: Lock
};

const difficultyColors = {
  EASY: "bg-green-500",
  MEDIUM: "bg-yellow-500", 
  HARD: "bg-red-500"
};

export default function Challenges() {
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  if (isLoading) {
    return (
      <section className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-primary">Loading challenges...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <TerminalWindow title="challenges@ctf-platform:~">
          <div className="mb-6">
            <div className="text-sm mb-4">
              <span className="text-primary">root@ctf:~$</span>{" "}
              <span className="text-foreground">cat challenges/available.txt</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Available Challenges</h2>
            <p className="text-muted-foreground">Select a challenge to test your cybersecurity skills</p>
          </div>
          
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {challenges?.map((challenge, index) => {
              const IconComponent = categoryIcons[challenge.category as keyof typeof categoryIcons] || categoryIcons.default;
              const difficultyColor = difficultyColors[challenge.difficulty as keyof typeof difficultyColors];
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    icon={IconComponent}
                    difficultyColor={difficultyColor}
                  />
                </motion.div>
              );
            })}
          </motion.div>
          
          {!challenges?.length && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No challenges available at the moment.</p>
            </div>
          )}
        </TerminalWindow>
      </div>
    </section>
  );
}
