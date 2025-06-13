import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { IStorage } from './storage';
import type { User, Challenge, Submission, InsertUser, InsertChallenge } from '../shared/schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf_platform';

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private connectionString: string;
  private _db?: Db;
  private _users?: Collection;
  private _challenges?: Collection;
  private _submissions?: Collection;
  private initialized = false;
  private intToObjectIdMap = new Map<number, ObjectId>(); // Maps integer IDs to ObjectId
  private objectIdToIntMap = new Map<string, number>(); // Maps ObjectId strings to integer IDs

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    this.client = new MongoClient(connectionString);
  }

  private async ensureConnection() {
    if (!this.initialized) {
      await this.client.connect();
      this._db = this.client.db('ctf_platform');
      this._users = this._db.collection('users');
      this._challenges = this._db.collection('challenges');
      this._submissions = this._db.collection('submissions');
      
      // Create indexes
      await this._users.createIndex({ username: 1 }, { unique: true });
      await this._users.createIndex({ email: 1 }, { unique: true });
      
      // Initialize with sample data if collections are empty
      await this.initializeData();
      this.initialized = true;
    }
  }

  private get users() {
    if (!this._users) throw new Error('Database not connected');
    return this._users;
  }

  private get challenges() {
    if (!this._challenges) throw new Error('Database not connected');
    return this._challenges;
  }

  private get submissions() {
    if (!this._submissions) throw new Error('Database not connected');
    return this._submissions;
  }

  private async initializeData() {
    const userCount = await this.users.countDocuments();
    if (userCount === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin', 10);
      await this.users.insertOne({
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        isAdmin: true,
        score: 0,
        challengesSolved: 0,
        isEmailVerified: true,
        emailVerificationToken: null,
        createdAt: new Date()
      });

      // Create sample users
      const sampleUsers = [
        { username: 'DarkGambler', email: 'darkgambler@example.com', score: 1250 },
        { username: 'CyberNinja', email: 'cyberninja@example.com', score: 1100 },
        { username: 'BugHunter', email: 'bughunter@example.com', score: 950 },
        { username: 'ShellMaster', email: 'shellmaster@example.com', score: 800 },
        { username: 'CryptoKing', email: 'cryptoking@example.com', score: 750 }
      ];

      for (const user of sampleUsers) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await this.users.insertOne({
          ...user,
          password: hashedPassword,
          isAdmin: false,
          challengesSolved: Math.floor(user.score / 100),
          isEmailVerified: true,
          emailVerificationToken: null,
          createdAt: new Date()
        });
      }
    }

    const challengeCount = await this.challenges.countDocuments();
    if (challengeCount === 0) {
      const sampleChallenges = [
        {
          title: 'Space',
          description: 'Find the hidden message in this space-themed challenge.',
          difficulty: 'EASY',
          points: 100,
          flag: 'CTF{sp4c3_1s_c00l}',
          category: 'misc',
          isActive: true,
          downloadUrl: null,
          challengeSiteUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Buffer Overflow',
          description: 'Exploit this simple buffer overflow vulnerability.',
          difficulty: 'MEDIUM',
          points: 250,
          flag: 'CTF{buff3r_0v3rfl0w_m4st3r}',
          category: 'pwn',
          isActive: true,
          downloadUrl: null,
          challengeSiteUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'SQL Injection',
          description: 'Can you bypass the login using SQL injection?',
          difficulty: 'MEDIUM',
          points: 200,
          flag: 'CTF{sql_1nj3ct10n_k1ng}',
          category: 'web',
          isActive: true,
          downloadUrl: null,
          challengeSiteUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Reverse Engineering',
          description: 'Reverse this binary to find the flag.',
          difficulty: 'HARD',
          points: 500,
          flag: 'CTF{r3v3rs3_3ng1n33r1ng_pr0}',
          category: 'rev',
          isActive: true,
          downloadUrl: null,
          challengeSiteUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Cryptography',
          description: 'Decrypt this message to reveal the flag.',
          difficulty: 'HARD',
          points: 400,
          flag: 'CTF{cry0t0_m4st3r_h4ck3r}',
          category: 'crypto',
          isActive: true,
          downloadUrl: null,
          challengeSiteUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await this.challenges.insertMany(sampleChallenges);
    }
  }

  private objectIdToInt(objectId: ObjectId): number {
    const objectIdString = objectId.toString();
    
    // Check if we already have this mapping
    if (this.objectIdToIntMap.has(objectIdString)) {
      return this.objectIdToIntMap.get(objectIdString)!;
    }
    
    // Create a consistent hash from ObjectId string - use first 8 characters for better distribution
    let hash = 0;
    const shortId = objectIdString.substring(0, 8);
    for (let i = 0; i < shortId.length; i++) {
      const char = shortId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    let intId = Math.abs(hash);
    
    // Ensure uniqueness by checking for collisions
    while (this.intToObjectIdMap.has(intId) && this.intToObjectIdMap.get(intId)!.toString() !== objectIdString) {
      intId = intId + 1;
    }
    
    // Store the mapping
    this.objectIdToIntMap.set(objectIdString, intId);
    this.intToObjectIdMap.set(intId, objectId);
    
    return intId;
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.ensureConnection();
    
    // Check if we have the ObjectId for this integer ID
    const objectId = this.intToObjectIdMap.get(id);
    if (objectId) {
      const user = await this.users.findOne({ _id: objectId });
      return user ? this.mongoUserToUser(user) : undefined;
    }
    
    // If not in map, search all users and rebuild mapping
    const users = await this.users.find({}).toArray();
    for (const user of users) {
      const intId = this.objectIdToInt(user._id);
      if (intId === id) {
        return this.mongoUserToUser(user);
      }
    }
    
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureConnection();
    const user = await this.users.findOne({ username });
    return user ? this.mongoUserToUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureConnection();
    const user = await this.users.findOne({ email });
    return user ? this.mongoUserToUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureConnection();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await this.users.insertOne({
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
      isAdmin: false,
      score: 0,
      challengesSolved: 0,
      isEmailVerified: false,
      emailVerificationToken: this.generateVerificationToken(),
      createdAt: new Date()
    });
    const newUser = await this.users.findOne({ _id: result.insertedId });
    return this.mongoUserToUser(newUser);
  }

  async updateUserScore(userId: number, score: number): Promise<void> {
    await this.ensureConnection();
    const objectId = this.intToObjectIdMap.get(userId);
    if (objectId) {
      await this.users.updateOne(
        { _id: objectId },
        { $inc: { score: score, challengesSolved: 1 } }
      );
    }
  }

  async updateEmailVerification(userId: number, isVerified: boolean, token?: string): Promise<void> {
    await this.ensureConnection();
    const objectId = this.intToObjectIdMap.get(userId);
    if (objectId) {
      await this.users.updateOne(
        { _id: objectId },
        { $set: { isEmailVerified: isVerified, emailVerificationToken: token || null } }
      );
    }
  }

  async getAllUsers(): Promise<User[]> {
    await this.ensureConnection();
    const users = await this.users.find({}).toArray();
    return users.map(user => this.mongoUserToUser(user));
  }

  async getAllChallenges(): Promise<Challenge[]> {
    await this.ensureConnection();
    const challenges = await this.challenges.find({ isActive: true }).toArray();
    return challenges.map(challenge => this.mongoChallengeToChallenge(challenge));
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    await this.ensureConnection();
    const objectId = this.intToObjectIdMap.get(id);
    if (objectId) {
      const challenge = await this.challenges.findOne({ _id: objectId });
      return challenge ? this.mongoChallengeToChallenge(challenge) : undefined;
    }
    
    // If not in map, search all challenges
    const challenges = await this.challenges.find({}).toArray();
    for (const challenge of challenges) {
      const intId = this.objectIdToInt(challenge._id);
      if (intId === id) {
        return this.mongoChallengeToChallenge(challenge);
      }
    }
    
    return undefined;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    await this.ensureConnection();
    const result = await this.challenges.insertOne({
      ...insertChallenge,
      isActive: true,
      downloadUrl: null,
      challengeSiteUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const newChallenge = await this.challenges.findOne({ _id: result.insertedId });
    return this.mongoChallengeToChallenge(newChallenge);
  }

  async updateChallenge(id: number, insertChallenge: InsertChallenge): Promise<Challenge | undefined> {
    await this.ensureConnection();
    const objectId = this.intToObjectIdMap.get(id);
    if (objectId) {
      const result = await this.challenges.findOneAndUpdate(
        { _id: objectId },
        { $set: { ...insertChallenge, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result ? this.mongoChallengeToChallenge(result) : undefined;
    }
    return undefined;
  }

  async deleteChallenge(id: number): Promise<boolean> {
    await this.ensureConnection();
    const objectId = this.intToObjectIdMap.get(id);
    if (objectId) {
      const result = await this.challenges.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    }
    return false;
  }

  async createSubmission(submission: { userId: number; challengeId: number; flag: string; isCorrect: boolean }): Promise<Submission> {
    await this.ensureConnection();
    const result = await this.submissions.insertOne({
      userId: submission.userId,
      challengeId: submission.challengeId,
      flag: submission.flag,
      isCorrect: submission.isCorrect,
      submittedAt: new Date()
    });
    const newSubmission = await this.submissions.findOne({ _id: result.insertedId });
    return this.mongoSubmissionToSubmission(newSubmission);
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    await this.ensureConnection();
    const submissions = await this.submissions.find({ userId }).toArray();
    return submissions.map(submission => this.mongoSubmissionToSubmission(submission));
  }

  async getChallengeSubmissions(challengeId: number): Promise<Submission[]> {
    await this.ensureConnection();
    const submissions = await this.submissions.find({ challengeId }).toArray();
    return submissions.map(submission => this.mongoSubmissionToSubmission(submission));
  }

  async hasUserSolvedChallenge(userId: number, challengeId: number): Promise<boolean> {
    await this.ensureConnection();
    const submission = await this.submissions.findOne({
      userId,
      challengeId,
      isCorrect: true
    });
    return !!submission;
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    await this.ensureConnection();
    const users = await this.users.find({ isAdmin: false })
      .sort({ score: -1 })
      .limit(limit)
      .toArray();
    return users.map(user => this.mongoUserToUser(user));
  }

  private mongoUserToUser(mongoUser: any): User {
    const id = this.objectIdToInt(mongoUser._id);
    return {
      id,
      username: mongoUser.username,
      email: mongoUser.email,
      password: mongoUser.password,
      isAdmin: mongoUser.isAdmin || false,
      score: mongoUser.score || 0,
      challengesSolved: mongoUser.challengesSolved || 0,
      isEmailVerified: mongoUser.isEmailVerified || false,
      emailVerificationToken: mongoUser.emailVerificationToken,
      createdAt: mongoUser.createdAt
    };
  }

  private mongoChallengeToChallenge(mongoChallenge: any): Challenge {
    return {
      id: this.objectIdToInt(mongoChallenge._id),
      title: mongoChallenge.title,
      description: mongoChallenge.description,
      difficulty: mongoChallenge.difficulty,
      points: mongoChallenge.points,
      flag: mongoChallenge.flag,
      category: mongoChallenge.category,
      isActive: mongoChallenge.isActive || true,
      downloadUrl: mongoChallenge.downloadUrl,
      challengeSiteUrl: mongoChallenge.challengeSiteUrl,
      createdAt: mongoChallenge.createdAt,
      updatedAt: mongoChallenge.updatedAt
    };
  }

  private mongoSubmissionToSubmission(mongoSubmission: any): Submission {
    return {
      id: this.objectIdToInt(mongoSubmission._id),
      userId: mongoSubmission.userId,
      challengeId: mongoSubmission.challengeId,
      flag: mongoSubmission.flag,
      isCorrect: mongoSubmission.isCorrect,
      submittedAt: mongoSubmission.submittedAt
    };
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

const storage = new MongoStorage(MONGODB_URI);
export { storage };