import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export default function Typewriter({ text, delay = 0, speed = 100, className = "" }: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        setIsComplete(true);
      }
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [currentIndex, text, delay, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.span 
      className={`${className} ${isComplete ? 'neon-text' : ''}`}
      animate={isComplete ? { 
        textShadow: [
          "0 0 5px currentColor",
          "0 0 20px currentColor, 0 0 30px currentColor",
          "0 0 5px currentColor"
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {displayText}
      <span className={`inline-block w-0.5 h-6 bg-primary ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
      </span>
    </motion.span>
  );
}
