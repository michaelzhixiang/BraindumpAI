import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  return text.trim();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.userState.get.path, async (req, res) => {
    const state = await storage.getUserState();
    res.json(state);
  });

  app.patch(api.userState.update.path, async (req, res) => {
    try {
      const input = api.userState.update.input.parse(req.body);
      const state = await storage.updateUserState(input);
      res.json(state);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.priorities.list.path, async (req, res) => {
    const items = await storage.getPriorities();
    res.json(items);
  });

  app.post(api.priorities.createMany.path, async (req, res) => {
    try {
      const input = api.priorities.createMany.input.parse(req.body);
      const items = await storage.createPriorities(input.priorities);
      res.status(201).json(items);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.tasks.list.path, async (req, res) => {
    const items = await storage.getTasks();
    res.json(items);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const item = await storage.createTask(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Error creating task" });
    }
  });

  app.post(api.tasks.createMany.path, async (req, res) => {
    try {
      const input = api.tasks.createMany.input.parse(req.body);
      const items = await storage.createTasks(input.tasks);
      res.status(201).json(items);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Error creating tasks" });
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const item = await storage.updateTask(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Not found" });
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    try {
      await storage.deleteTask(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Not found" });
    }
  });

  app.post(api.ai.processDump.path, async (req, res) => {
    try {
      const input = api.ai.processDump.input.parse(req.body);
      const prioritiesList = await storage.getPriorities();
      const prioritiesText = prioritiesList.map(p => p.content).join(", ");
      
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 8192,
        system: `You are an AI that organizes a brain dump into actionable tasks. 
User's priorities: ${prioritiesText || "No specific priorities"}.
Extract every actionable to-do and sort them into exactly one of these tiers:
- focus: Top-priority, directly advances goals. Do this soon.
- backlog: Useful but not urgent. Can wait for now.
- icebox: Not worth doing right now. Never mind.
Return JSON with format: {"tasks": [{"content": "...", "tier": "focus"}]}
Be concise with task content. Extract distinct actionable items only. Return ONLY valid JSON, no other text.`,
        messages: [
          { role: "user", content: input.dumpText }
        ],
      });
      
      const rawContent = response.content[0]?.type === "text" ? response.content[0].text : '{"tasks":[]}';
      const parsed = JSON.parse(extractJSON(rawContent));
      const proposedTasks: Array<{ content: string; tier: "focus" | "backlog" | "icebox" }> = parsed.tasks || [];

      const existingTasks = await storage.getTasks();
      const existingContents = new Set(existingTasks.map(t => t.content.toLowerCase().trim()));
      
      const newTasks = proposedTasks.filter(t => !existingContents.has(t.content.toLowerCase().trim()));
      
      let savedTasks: any[] = [];
      if (newTasks.length > 0) {
        savedTasks = await storage.createTasks(
          newTasks.map(t => ({ content: t.content, tier: t.tier, status: "pending" as const }))
        );
      }

      res.json({ tasks: savedTasks });
    } catch (err) {
      console.error("Error processing dump:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Error processing dump" });
    }
  });

  app.post(api.ai.generateNudge.path, async (req, res) => {
    try {
      const allTasks = await storage.getTasks();
      const task = allTasks.find(t => t.id === Number(req.params.id));
      if (!task) return res.status(404).json({ message: "Task not found" });

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 8192,
        system: "Provide the absolute smallest first step for this task. Something so easy you can't say no. Two minutes or less. Answer with just the step, no intro.",
        messages: [
          { role: "user", content: task.content }
        ],
      });

      const nudge = response.content[0]?.type === "text" ? response.content[0].text : "Just open the file.";
      
      await storage.updateTask(task.id, { nudge });
      
      res.json({ nudge });
    } catch (err) {
      console.error("Error generating nudge:", err);
      res.status(500).json({ message: "Error generating nudge" });
    }
  });

  app.post(api.ai.generateBreakdown.path, async (req, res) => {
    try {
      const allTasks = await storage.getTasks();
      const task = allTasks.find(t => t.id === Number(req.params.id));
      if (!task) return res.status(404).json({ message: "Task not found" });

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 8192,
        system: `Break down this task into small, mindless, actionable steps. Each step should be concrete and take no more than a few minutes. Return JSON with format: {"steps": ["step 1", "step 2", ...]}. Aim for 3-7 steps. Keep each step short and action-oriented. Return ONLY valid JSON, no other text.`,
        messages: [
          { role: "user", content: task.content }
        ],
      });

      const rawContent = response.content[0]?.type === "text" ? response.content[0].text : '{"steps":[]}';
      const parsed = JSON.parse(extractJSON(rawContent));
      
      res.json({ steps: parsed.steps || [] });
    } catch (err) {
      console.error("Error generating breakdown:", err);
      res.status(500).json({ message: "Error generating breakdown" });
    }
  });

  return httpServer;
}
