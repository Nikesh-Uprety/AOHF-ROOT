import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { IStorage } from './storage';
import type { User, Challenge, Submission, InsertUser, InsertChallenge } from '../shared/schema';

interface MongoUser extends Omit<User, 'id'> {
  _id?: any;
}

interface MongoChallenge extends Omit<Challenge, 'id'> {
  _id?: string;
}

interface MongoSubmission extends Omit<Submission, 'id' | 'userId' | 'challengeId'> {
  _id?: string;
  userId: string;
  challengeId: string;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private connectionString: string;
  private _db?: Db;
  private _users?: Collection<MongoUser>;
  private _challenges?: Collection<MongoChallenge>;
  private _submissions?: Collection<MongoSubmission>;
  private initialized = false;
  private idMap = new Map<number, string>(); // Maps integer IDs to ObjectId strings

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
        { username: 'DarkGambler', email: 'dark@example.com', score: 7950, challengesSolved: 8 },
        { username: 'Kharaonyx', email: 'kharaonyx@example.com', score: 5280, challengesSolved: 6 },
        { username: 'Potato', email: 'potato@example.com', score: 4715, challengesSolved: 5 },
        { username: 'MasterHacker', email: 'master@example.com', score: 4200, challengesSolved: 4 },
        { username: 'Old_Stranger', email: 'stranger@example.com', score: 2450, challengesSolved: 3 },
        { username: 'Sandro', email: 'sandro@example.com', score: 2100, challengesSolved: 2 },
        { username: 'WhiteHat90', email: 'whitehat@example.com', score: 1950, challengesSolved: 2 },
        { username: 'Shr3nm', email: 'shr3nm@example.com', score: 1800, challengesSolved: 1 },
        { username: 'OwlHacKer', email: 'owl@example.com', score: 1650, challengesSolved: 1 },
        { username: 'Hkaayanr', email: 'hkaayanr@example.com', score: 1500, challengesSolved: 1 }
      ];

      for (const user of sampleUsers) {
        const hashedPwd = await bcrypt.hash('password123', 10);
        await this.users.insertOne({
          ...user,
          password: hashedPwd,
          isAdmin: false,
          isEmailVerified: true,
          emailVerificationToken: null,
          createdAt: new Date()
        });
      }
    }

    const challengeCount = await this.challenges.countDocuments();
    if (challengeCount === 0) {
      const sampleChallenges = [
        { title: 'Space', description: 'Find the hidden flag in space exploration data', difficulty: 'EASY', points: 50, flag: 'CTF{space_explorer}', category: 'WEB' },
        { title: 'Stylish', description: 'CSS injection vulnerability', difficulty: 'EASY', points: 50, flag: 'CTF{css_master}', category: 'WEB' },
        { title: 'JWT Admin Elevation', description: 'Exploit JWT token to gain admin privileges', difficulty: 'EASY', points: 50, flag: 'CTF{jwt_admin}', category: 'WEB' },
        { title: 'Greeting', description: 'Command injection in greeting system', difficulty: 'MEDIUM', points: 250, flag: 'CTF{hello_world}', category: 'WEB' },
        { title: 'Javascript Puzzle', description: 'Reverse engineer JavaScript obfuscation', difficulty: 'EASY', points: 200, flag: 'CTF{js_puzzle}', category: 'WEB' },
        { title: 'Cookie', description: 'Cookie manipulation challenge', difficulty: 'EASY', points: 350, flag: 'CTF{cookie_monster}', category: 'WEB' },
        { title: 'Guestbook', description: 'XSS vulnerability in guestbook', difficulty: 'MEDIUM', points: 300, flag: 'CTF{guest_book}', category: 'WEB' },
        { title: 'SQL Injection 101', description: 'Basic SQL injection challenge', difficulty: 'EASY', points: 100, flag: 'CTF{sql_injection}', category: 'WEB' },
        { title: 'File Upload Bypass', description: 'Bypass file upload restrictions', difficulty: 'HARD', points: 500, flag: 'CTF{file_upload}', category: 'WEB' },
        { title: 'XXE Attack', description: 'XML External Entity attack', difficulty: 'MEDIUM', points: 400, flag: 'CTF{xxe_attack}', category: 'WEB' }
      ];

      await this.challenges.insertMany(sampleChallenges.map(challenge => ({
        ...challenge,
        isActive: true,
        downloadUrl: null,
        challengeSiteUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })));
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.ensureConnection();
    
    // Check if we have the ObjectId for this integer ID
    const objectIdString = this.idMap.get(id);
    if (objectIdString) {
      const user = await this.users.findOne({ _id: objectIdString });
      return user ? this.mongoUserToUser(user) : undefined;
    }
    
    // If not in map, search all users and rebuild mapping
    const users = await this.users.find({}).toArray();
    for (const user of users) {
      const intId = this.objectIdToInt(user._id!.toString());
      this.idMap.set(intId, user._id!.toString());
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
    return this.mongoUserToUser(newUser!);
  }

  async updateUserScore(userId: number, score: number): Promise<void> {
    await this.ensureConnection();
    await this.users.updateOne(
      { _id: userId.toString() },
      { $set: { score }, $inc: { challengesSolved: 1 } }
    );
  }

  async updateEmailVerification(userId: number, isVerified: boolean, token?: string): Promise<void> {
    await this.ensureConnection();
    await this.users.updateOne(
      { _id: userId.toString() },
      { $set: { isEmailVerified: isVerified, emailVerificationToken: token || null } }
    );
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
    const challenge = await this.challenges.findOne({ _id: id.toString() });
    return challenge ? this.mongoChallengeToChallenge(challenge) : undefined;
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
    return this.mongoChallengeToChallenge(newChallenge!);
  }

  async updateChallenge(id: number, insertChallenge: InsertChallenge): Promise<Challenge | undefined> {
    await this.ensureConnection();
    const result = await this.challenges.findOneAndUpdate(
      { _id: id.toString() },
      { $set: { ...insertChallenge, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result ? this.mongoChallengeToChallenge(result) : undefined;
  }

  async deleteChallenge(id: number): Promise<boolean> {
    await this.ensureConnection();
    const result = await this.challenges.deleteOne({ _id: id.toString() });
    return result.deletedCount > 0;
  }

  async createSubmission(submission: { userId: number; challengeId: number; flag: string; isCorrect: boolean }): Promise<Submission> {
    await this.ensureConnection();
    const result = await this.submissions.insertOne({
      userId: submission.userId.toString(),
      challengeId: submission.challengeId.toString(),
      flag: submission.flag,
      isCorrect: submission.isCorrect,
      submittedAt: new Date()
    });
    const newSubmission = await this.submissions.findOne({ _id: result.insertedId });
    return this.mongoSubmissionToSubmission(newSubmission!);
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    await this.ensureConnection();
    const submissions = await this.submissions.find({ userId: userId.toString() }).toArray();
    return submissions.map(submission => this.mongoSubmissionToSubmission(submission));
  }

  async hasUserSolvedChallenge(userId: number, challengeId: number): Promise<boolean> {
    await this.ensureConnection();
    const submission = await this.submissions.findOne({
      userId: userId.toString(),
      challengeId: challengeId.toString(),
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

  private objectIdToInt(objectId: string): number {
    // Create a consistent hash from ObjectId string
    let hash = 0;
    for (let i = 0; i < objectId.length; i++) {
      const char = objectId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private mongoUserToUser(mongoUser: MongoUser): User {
    // Convert MongoDB ObjectId to a unique integer ID
    const id = this.objectIdToInt(mongoUser._id!);
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

  private mongoChallengeToChallenge(mongoChallenge: MongoChallenge): Challenge {
    return {
      id: this.objectIdToInt(mongoChallenge._id!),
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

  private mongoSubmissionToSubmission(mongoSubmission: MongoSubmission): Submission {
    return {
      id: this.objectIdToInt(mongoSubmission._id!),
      userId: parseInt(mongoSubmission.userId),
      challengeId: parseInt(mongoSubmission.challengeId),
      flag: mongoSubmission.flag,
      isCorrect: mongoSubmission.isCorrect,
      submittedAt: mongoSubmission.submittedAt
    };
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}