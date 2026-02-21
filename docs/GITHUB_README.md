# BrainDump AI

**A to-do list built for ambitious overthinkers to get things done.**

BrainDump AI is a mobile-first web app that helps you stop overthinking and start doing. Dump everything in your head, and it gets sorted into what matters, what can wait, and what you should forget about — based on your own priorities.

---

## The Problem

Ambitious people have too many ideas. They make lists, plan endlessly, and still struggle to take the first step. Traditional to-do apps make this worse by giving you more ways to organize without addressing the real issue: **you're stuck.**

## The Solution

BrainDump AI takes a different approach:

1. **You dump everything** — no categories, no labels, no friction. Just type whatever's in your head.
2. **It sorts for you** — based on priorities you set, your thoughts get triaged into three buckets: Focus, Can Wait, and Never Mind.
3. **It nudges you forward** — stuck on a task? Get a micro-step so small you can't say no. Two minutes or less.
4. **It rewards you** — every completed task earns guilt-free screen time. Finish your work, then scroll guilt-free.

---

## Core Features

### Brain Dump
A chat-style interface where you type anything that's on your mind. Send as many thoughts as you want, then hit "Sort My Stuff" and they're automatically organized into your task queue. No forms, no dropdowns, no decision fatigue.

### Smart Triage
Every thought you dump gets sorted into one of three tiers:
- **Focus** — Do this now. Directly tied to your goals.
- **Can Wait** — Useful, but not urgent. It'll be there when you're ready.
- **Never Mind** — Not worth your energy right now. Let it go.

The sorting is based on the top 3 priorities you set during onboarding (scoped to the next 3 months), so it's always personalized to what actually matters to you.

### Nudge System
For every Focus task, you can tap "Nudge Me" to get the absolute smallest first step. The kind of step that takes two minutes or less — designed to break through procrastination and get you moving.

### Task Breakdown
For bigger tasks, "Break It Down" generates 3–7 concrete, actionable sub-steps. Each step is small enough to feel effortless. You can add all steps to your list with one tap.

### Drag-and-Drop Queue
Your full task queue is organized into the three tiers. You can drag tasks between tiers if you disagree with the sorting, click to edit any task inline, or delete what you don't need.

### Monthly Streak
A GitHub-style heatmap showing your task completion activity for the current month. Brighter squares mean more tasks completed that day. Tracks total completions and active days.

### Reward System
Every completed task earns **+10 minutes** of guilt-free screen time. The counter is displayed prominently on the Today page. When all your focus tasks are done: "You earned X minutes. Go enjoy them."

### Bilingual Interface
Full English and Chinese (中文) support with a one-tap language toggle. Every screen, button, and message is translated. Language preference is remembered between sessions.

---

## Design

### Visual Identity
- Dark mode only — designed for nighttime thinkers and OLED screens
- Neon blue (#3B82F6) accent color throughout
- Glassmorphism cards with frosted blur and subtle glow effects
- Telegram-inspired aurora background with flowing light bands
- Mobile-first layout (max-width 480px), works on desktop too

### Onboarding
A 6-page swipeable introduction:
1. Hero page with the app's catchphrase
2. Four feature showcase pages (priorities, auto-sort, nudge, screen time)
3. Priority input — "What matters most to you in the next 3 months?"

Designed to communicate the app's value proposition before asking for any input.

---

## Iterations & Design Decisions

### Tier Naming (v1.1)
Originally used project management terms: "Backlog" and "Icebox." Renamed to **"Can Wait"** and **"Never Mind"** to feel more human and less corporate. The app should feel like a friend helping you prioritize, not a Jira board.

### AI Positioning
The app uses AI extensively for sorting, nudging, and task breakdown. But the deliberate choice was made to **never market it as AI.** No "AI-powered" badges, no "our AI thinks..." language. The onboarding says "We'll sort your tasks" — not "AI will sort your tasks." Users should judge the app on how well it works, not on buzzwords.

### AI Speed Optimization
Switched from Claude Sonnet to **Claude 3.5 Haiku** — a smaller, faster model that responds 4–5x quicker. For task sorting and nudge generation, speed matters more than sophistication. Users want instant feedback, not a 10-second wait.

### Aurora Background
Went through multiple iterations:
- Started with circular floating orbs
- Changed to elongated flowing bands (Telegram-style)
- Brightness adjusted three times — too bright was distracting, too dim was invisible, landed on a moderate glow that adds atmosphere without competing with content

### Onboarding Redesign
Originally a simple 2-step flow (intro + priorities). Redesigned to 6 swipeable pages to properly showcase all four core features before asking users to commit their priorities. This gives users context for *why* priorities matter before they enter them.

---

## Architecture

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev experience, hot reload |
| Routing | wouter | Lightweight alternative to React Router |
| Animations | framer-motion | Smooth swipe gestures and transitions |
| Drag & Drop | @dnd-kit | Accessible, flexible DnD for task reordering |
| UI Components | shadcn/ui | Consistent, customizable component library |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Backend | Express.js + TypeScript | Simple, type-safe API layer |
| Database | PostgreSQL + Drizzle ORM | Relational data with type-safe queries |
| AI | Anthropic Claude 3.5 Haiku | Fast, affordable language model |
| Validation | Zod | Runtime type checking for API inputs |
| Data Fetching | TanStack React Query v5 | Caching, mutations, optimistic updates |
| i18n | Custom implementation | Lightweight, no extra dependencies |
| Confetti | canvas-confetti | Celebration on task completion |

---

## Data Model

```
user_state
  ├── screenTimeMinutes (earned reward minutes)
  └── hasOnboarded (onboarding completion flag)

priorities
  └── content (user's top 3 priorities for the next 3 months)

tasks
  ├── content (task description)
  ├── tier (focus / backlog / icebox)
  ├── status (pending / completed)
  ├── nudge (AI-generated micro-step, nullable)
  ├── parentId (links sub-tasks to parent task)
  ├── createdAt
  └── completedAt
```

---

## API

| Endpoint | Purpose |
|---|---|
| `GET/PATCH /api/user-state` | Screen time and onboarding status |
| `GET /api/priorities` | List priorities |
| `POST /api/priorities/bulk` | Save priorities during onboarding |
| `GET/POST /api/tasks` | List and create tasks |
| `POST /api/tasks/bulk` | Batch create tasks (from AI sort or breakdown) |
| `PATCH/DELETE /api/tasks/:id` | Update or delete a task |
| `POST /api/ai/process-dump` | Sort brain dump into triaged tasks |
| `POST /api/ai/nudge/:id` | Generate micro-step for a task |
| `POST /api/ai/breakdown/:id` | Generate 3–7 step breakdown |

---

## Known Limitations (v1)

1. **Single user** — No authentication. Everyone shares the same task list. Fine for personal use, needs auth for multi-user.
2. **No screen time reset** — Earned minutes accumulate forever. A daily/weekly reset could make the reward loop feel fresher.
3. **No completed task cleanup** — Completed tasks stay in the database indefinitely.
4. **No offline support** — Requires internet connection for all AI features.

---

## What's Next (v2 Ideas)

- User authentication (per-user task lists)
- Daily/weekly screen time budget and reset
- Push notifications for daily nudges
- Completed task archive with clear-all
- Dark/light theme toggle
- Swipe gestures on task cards (swipe right to complete, swipe left to delete)
- Custom tier names
- Export/share task lists

---

## Credits

Built with care for overthinkers everywhere.

- AI: [Anthropic Claude](https://anthropic.com)
- UI Framework: [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- Database: [PostgreSQL](https://postgresql.org) + [Drizzle ORM](https://orm.drizzle.team)
- Animations: [Framer Motion](https://www.framer.com/motion/)
- Drag & Drop: [dnd kit](https://dndkit.com)
- Hosting: [Replit](https://replit.com)
