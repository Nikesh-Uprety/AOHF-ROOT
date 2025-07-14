import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, submitFlagSchema, insertChallengeSchema, updateUsernameSchema, emailVerificationSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "./email-service";

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
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username is already registered. Please choose a different one.",
          field: "username",
          type: "username_exists"
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "Email is already registered. Try logging in instead.",
          field: "email",
          type: "email_exists"
        });
      }

      // Generate verification token and create user 
      const verificationToken = generateVerificationToken();
      const user = await storage.createUser(userData);
      
      // Set verification token for the user
      await storage.updateEmailVerification(user.id, false, verificationToken);

      // Send verification email
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with registration even if email fails
      }

      // Don't create session immediately - user needs to verify email first
      res.json({
        message: "Registration successful! Please check your Gmail to verify your email address.",
        redirectTo: "/verify-email"
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ 
          message: "No account found with this email.",
          field: "email",
          type: "email_not_found"
        });
      }

      const isValid = await bcrypt.compare(loginData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ 
          message: "Incorrect password. Please try again.",
          field: "password",
          type: "password_incorrect"
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({ 
          message: "Please verify your email in order to login.",
          needsVerification: true 
        });
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

  // Email verification endpoint
  app.get("/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).send(`
          <html>
            <head>
              <title>Verification Failed</title>
              <style>
                body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #ff0000; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; text-align: center; }
                .error { border: 2px solid #ff0000; padding: 20px; margin: 20px 0; }
                a { color: #00ff00; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>⚠️ Verification Failed</h1>
                <div class="error">
                  <p>Invalid or expired verification token.</p>
                  <p><a href="/auth">Return to Login</a></p>
                </div>
              </div>
            </body>
          </html>
        `);
      }

      // Update user verification status
      await storage.updateEmailVerification(user.id, true);

      res.send(`
        <html>
          <head>
            <title>Email Verified Successfully</title>
            <style>
              body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #00ff00; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; text-align: center; }
              .success { border: 2px solid #00ff00; padding: 20px; margin: 20px 0; }
              a { color: #00ff00; text-decoration: none; background: #003300; padding: 10px 20px; border: 1px solid #00ff00; }
              a:hover { background: #00ff00; color: #000; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Email Verified Successfully!</h1>
              <div class="success">
                <p>Your email has been verified. You can now log in to your account.</p>
                <p><a href="/auth">Continue to Login</a></p>
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send('Verification failed');
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

  app.get("/api/challenges/stats", async (req, res) => {
    const challenges = await storage.getAllChallenges();
    const stats = [];
    
    for (const challenge of challenges) {
      const submissions = await storage.getChallengeSubmissions(challenge.id);
      const correctSubmissions = submissions.filter((s: any) => s.isCorrect);
      const firstBloodSubmission = correctSubmissions.sort((a: any, b: any) => 
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      )[0];
      
      let firstBloodUser = null;
      if (firstBloodSubmission) {
        const user = await storage.getUser(firstBloodSubmission.userId);
        firstBloodUser = user?.username || 'Unknown';
      }
      
      stats.push({
        challengeId: challenge.id,
        solveCount: correctSubmissions.length,
        firstBlood: firstBloodUser,
        totalSubmissions: submissions.length
      });
    }
    
    res.json(stats);
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

  app.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // Check if username already exists (exclude current user)
      if (userData.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      // Check if email already exists (exclude current user)
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail && existingEmail.id !== id) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Get current user data and update
      const currentUser = await storage.getUser(id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData = {
        ...currentUser,
        ...userData
      };

      // If password is provided, hash it
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User settings routes
  app.put("/api/user/username", requireAuth, async (req: any, res) => {
    try {
      const { username } = updateUsernameSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const updatedUser = await storage.updateUsername(req.user.userId, username);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Username updated successfully", user: updatedUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user profile with detailed stats
  app.get("/api/user/profile/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const submissions = await storage.getUserSubmissions(id);
      const correctSubmissions = submissions.filter(s => s.isCorrect);
      const challenges = await storage.getAllChallenges();
      
      const solvedChallengeIds = new Set(correctSubmissions.map(s => s.challengeId));
      
      // Calculate category progress
      const categoryMap = new Map();
      challenges.forEach(challenge => {
        if (!categoryMap.has(challenge.category)) {
          categoryMap.set(challenge.category, { total: 0, solved: 0 });
        }
        const stats = categoryMap.get(challenge.category);
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

      const profile = {
        id: user.id,
        username: user.username,
        email: user.email,
        score: user.score,
        challengesSolved: user.challengesSolved,
        totalChallenges: challenges.length,
        solvedChallenges: solvedChallengeIds.size,
        totalSubmissions: submissions.length,
        correctSubmissions: correctSubmissions.length,
        successRate: submissions.length > 0 ? (correctSubmissions.length / submissions.length) * 100 : 0,
        categoryProgress,
        solvedChallengesList: correctSubmissions.map(s => ({
          challengeId: s.challengeId,
          challengeTitle: challenges.find(c => c.id === s.challengeId)?.title || 'Unknown',
          submittedAt: s.submittedAt
        }))
      };

      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}