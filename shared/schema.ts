import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";

export const userState = pgTable("user_state", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  screenTimeMinutes: integer("screen_time_minutes").notNull().default(0),
  hasOnboarded: boolean("has_onboarded").notNull().default(false),
});

export const priorities = pgTable("priorities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  tier: text("tier", { enum: ["focus", "backlog", "icebox"] }).notNull().default("focus"),
  status: text("status", { enum: ["pending", "completed"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  nudge: text("nudge"),
  nudgeCount: integer("nudge_count").notNull().default(0),
  parentId: integer("parent_id"),
});

export const insertUserStateSchema = createInsertSchema(userState);
export const insertPrioritySchema = createInsertSchema(priorities).omit({ id: true, userId: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, completedAt: true, nudge: true, nudgeCount: true, parentId: true, userId: true });

export type UserState = typeof userState.$inferSelect;
export type Priority = typeof priorities.$inferSelect;
export type Task = typeof tasks.$inferSelect;

export type InsertPriority = z.infer<typeof insertPrioritySchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type UpdateUserStateRequest = Partial<UserState>;
export type CreatePriorityRequest = InsertPriority;
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask> & { status?: "pending" | "completed", nudge?: string, nudgeCount?: number, parentId?: number };
export type ProcessBrainDumpRequest = { dumpText: string, priorities: string[] };

export type AIProcessedTasksResponse = {
  tasks: Array<{ content: string; tier: "focus" | "backlog" | "icebox" }>;
};
export type NudgeResponse = { nudge: string };
