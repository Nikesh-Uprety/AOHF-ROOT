import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, submitFlagSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

// Simple session storage for demo
const sessions = new Map<string, { userId: number; isAdmin: boolean }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    const session = sessionId ? sessions.get(sessionId) : null;
    
    if (!session) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    req.user = session;
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, isAdmin: user.isAdmin || false });

      res.json({
        user: { id: user.id, username: user.username, isAdmin: user.isAdmin, score: user.score },
        sessionId,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(loginData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, isAdmin: user.isAdmin || false });

      res.json({
        user: { id: user.id, username: user.username, isAdmin: user.isAdmin, score: user.score },
        sessionId,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      score: user.score,
      challengesSolved: user.challengesSolved,
    });
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    const challenges = await storage.getAllChallenges();
    // Don't send the flag to the client
    const safeChallenges = challenges.map(({ flag, ...challenge }) => challenge);
    res.json(safeChallenges);
  });

  app.get("/api/challenges/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const challenge = await storage.getChallenge(id);
    
    if (!challenge || !challenge.isActive) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Don't send the flag
    const { flag, ...safeChallenge } = challenge;
    res.json(safeChallenge);
  });

  app.post("/api/challenges/:id/submit", requireAuth, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const submissionData = submitFlagSchema.parse({ ...req.body, challengeId });
      
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge || !challenge.isActive) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check if user already solved this challenge
      const alreadySolved = await storage.hasUserSolvedChallenge(req.user.userId, challengeId);
      if (alreadySolved) {
        return res.status(400).json({ message: "Challenge already solved" });
      }

      const isCorrect = submissionData.flag.trim() === challenge.flag.trim();
      
      // Create submission record
      await storage.createSubmission({
        userId: req.user.userId,
        challengeId,
        flag: submissionData.flag,
        isCorrect,
      });

      if (isCorrect) {
        // Update user score
        await storage.updateUserScore(req.user.userId, challenge.points);
        res.json({ 
          correct: true, 
          message: "Correct flag! Points awarded.",
          points: challenge.points 
        });
      } else {
        res.json({ 
          correct: false, 
          message: "Incorrect flag. Try again!" 
        });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await storage.getLeaderboard(limit);
    
    // Don't send sensitive data
    const safeLeaderboard = leaderboard.map(user => ({
      id: user.id,
      username: user.username,
      score: user.score,
      challengesSolved: user.challengesSolved,
    }));
    
    res.json(safeLeaderboard);
  });

  // Admin routes
  app.post("/api/admin/challenges", requireAuth, requireAdmin, async (req, res) => {
    try {
      const challengeData = req.body;
      const challenge = await storage.createChallenge(challengeData);
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
