import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  score: integer("score").default(0),
  challengesSolved: integer("challenges_solved").default(0),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // EASY, MEDIUM, HARD
  points: integer("points").notNull(),
  flag: text("flag").notNull(),
  category: text("category").notNull(),
  attachment: text("attachment"), // File attachment URL
  author: text("author"), // Challenge author name
  isActive: boolean("is_active").default(true),
  downloadUrl: text("download_url"), // For downloadable files
  challengeSiteUrl: text("challenge_site_url"), // For external challenge sites
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  flag: text("flag").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const emailVerificationSchema = z.object({
  token: z.string(),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  difficulty: true,
  points: true,
  flag: true,
  category: true,
  attachment: true,
  author: true,
});

export const submitFlagSchema = z.object({
  challengeId: z.number(),
  flag: z.string().min(1),
});

export const updateUsernameSchema = z.object({
  username: z.string().min(3).max(20),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type SubmitFlag = z.infer<typeof submitFlagSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateUsername = z.infer<typeof updateUsernameSchema>;
