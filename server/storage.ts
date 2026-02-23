import { db } from "./db";
import {
  userState, priorities, tasks,
  type UserState, type Priority, type Task,
  type InsertPriority, type InsertTask,
  type UpdateUserStateRequest, type UpdateTaskRequest
} from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface IStorage {
  getUserState(userId: string): Promise<UserState>;
  updateUserState(userId: string, updates: UpdateUserStateRequest): Promise<UserState>;
  getPriorities(userId: string): Promise<Priority[]>;
  createPriorities(userId: string, items: InsertPriority[]): Promise<Priority[]>;
  getTasks(userId: string): Promise<Task[]>;
  createTask(userId: string, task: InsertTask & { parentId?: number }): Promise<Task>;
  createTasks(userId: string, items: (InsertTask & { parentId?: number })[]): Promise<Task[]>;
  updateTask(userId: string, id: number, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(userId: string, id: number): Promise<void>;
  getTasksByContent(userId: string, contents: string[]): Promise<Task[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserState(userId: string): Promise<UserState> {
    let [state] = await db.select().from(userState).where(eq(userState.userId, userId));
    if (!state) {
      [state] = await db.insert(userState).values({ userId, screenTimeMinutes: 0, hasOnboarded: false }).returning();
    }
    return state;
  }

  async updateUserState(userId: string, updates: UpdateUserStateRequest): Promise<UserState> {
    const state = await this.getUserState(userId);
    const [updated] = await db.update(userState).set(updates).where(eq(userState.id, state.id)).returning();
    return updated;
  }

  async getPriorities(userId: string): Promise<Priority[]> {
    return await db.select().from(priorities).where(eq(priorities.userId, userId));
  }

  async createPriorities(userId: string, items: InsertPriority[]): Promise<Priority[]> {
    const withUserId = items.map(item => ({ ...item, userId }));
    return await db.insert(priorities).values(withUserId).returning();
  }

  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(userId: string, task: InsertTask & { parentId?: number }): Promise<Task> {
    const [created] = await db.insert(tasks).values({ ...task, userId }).returning();
    return created;
  }

  async createTasks(userId: string, items: (InsertTask & { parentId?: number })[]): Promise<Task[]> {
    if (items.length === 0) return [];
    const withUserId = items.map(item => ({ ...item, userId }));
    return await db.insert(tasks).values(withUserId).returning();
  }

  async updateTask(userId: string, id: number, updates: UpdateTaskRequest & { completedAt?: string }): Promise<Task> {
    const dbUpdates: any = { ...updates };
    if (updates.completedAt) {
      dbUpdates.completedAt = new Date(updates.completedAt);
    }
    const [updated] = await db.update(tasks).set(dbUpdates).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();
    if (!updated) throw new Error("Task not found");
    return updated;
  }

  async deleteTask(userId: string, id: number): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async getTasksByContent(userId: string, contents: string[]): Promise<Task[]> {
    if (contents.length === 0) return [];
    return await db.select().from(tasks).where(and(eq(tasks.userId, userId), inArray(tasks.content, contents)));
  }
}

export const storage = new DatabaseStorage();
