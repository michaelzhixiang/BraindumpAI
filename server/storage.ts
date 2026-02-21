import { db } from "./db";
import {
  userState, priorities, tasks,
  type UserState, type Priority, type Task,
  type InsertPriority, type InsertTask,
  type UpdateUserStateRequest, type UpdateTaskRequest
} from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  // UserState
  getUserState(): Promise<UserState>;
  updateUserState(updates: UpdateUserStateRequest): Promise<UserState>;

  // Priorities
  getPriorities(): Promise<Priority[]>;
  createPriorities(items: InsertPriority[]): Promise<Priority[]>;

  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask & { parentId?: number }): Promise<Task>;
  createTasks(items: (InsertTask & { parentId?: number })[]): Promise<Task[]>;
  updateTask(id: number, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getTasksByContent(contents: string[]): Promise<Task[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserState(): Promise<UserState> {
    let [state] = await db.select().from(userState);
    if (!state) {
      [state] = await db.insert(userState).values({ screenTimeMinutes: 0, hasOnboarded: false }).returning();
    }
    return state;
  }

  async updateUserState(updates: UpdateUserStateRequest): Promise<UserState> {
    const state = await this.getUserState();
    const [updated] = await db.update(userState).set(updates).where(eq(userState.id, state.id)).returning();
    return updated;
  }

  async getPriorities(): Promise<Priority[]> {
    return await db.select().from(priorities);
  }

  async createPriorities(items: InsertPriority[]): Promise<Priority[]> {
    return await db.insert(priorities).values(items).returning();
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async createTask(task: InsertTask & { parentId?: number }): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async createTasks(items: (InsertTask & { parentId?: number })[]): Promise<Task[]> {
    if (items.length === 0) return [];
    return await db.insert(tasks).values(items).returning();
  }

  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    if (!updated) throw new Error("Task not found");
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTasksByContent(contents: string[]): Promise<Task[]> {
    if (contents.length === 0) return [];
    return await db.select().from(tasks).where(inArray(tasks.content, contents));
  }
}

export const storage = new DatabaseStorage();
