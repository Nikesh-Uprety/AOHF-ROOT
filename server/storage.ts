import { users, challenges, submissions, type User, type InsertUser, type Challenge, type InsertChallenge, type Submission } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, score: number): Promise<void>;
  
  // Challenge operations
  getAllChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Submission operations
  createSubmission(submission: { userId: number; challengeId: number; flag: string; isCorrect: boolean }): Promise<Submission>;
  getUserSubmissions(userId: number): Promise<Submission[]>;
  hasUserSolvedChallenge(userId: number, challengeId: number): Promise<boolean>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  private submissions: Map<number, Submission>;
  private currentUserId: number;
  private currentChallengeId: number;
  private currentSubmissionId: number;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.submissions = new Map();
    this.currentUserId = 1;
    this.currentChallengeId = 1;
    this.currentSubmissionId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private async initializeData() {
    // Create admin user
    await this.createUser({
      username: "admin",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // password
    });
    const admin = this.users.get(1);
    if (admin) {
      admin.isAdmin = true;
      this.users.set(1, admin);
    }

    // Create sample users with scores
    const sampleUsers = [
      { username: "Cyber_Ninja", password: "hashed", score: 2450, challengesSolved: 12 },
      { username: "H4ck3r_Qu33n", password: "hashed", score: 2100, challengesSolved: 10 },
      { username: "Binary_Ghost", password: "hashed", score: 1875, challengesSolved: 9 },
      { username: "Script_Kiddie", password: "hashed", score: 1250, challengesSolved: 7 },
      { username: "Null_Pointer", password: "hashed", score: 950, challengesSolved: 6 },
    ];

    for (const user of sampleUsers) {
      const newUser = await this.createUser({ username: user.username, password: user.password });
      newUser.score = user.score;
      newUser.challengesSolved = user.challengesSolved;
      this.users.set(newUser.id, newUser);
    }

    // Create sample challenges
    const sampleChallenges = [
      {
        title: "SQL Injection 101",
        description: "Learn the basics of SQL injection attacks and how to exploit vulnerable databases.",
        difficulty: "EASY",
        points: 100,
        flag: "FLAG{sql_injection_basic}",
        category: "Web"
      },
      {
        title: "Cryptography Challenge",
        description: "Decrypt the secret message using various cryptographic techniques and algorithms.",
        difficulty: "MEDIUM",
        points: 250,
        flag: "FLAG{crypto_master}",
        category: "Crypto"
      },
      {
        title: "Network Analysis",
        description: "Analyze network traffic to identify malicious activities and security breaches.",
        difficulty: "HARD",
        points: 500,
        flag: "FLAG{network_detective}",
        category: "Network"
      },
      {
        title: "Binary Exploitation",
        description: "Exploit buffer overflow vulnerabilities in compiled binary executables.",
        difficulty: "HARD",
        points: 750,
        flag: "FLAG{buffer_overflow_pwn}",
        category: "Binary"
      },
      {
        title: "Web Application Security",
        description: "Identify and exploit common web application vulnerabilities like XSS and CSRF.",
        difficulty: "MEDIUM",
        points: 300,
        flag: "FLAG{web_app_hacker}",
        category: "Web"
      },
      {
        title: "Digital Forensics",
        description: "Investigate digital evidence to uncover hidden information and solve cyber crimes.",
        difficulty: "EASY",
        points: 150,
        flag: "FLAG{forensic_investigator}",
        category: "Forensics"
      }
    ];

    for (const challenge of sampleChallenges) {
      await this.createChallenge(challenge);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      score: 0,
      challengesSolved: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserScore(userId: number, score: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.score += score;
      user.challengesSolved += 1;
      this.users.set(userId, user);
    }
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(challenge => challenge.isActive);
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentChallengeId++;
    const challenge: Challenge = {
      ...insertChallenge,
      id,
      isActive: true,
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async createSubmission(submission: { userId: number; challengeId: number; flag: string; isCorrect: boolean }): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const newSubmission: Submission = {
      ...submission,
      id,
      submittedAt: new Date(),
    };
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(submission => submission.userId === userId);
  }

  async hasUserSolvedChallenge(userId: number, challengeId: number): Promise<boolean> {
    return Array.from(this.submissions.values()).some(
      submission => submission.userId === userId && submission.challengeId === challengeId && submission.isCorrect
    );
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => !user.isAdmin)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
