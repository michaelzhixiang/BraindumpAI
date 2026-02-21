import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: `You are an AI that organizes a brain dump into actionable tasks. 
User's priorities: ${prioritiesText || "No specific priorities"}.
Extract actionable to-dos and sort them into exactly one of these tiers:
- focus: Top-priority, directly advances goals.
- backlog: Useful but not urgent.
- icebox: Back burner.
Return JSON with format: {"tasks": [{"content": "...", "tier": "focus"}]}` },
          { role: "user", content: input.dumpText }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content || '{"tasks":[]}';
      const parsed = JSON.parse(content);
      
      res.json(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Error processing dump" });
    }
  });

  app.post(api.ai.generateNudge.path, async (req, res) => {
    try {
      const task = await storage.getTasks().then(tasks => tasks.find(t => t.id === Number(req.params.id)));
      if (!task) return res.status(404).json({ message: "Task not found" });

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: "Provide the absolute smallest first step for this task. Something so easy you can't say no. Two minutes or less. Answer with just the step, no intro." },
          { role: "user", content: task.content }
        ]
      });

      const nudge = response.choices[0]?.message?.content || "Just open the file.";
      
      await storage.updateTask(task.id, { nudge });
      
      res.json({ nudge });
    } catch (err) {
      res.status(500).json({ message: "Error generating nudge" });
    }
  });

  return httpServer;
}
