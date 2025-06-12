import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  score: integer("score").default(0),
  challengesSolved: integer("challenges_solved").default(0),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // EASY, MEDIUM, HARD
  points: integer("points").notNull(),
  flag: text("flag").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
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
  password: true,
});

export const loginSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  difficulty: true,
  points: true,
  flag: true,
  category: true,
});

export const submitFlagSchema = z.object({
  challengeId: z.number(),
  flag: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type SubmitFlag = z.infer<typeof submitFlagSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
