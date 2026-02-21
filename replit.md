# BrainDump

## Overview
BrainDump is a minimal, mobile-first dark-mode web app for overthinkers. It helps users capture thoughts instantly (brain dump), uses AI to sort them into actionable tiers (Focus/Backlog/Icebox), and provides micro-step nudges and task breakdowns.

## Architecture
- **Frontend**: React + Vite, wouter routing, framer-motion animations, @dnd-kit drag-and-drop, shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Styling**: Tailwind CSS, dark-mode only, max-width 480px centered "phone frame"

## Key Features
1. **Onboarding**: Set top 3 priorities (used by AI for task sorting)
2. **Dump Tab**: Chat-like interface to dump thoughts. AI auto-processes and saves tasks. No confirmation screens.
3. **Queue Tab**: View tasks in Focus/Backlog/Icebox tiers with drag-and-drop reordering. Inline editing.
4. **Today Tab**: Focus tasks with Nudge (micro-step) and Break It Down (AI 5-step decomposition). Completing tasks earns guilt-free screen time.
5. **Reward System**: +10 min screen time per completed task, displayed prominently.

## Project Structure
```
shared/schema.ts      - Drizzle schema (userState, priorities, tasks)
shared/routes.ts      - API route definitions with Zod validation
server/routes.ts      - Express route handlers + OpenAI AI logic
server/storage.ts     - Database CRUD operations
client/src/pages/     - Onboarding, Today, Dump, Queue pages
client/src/hooks/     - use-tasks, use-ai, use-user-state, use-priorities
client/src/components/ - Header, Navigation
```

## API Endpoints
- `GET/PATCH /api/user-state` - Screen time and onboarding status
- `GET /api/priorities`, `POST /api/priorities/bulk` - User priorities
- `GET /api/tasks`, `POST /api/tasks`, `POST /api/tasks/bulk`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- `POST /api/ai/process-dump` - AI sorts brain dump text into tasks (auto-saves, deduplicates)
- `POST /api/ai/nudge/:id` - Generate micro-step for a task
- `POST /api/ai/breakdown/:id` - Generate 3-7 step breakdown for a task

## Recent Changes
- Auto-save tasks from AI processing (no confirmation screen)
- Drag-and-drop between tiers using @dnd-kit
- Removed all confirmation dialogs
- Added "Break It Down" feature with sub-task creation
- Inline task editing in Queue
- Duplicate task prevention in processDump

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000.
