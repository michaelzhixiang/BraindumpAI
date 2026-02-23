# BrainDump AI

## Overview
BrainDump AI is a minimal, mobile-first dark-mode web app for overthinkers. It helps users capture thoughts instantly (brain dump), uses AI to sort them into actionable tiers (Focus/Backlog/Icebox), and provides micro-step nudges and task breakdowns. Multi-user with Replit Auth (Google, GitHub, Apple, email sign-in).

## Architecture
- **Frontend**: React + Vite, wouter routing, framer-motion animations, @dnd-kit drag-and-drop, shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OIDC) — supports Google, GitHub, Apple, email/password login
- **AI**: Anthropic Claude (claude-haiku-4-5) via @anthropic-ai/sdk — optimized for speed
- **Styling**: Tailwind CSS, dark-mode only, max-width 480px centered "phone frame"
- **i18n**: Custom lightweight i18n system with English/Chinese toggle (client/src/lib/i18n.ts)

## Key Features
1. **Authentication**: Replit Auth with Google SSO, GitHub, Apple, email/password. Landing page for logged-out users.
2. **Onboarding**: Set top 3 priorities (used by AI for task sorting) — per user
3. **Dump Tab**: Chat-like interface to dump thoughts. AI auto-processes and saves tasks. No confirmation screens.
4. **Queue Tab**: View tasks in Focus/Backlog/Icebox tiers with drag-and-drop reordering. Inline editing.
5. **Today Tab**: Focus tasks with Nudge (micro-step). Completing tasks earns guilt-free social media time.
6. **Reward System**: +10 min social media time per completed task, displayed prominently.
7. **Language Toggle**: EN/中文 switch in header, persisted to localStorage
8. **Visual Effects**: Glassmorphism cards, neon blue glow effects, animated aurora background with floating orbs

## Project Structure
```
shared/schema.ts        - Drizzle schema (userState, priorities, tasks + auth models)
shared/models/auth.ts   - Users and sessions tables for Replit Auth
shared/routes.ts        - API route definitions with Zod validation
server/routes.ts        - Express route handlers + Anthropic Claude AI logic + auth middleware
server/storage.ts       - Database CRUD operations (all filtered by userId)
server/replit_integrations/auth/ - Replit Auth OIDC integration
client/src/pages/       - Landing, Onboarding, Today, Dump, Queue pages
client/src/hooks/       - use-tasks, use-ai, use-user-state, use-priorities, use-auth
client/src/components/  - Header, Navigation, MonthlyStreak, AuroraBackground
client/src/lib/i18n.ts  - Internationalization (EN/ZH translations)
```

## API Endpoints
All endpoints require authentication (isAuthenticated middleware). Data is scoped per user via userId.
- `GET/PATCH /api/user-state` - Screen time and onboarding status
- `GET /api/priorities`, `POST /api/priorities/bulk` - User priorities
- `GET /api/tasks`, `POST /api/tasks`, `POST /api/tasks/bulk`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- `POST /api/ai/process-dump` - AI sorts brain dump text into tasks (auto-saves, deduplicates)
- `POST /api/ai/nudge/:id` - Generate micro-step for a task
- `GET /api/auth/user` - Get current authenticated user
- `/api/login`, `/api/logout`, `/api/callback` - Auth flow routes

## Recent Changes
- Added multi-user authentication with Replit Auth (Google SSO, GitHub, Apple, email)
- Added userId columns to userState, priorities, tasks tables for per-user data isolation
- Created landing page for logged-out users with feature cards and Get Started CTA
- Added logout button to Header
- All API routes protected with isAuthenticated middleware
- Progressive nudges: each nudge builds on the previous one, ~60% task completion by nudge 5
- "All done" state shows inline task picker from backlog/icebox, blue "View Queue" CTA, grey "Dump Some More"
- Renamed "Guilt-Free Screen Time" to "Guilt-Free Social Media Time" in both languages
- DnD uses setActivatorNodeRef for drag handle separation from swipe, custom collision detection

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000.
