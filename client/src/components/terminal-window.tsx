import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TerminalWindowProps {
  children: ReactNode;
  title?: string;
}

export default function TerminalWindow({ children, title = "terminal" }: TerminalWindowProps) {
  return (
    <motion.div
      className="terminal-window rounded-xl p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 text-center text-xs text-muted-foreground">{title}</div>
      </div>
      
      {children}
    </motion.div>
  );
}
