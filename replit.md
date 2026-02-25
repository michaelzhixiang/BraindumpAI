# BrainDump AI

## Overview
BrainDump AI is a minimal, mobile-first web app for overthinkers. It helps users capture thoughts instantly (brain dump), uses AI to sort them into actionable tiers (Focus/Backlog/Icebox), and provides micro-step nudges and task breakdowns. Multi-user with Replit Auth (Google, GitHub, Apple, email sign-in).

## Architecture
- **Frontend**: React + Vite, wouter routing, framer-motion animations, @dnd-kit drag-and-drop, shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OIDC) — supports Google, GitHub, Apple, email/password login
- **AI**: Anthropic Claude (claude-haiku-4-5) via @anthropic-ai/sdk — optimized for speed
- **Styling**: Tailwind CSS, warm newsprint/paper theme, full-width layout
- **i18n**: Custom lightweight i18n system with English/Chinese toggle (client/src/lib/i18n.ts)

## Design System — Warm Newsprint / Paper & Ink
- **Background**: #f5efe7 (warm cream paper)
- **Primary text**: #2b2520 (dark espresso brown)
- **Secondary text**: #9e9484
- **Tertiary/disabled**: #c5baa8
- **Borders**: #ddd5c8
- **Active calendar day**: #e8dfd3
- **Today cell**: bg #2b2520, text #f6f1eb (inverted)
- **Headings**: Source Serif 4, Georgia, serif — weight 700 (app title 1.9rem), weight 600 sections
- **Body text**: Source Serif 4, 1.05rem, weight 400, line-height 1.45
- **Labels/metadata**: IBM Plex Mono, 0.6-0.72rem, weight 400-500, letter-spacing 0.5-1.5px
- **No shadows, no gradients, no neon/glow effects** — borders only for separation
- **Custom CSS classes**: .paper-card, .paper-btn, .paper-border, .fade-up

## Key Features
1. **Authentication**: Replit Auth with Google SSO, GitHub, Apple, email/password. Landing page for logged-out users.
2. **Onboarding**: Set top 3 priorities (used by AI for task sorting) — per user
3. **Dump Tab**: Chat-like interface to dump thoughts. AI auto-processes and saves tasks. No confirmation screens.
4. **Queue Tab**: View tasks in Focus/Backlog/Icebox tiers with drag-and-drop reordering. Inline editing.
5. **Today Tab**: Focus tasks with Nudge (micro-step). Completing tasks earns guilt-free social media time.
6. **Reward System**: +10 min social media time per completed task, displayed prominently with progress bar.
7. **Language Toggle**: EN/中文 switch in header, persisted to localStorage
8. **Monthly Streak**: GitHub-style calendar heatmap showing completed tasks per day

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
client/src/components/  - Header, Navigation, MonthlyStreak, AuroraBackground (now empty/null)
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
- Redesigned entire UI from dark neon/glassmorphism to warm newsprint/paper & ink aesthetic
- Replaced all glass-card, neon-*, halo-*, aurora-* effects with paper-card, paper-btn, paper-border
- Fonts changed to Source Serif 4 (headings/body) and IBM Plex Mono (labels/metadata)
- AuroraBackground component now returns null (no animated background)
- Calendar streak uses warm brown intensity scale instead of white opacity
- Checkboxes are 22px circles with brown borders, completed state fills brown
- Task items use 1px border-bottom separators instead of card containers
- Progress bar for screen time: 3px height, #2b2520 fill on #e0d8cc track
- Max-width 480px for centered content on Landing and Onboarding pages
- Used 100dvh instead of 100vh for proper mobile browser viewport handling
- Dump tab input moved to bottom using flexbox (messages flex-1, input shrink-0 at bottom)
- Exit/logout button now shows confirmation dialog ("Do you want to exit?") before logging out
- Bottom tab bar made more compact (smaller icons, labels, padding; no safe-area padding)
- Navigation changed from fixed-position to in-flow (shrink-0) for proper flex layout
- Added multi-user authentication with Replit Auth (Google SSO, GitHub, Apple, email)
- Progressive nudges: each nudge builds on the previous one, ~60% task completion by nudge 5
- DnD uses setActivatorNodeRef for drag handle separation from swipe, custom collision detection

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000.
