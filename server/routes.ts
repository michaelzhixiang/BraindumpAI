import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

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

function getUserId(req: any): string {
  const userId = req.user?.claims?.sub;
  if (!userId) throw new Error("User ID not found in session");
  return userId;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.userState.get.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const state = await storage.getUserState(userId);
    res.json(state);
  });

  app.patch(api.userState.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.userState.update.input.parse(req.body);
      const state = await storage.updateUserState(userId, input);
      res.json(state);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.priorities.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const items = await storage.getPriorities(userId);
    res.json(items);
  });

  app.post(api.priorities.createMany.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.priorities.createMany.input.parse(req.body);
      const items = await storage.createPriorities(userId, input.priorities);
      res.status(201).json(items);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.tasks.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const items = await storage.getTasks(userId);
    res.json(items);
  });

  app.post(api.tasks.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.tasks.create.input.parse(req.body);
      const item = await storage.createTask(userId, input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Error creating task" });
    }
  });

  app.post(api.tasks.createMany.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.tasks.createMany.input.parse(req.body);
      const items = await storage.createTasks(userId, input.tasks);
      res.status(201).json(items);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Error creating tasks" });
    }
  });

  app.patch(api.tasks.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.tasks.update.input.parse(req.body);
      const item = await storage.updateTask(userId, Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Not found" });
    }
  });

  app.delete(api.tasks.delete.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteTask(userId, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Not found" });
    }
  });

  app.post(api.ai.processDump.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.ai.processDump.input.parse(req.body);
      const prioritiesList = await storage.getPriorities(userId);
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

      const existingTasks = await storage.getTasks(userId);
      const existingContents = new Set(existingTasks.map(t => t.content.toLowerCase().trim()));
      
      const newTasks = proposedTasks.filter(t => !existingContents.has(t.content.toLowerCase().trim()));
      
      let savedTasks: any[] = [];
      if (newTasks.length > 0) {
        savedTasks = await storage.createTasks(
          userId,
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

  app.post(api.ai.generateNudge.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const allTasks = await storage.getTasks(userId);
      const task = allTasks.find(t => t.id === Number(req.params.id));
      if (!task) return res.status(404).json({ message: "Task not found" });

      const currentCount = task.nudgeCount || 0;
      if (currentCount >= 5) {
        return res.json({ nudge: task.nudge || "", nudgeCount: currentCount, nudgeHistory: (task as any).nudgeHistory || [] });
      }
      const nudgeNum = currentCount + 1;
      const nudgeHistory: string[] = (task as any).nudgeHistory || [];

      const otherTasks = allTasks
        .filter(t => t.id !== task.id && t.status === "pending" && (t.tier === "focus" || t.tier === "backlog"))
        .map(t => `- ${t.content}`)
        .join("\n");

      let systemPrompt: string;
      if (nudgeNum === 1) {
        systemPrompt = `You are a productivity coach helping someone take immediate action on a task. The user tends to overthink and get stuck in analysis paralysis, so your job is to unblock them with the single most useful next micro-action they can do in under 2 minutes.

CONTEXT — here are their other active tasks (use these to infer intent):
${otherTasks || "(no other tasks)"}

The task they want a nudge on: "${task.content}"

Before responding, think through these steps internally (do NOT include this reasoning in your response):
1. What is the REAL intent behind this task, given their other tasks as context?
2. What would "done" look like for this task?
3. What prerequisites might they be missing or assuming they've handled?
4. What is the most common blocker for someone with this type of task?
5. What is the smallest concrete action they can do RIGHT NOW in under 2 minutes to make progress?

RULES:
- Start your response with a verb (an action word).
- If there's a likely prerequisite they haven't handled, address that FIRST before the main action.
- Keep it to 2-3 sentences max. Be conversational, not robotic.
- Be specific: mention actual tools, apps, or websites when relevant.
- Never state the obvious (e.g., don't say "open your browser"). Start from where real friction begins.
- If the task is ambiguous, make your best inference from context and go with it.`;
      } else {
        const nudgeHistoryText = nudgeHistory.map((n, i) => `${i + 1}. ${n}`).join("\n");
        systemPrompt = `You are a productivity coach helping someone make progress on a task through a series of small nudges. Each nudge should be a micro-action completable in under 2 minutes.

CONTEXT — their other active tasks:
${otherTasks || "(no other tasks)"}

The task: "${task.content}"

Previous nudges you've already given (they've completed or acknowledged these):
${nudgeHistoryText || "(none)"}

This is nudge ${nudgeNum} of 5. By nudge 5, the user should be roughly 60% done with the overall task — meaning all the preparation, research, and setup is handled, and what remains is just the core execution.

Progression guide:
- Nudge 1: Address the earliest prerequisite or blocker
- Nudge 2: Gather or prepare the key materials/information needed
- Nudge 3: Set up the environment or draft the core deliverable
- Nudge 4: Refine or review what they've prepared
- Nudge 5: Position them to execute the final action (send, submit, publish, etc.)

RULES:
- Start with a verb.
- 2-3 sentences max, conversational tone.
- Don't repeat any action from previous nudges.
- Be specific to THIS task — reference actual tools, files, or steps.
- Account for what they've likely already done based on the previous nudges.`;
      }

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: systemPrompt,
        messages: [
          { role: "user", content: task.content }
        ],
      });

      const nudge = response.content[0]?.type === "text" ? response.content[0].text : "Just open the file.";
      const updatedHistory = [...nudgeHistory, nudge];
      
      await storage.updateTask(userId, task.id, { nudge, nudgeCount: nudgeNum, nudgeHistory: updatedHistory });
      
      res.json({ nudge, nudgeCount: nudgeNum, nudgeHistory: updatedHistory });
    } catch (err) {
      console.error("Error generating nudge:", err);
      res.status(500).json({ message: "Error generating nudge" });
    }
  });

  app.post(api.ai.generateBreakdown.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const allTasks = await storage.getTasks(userId);
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
