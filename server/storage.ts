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
      { username: "DarkGambler", password: "hashed", score: 7950, challengesSolved: 35 },
      { username: "kharayorix", password: "hashed", score: 5400, challengesSolved: 28 },
      { username: "p0tato", password: "hashed", score: 4800, challengesSolved: 25 },
      { username: "MrBender", password: "hashed", score: 4400, challengesSolved: 23 },
      { username: "Oju D. Amaya", password: "hashed", score: 2600, challengesSolved: 18 },
      { username: "$sudo", password: "hashed", score: 2350, challengesSolved: 16 },
      { username: "Cyber_Ninja", password: "hashed", score: 2250, challengesSolved: 15 },
      { username: "H4ck3r_Qu33n", password: "hashed", score: 2100, challengesSolved: 14 },
      { username: "Binary_Ghost", password: "hashed", score: 1875, challengesSolved: 12 },
      { username: "Script_Kiddie", password: "hashed", score: 1650, challengesSolved: 11 },
      { username: "Null_Pointer", password: "hashed", score: 1450, challengesSolved: 10 },
      { username: "CodeBreaker", password: "hashed", score: 1350, challengesSolved: 9 },
      { username: "DeepWeb", password: "hashed", score: 1200, challengesSolved: 8 },
      { username: "CryptoKing", password: "hashed", score: 1100, challengesSolved: 7 },
      { username: "NetHunter", password: "hashed", score: 1000, challengesSolved: 6 },
      { username: "SQLNinja", password: "hashed", score: 950, challengesSolved: 6 },
      { username: "ByteMaster", password: "hashed", score: 850, challengesSolved: 5 },
      { username: "PacketSniff", password: "hashed", score: 800, challengesSolved: 5 },
      { username: "BinExploit", password: "hashed", score: 750, challengesSolved: 4 },
      { username: "WebPwner", password: "hashed", score: 700, challengesSolved: 4 },
      { username: "ForensicPro", password: "hashed", score: 650, challengesSolved: 3 },
      { username: "ReverseEng", password: "hashed", score: 600, challengesSolved: 3 },
      { username: "MemoryLeak", password: "hashed", score: 550, challengesSolved: 3 },
      { username: "BufferFlow", password: "hashed", score: 500, challengesSolved: 2 },
      { username: "ROPchain", password: "hashed", score: 450, challengesSolved: 2 },
      { username: "ShellCode", password: "hashed", score: 400, challengesSolved: 2 },
      { username: "XSSmaster", password: "hashed", score: 350, challengesSolved: 2 },
      { username: "CSRFkid", password: "hashed", score: 300, challengesSolved: 1 },
      { username: "SQLi_noob", password: "hashed", score: 250, challengesSolved: 1 },
      { username: "HashCrack", password: "hashed", score: 200, challengesSolved: 1 },
      { username: "Steganaut", password: "hashed", score: 150, challengesSolved: 1 },
      { username: "NmapUser", password: "hashed", score: 100, challengesSolved: 1 },
      { username: "WiresharkFan", password: "hashed", score: 100, challengesSolved: 1 },
      { username: "GDBnewbie", password: "hashed", score: 100, challengesSolved: 1 },
      { username: "Radare2kid", password: "hashed", score: 100, challengesSolved: 1 },
      { username: "IDAuser", password: "hashed", score: 100, challengesSolved: 1 },
      { username: "BurpSuite", password: "hashed", score: 50, challengesSolved: 0 },
      { username: "Metasploit", password: "hashed", score: 50, challengesSolved: 0 },
      { username: "Nessus_scan", password: "hashed", score: 50, challengesSolved: 0 },
      { username: "OpenVAS_pro", password: "hashed", score: 25, challengesSolved: 0 },
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
