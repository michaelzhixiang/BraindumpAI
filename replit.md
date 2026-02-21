# BrainDump AI

## Overview
BrainDump AI is a minimal, mobile-first dark-mode web app for overthinkers. It helps users capture thoughts instantly (brain dump), uses AI to sort them into actionable tiers (Focus/Backlog/Icebox), and provides micro-step nudges and task breakdowns.

## Architecture
- **Frontend**: React + Vite, wouter routing, framer-motion animations, @dnd-kit drag-and-drop, shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Anthropic Claude (claude-haiku-4-5) via @anthropic-ai/sdk — optimized for speed
- **Styling**: Tailwind CSS, dark-mode only, max-width 480px centered "phone frame"
- **i18n**: Custom lightweight i18n system with English/Chinese toggle (client/src/lib/i18n.ts)

## Key Features
1. **Onboarding**: Set top 3 priorities (used by AI for task sorting)
2. **Dump Tab**: Chat-like interface to dump thoughts. AI auto-processes and saves tasks. No confirmation screens.
3. **Queue Tab**: View tasks in Focus/Backlog/Icebox tiers with drag-and-drop reordering. Inline editing.
4. **Today Tab**: Focus tasks with Nudge (micro-step) and Break It Down (AI 3-7 step decomposition). Completing tasks earns guilt-free screen time.
5. **Reward System**: +10 min screen time per completed task, displayed prominently.
6. **Language Toggle**: EN/中文 switch in header, persisted to localStorage
7. **Visual Effects**: Glassmorphism cards, neon blue glow effects, animated aurora background with floating orbs

## Project Structure
```
shared/schema.ts        - Drizzle schema (userState, priorities, tasks)
shared/routes.ts        - API route definitions with Zod validation
server/routes.ts        - Express route handlers + Anthropic Claude AI logic
server/storage.ts       - Database CRUD operations
client/src/pages/       - Onboarding, Today, Dump, Queue pages
client/src/hooks/       - use-tasks, use-ai, use-user-state, use-priorities
client/src/components/  - Header, Navigation, MonthlyStreak, AuroraBackground
client/src/lib/i18n.ts  - Internationalization (EN/ZH translations)
```

## API Endpoints
- `GET/PATCH /api/user-state` - Screen time and onboarding status
- `GET /api/priorities`, `POST /api/priorities/bulk` - User priorities
- `GET /api/tasks`, `POST /api/tasks`, `POST /api/tasks/bulk`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- `POST /api/ai/process-dump` - AI sorts brain dump text into tasks (auto-saves, deduplicates)
- `POST /api/ai/nudge/:id` - Generate micro-step for a task
## Recent Changes
- Removed "Break It Down" button; Today page now only has "Nudge Me"
- Added "all done" state on Today page with CTAs to Queue and Dump
- Replaced heavy confetti with subtle framer-motion completion animation (fade+slide)
- Swipe-left gesture on Queue items reveals Edit/Delete action buttons
- Fixed DnD vs swipe conflict: drag handle triggers DnD, card body triggers swipe, auto-closes revealed items on drag start
- Improved DnD sensors: TouchSensor with delay activation, faster drop animation
- Progressive nudges: each nudge builds on the previous one, ~60% task completion by nudge 5
- "All done" state shows inline task picker from backlog/icebox, blue "View Queue" CTA, grey "Dump Some More"
- Renamed "Guilt-Free Screen Time" to "Guilt-Free Social Media Time" in both languages
- DnD uses setActivatorNodeRef for drag handle separation from swipe, custom collision detection
- Uninstalled canvas-confetti package
- Upgraded AI model to claude-haiku-4-5 (Claude 3.5 Haiku retired Feb 19, 2026)
- Added EN/中文 language toggle with full i18n support
- Changed title from "BrainDump" to "BrainDump AI"
- Animated aurora background with floating blue orbs
- Enhanced glassmorphism: frosted glass with blur, neon blue glow borders
- Neon blue (#3B82F6) color theme throughout
- MonthlyStreak heatmap component (GitHub-style)
- Drag-and-drop between tiers using @dnd-kit
- Duplicate task prevention in processDump

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000.
