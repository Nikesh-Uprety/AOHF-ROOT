import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, submitFlagSchema, insertChallengeSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

// Simple session storage for demo
const sessions = new Map<string, { userId: number; isAdmin: boolean }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                     req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
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

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, isAdmin: user.isAdmin || false });

      res.json({
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          isAdmin: user.isAdmin, 
          score: user.score,
          challengesSolved: user.challengesSolved 
        },
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
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          isAdmin: user.isAdmin, 
          score: user.score,
          challengesSolved: user.challengesSolved 
        },
        sessionId,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                     req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
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
      email: user.email,
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

  // User progress routes
  app.get("/api/user/submissions", requireAuth, async (req, res) => {
    const submissions = await storage.getUserSubmissions(req.user.userId);
    res.json(submissions);
  });

  app.get("/api/user/progress", requireAuth, async (req, res) => {
    const submissions = await storage.getUserSubmissions(req.user.userId);
    const challenges = await storage.getAllChallenges();
    
    const correctSubmissions = submissions.filter(s => s.isCorrect);
    const solvedChallengeIds = new Set(correctSubmissions.map(s => s.challengeId));
    
    // Group challenges by category
    const categoryMap = new Map<string, { solved: number; total: number }>();
    
    challenges.forEach(challenge => {
      const category = challenge.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { solved: 0, total: 0 });
      }
      const stats = categoryMap.get(category)!;
      stats.total++;
      if (solvedChallengeIds.has(challenge.id)) {
        stats.solved++;
      }
    });

    const categoryProgress = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      solved: stats.solved,
      total: stats.total,
      percentage: stats.total > 0 ? (stats.solved / stats.total) * 100 : 0,
    }));

    res.json({
      totalChallenges: challenges.length,
      solvedChallenges: solvedChallengeIds.size,
      totalSubmissions: submissions.length,
      correctSubmissions: correctSubmissions.length,
      successRate: submissions.length > 0 ? (correctSubmissions.length / submissions.length) * 100 : 0,
      categoryProgress,
    });
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await storage.getLeaderboard(limit);
    
    // Don't send sensitive data
    const safeLeaderboard = leaderboard.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      score: user.score,
      challengesSolved: user.challengesSolved,
    }));
    
    res.json(safeLeaderboard);
  });

  // Admin routes
  app.get("/api/admin/challenges", requireAuth, requireAdmin, async (req, res) => {
    const challenges = await storage.getAllChallenges();
    res.json(challenges); // Admin can see flags
  });

  app.post("/api/admin/challenges", requireAuth, requireAdmin, async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/challenges/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const challengeData = insertChallengeSchema.parse(req.body);
      const updatedChallenge = await storage.updateChallenge(id, challengeData);
      if (!updatedChallenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(updatedChallenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/challenges/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChallenge(id);
      if (!deleted) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json({ message: "Challenge deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  });

  const httpServer = createServer(app);
  return httpServer;
}