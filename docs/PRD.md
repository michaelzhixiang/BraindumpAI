# BrainDump — Product Requirements Document

*Last updated: March 2026*

---

## 1. Product Overview

### What It Does
BrainDump is a mobile-first task management app designed for ambitious overthinkers. Users dump messy, unstructured thoughts into a chat interface, and AI instantly organizes them into prioritized, actionable tasks across three tiers: Focus, Can Wait, and Never Mind. A progressive nudge system then coaches users through each task with micro-steps — think of it as a productivity coach that lives in your pocket.

### Target User
Ambitious people who overthink, over-plan, and under-execute. The kind of person with 47 open browser tabs, three half-finished to-do lists, and a Notes app full of ideas that never become actions. They don't lack motivation — they lack a system that meets them where they are: in the mess.

### Core Insight
Traditional to-do apps ask you to organize your thoughts *before* you write them down. BrainDump flips this: dump first, let AI organize, then focus on one micro-step at a time. The app doesn't fight your overthinking — it weaponizes it.

### Key Differentiators

| Feature | BrainDump | Traditional To-Do Apps |
|---|---|---|
| Input method | Messy brain dump → AI sorts | Manual entry + manual categorization |
| Prioritization | AI triage into Focus/Can Wait/Never Mind | User-assigned priority levels |
| Getting unstuck | Progressive 5-nudge micro-step system | None |
| Motivation model | Guilt-free social media time as reward | Streaks, gamification badges |
| Context awareness | AI considers sibling tasks when nudging | Tasks treated in isolation |

---

## 2. Core User Flow

### Step 1: Authentication
Users sign in via Replit Auth (OIDC), which supports Google, GitHub, Apple, and email/password login. Unauthenticated users see a landing page with app overview and sign-in button.

### Step 2: Onboarding (7 Pages)
A swipeable, animated introduction that teaches the app's philosophy before asking users to commit:

| Page | Title | Content |
|---|---|---|
| 1 | BrainDump | Welcome message: "A to-do list for ambitious overthinkers who actually want to get stuff done." |
| 2 | Brain Dump, Then Relax | Animated demo: three messy thoughts appear as chat bubbles, then a "Sorting..." animation plays |
| 3 | AI Sorts It For You | Animated demo: thoughts land in Focus / Can Wait / Never Mind tiers with color-coded dots |
| 4 | Tiny Steps, Big Progress | Animated demo: a task card expands to reveal an AI micro-step nudge |
| 5 | Do More, Scroll More | Animated demo: counter increments from 0 → 10 → 20 → 30 minutes as checkmarks light up |
| 6 | Track Your Streak | Animated demo: GitHub-style heatmap fills in with 15 active days and "42 done" stat |
| 7 | Set Your Priorities | Three text inputs: "What matters most to you in the next 3 months?" — saved to database |

Each page features language (EN/中文) and theme (light/dark) toggles. Navigation via buttons or touch swipe. Animations powered by Framer Motion.

### Step 3: Brain Dump
After onboarding, users land on the Dump page — a chat-like interface with a fixed-bottom input bar. Users type stream-of-consciousness thoughts ("need to update resume, should exercise, call dentist, prep for interview"). Tapping "Sort" sends the text to AI, which:

1. Extracts every distinct actionable item
2. Cross-references the user's stated priorities
3. Assigns each task to Focus, Can Wait, or Never Mind
4. Auto-saves all tasks to the database (with deduplication)

The AI response appears as organized task cards in the chat.

### Step 4: Queue Management
The Queue page shows the full task inventory organized by tier:

- **Focus** — Top-priority tasks that directly advance goals
- **Can Wait (Backlog)** — Useful but not urgent
- **Never Mind (Icebox)** — Not worth doing right now

Users can:
- Drag-and-drop tasks between tiers (touch-optimized with 150ms delay, 8px distance threshold)
- Swipe left to reveal Edit/Delete actions
- Inline edit task content
- Tap to expand task details

### Step 5: Today View
The Today page shows only Focus-tier tasks with:
- Monthly streak heatmap (GitHub-style)
- Guilt-free social media time counter
- Nudge buttons for each task
- Task completion checkboxes

### Step 6: Task Completion & Rewards
Completing a task:
1. Marks the task as completed with timestamp
2. Adds +10 minutes to "Guilt-Free Social Media Time"
3. Updates the streak heatmap for the current day
4. Shows updated reward counter with progress bar

---

## 3. The Nudge System

### Design Philosophy
Most productivity apps think *forwards* from a task: "Here's your to-do, now go do it." BrainDump thinks *backwards* from completion: "What does done look like? What's the first thing blocking you from getting there?"

The nudge system is designed for people who know what they *should* do but can't start. It doesn't give advice — it gives the smallest possible next action, completable in under 2 minutes.

### How Context-Aware Nudges Work
When generating a nudge, the AI receives:
1. The target task content
2. All other active tasks in Focus and Backlog tiers

This context allows the AI to:
- Infer the *real* intent behind a vague task (e.g., "update resume" + "prep for Scale AI interview" → the resume update is for a specific job)
- Identify prerequisites the user might be assuming they've handled
- Avoid suggesting actions that conflict with other active tasks

### The Progressive "5 Nudges to 60%" System
Each task supports up to 5 sequential nudges. The system is designed so that by nudge 5, the user has completed roughly 60% of the task — all preparation, research, and setup is done, and only core execution remains.

| Nudge | Purpose | Example (for "Update resume") |
|---|---|---|
| 1 | Address the earliest prerequisite or blocker | "Open your current resume file and read just the summary section — note one thing that feels outdated." |
| 2 | Gather or prepare key materials/information | "Pull up the Scale AI job posting and highlight 3 keywords they repeat — you'll weave these in." |
| 3 | Set up the environment or draft the core deliverable | "Rewrite your summary in 2 sentences using one of those keywords. Don't overthink it — first draft only." |
| 4 | Refine or review what they've prepared | "Read your last 2 bullet points under Experience — swap any passive verbs for active ones (led, built, shipped)." |
| 5 | Position to execute the final action | "Export as PDF, name it 'FirstName_LastName_ScaleAI.pdf', and open the application page. You're ready to submit." |

**Server-side enforcement:** The API hard-caps at 5 nudges per task. Requesting a 6th returns the existing 5th nudge without calling the AI.

### Nudge UI
- **Collapsible display:** Nudge text uses CSS `max-height` transition (0 → 400px) for smooth expand/collapse
- **Progress indicator:** 5 dots showing current position (e.g., ●●●○○ = 3/5)
- **Caching:** First tap fetches from AI; subsequent taps toggle visibility of cached text
- **"Got it, what's next?":** Button to request the next nudge in the sequence
- **Completion state:** At nudge 5/5, displays a completion message instead of the "next" button
- **History persistence:** All nudge texts stored in `nudgeHistory` array column in the database

---

## 4. AI Prompts

All AI features use **Anthropic Claude (claude-haiku-4-5)**, optimized for speed over depth.

### 4.1 Brain Dump Extraction

**Purpose:** Parse unstructured text into categorized tasks, cross-referenced against user priorities.

```
System: You are an AI that organizes a brain dump into actionable tasks.
User's priorities: ${prioritiesText || "No specific priorities"}.
Extract every actionable to-do and sort them into exactly one of these tiers:
- focus: Top-priority, directly advances goals. Do this soon.
- backlog: Useful but not urgent. Can wait for now.
- icebox: Not worth doing right now. Never mind.
Return JSON with format: {"tasks": [{"content": "...", "tier": "focus"}]}
Be concise with task content. Extract distinct actionable items only.
Return ONLY valid JSON, no other text.

User: ${dumpText}
```

**Design rationale:** The prompt enforces strict JSON output to avoid parsing failures. Priority context is injected so the AI can make informed tier assignments (e.g., "update resume" lands in Focus if "career growth" is a priority). The three-tier taxonomy maps to urgency, not importance — everything the user dumped is implicitly important to them.

### 4.2 Initial Nudge (Nudge 1 of 5)

**Purpose:** Generate the first micro-step for a task, considering the user's full task landscape.

```
System: You are a productivity coach helping someone take immediate action
on a task. The user tends to overthink and get stuck in analysis paralysis,
so your job is to unblock them with the single most useful next micro-action
they can do in under 2 minutes.

CONTEXT — here are their other active tasks (use these to infer intent):
${otherTasks || "(no other tasks)"}

The task they want a nudge on: "${task.content}"

Before responding, think through these steps internally (do NOT include
this reasoning in your response):
1. What is the REAL intent behind this task, given their other tasks
   as context?
2. What would "done" look like for this task?
3. What prerequisites might they be missing or assuming they've handled?
4. What is the most common blocker for someone with this type of task?
5. What is the smallest concrete action they can do RIGHT NOW in under
   2 minutes to make progress?

RULES:
- Start your response with a verb (an action word).
- If there's a likely prerequisite they haven't handled, address that
  FIRST before the main action.
- Keep it to 2-3 sentences max. Be conversational, not robotic.
- Be specific: mention actual tools, apps, or websites when relevant.
- Never state the obvious (e.g., don't say "open your browser"). Start
  from where real friction begins.
- If the task is ambiguous, make your best inference from context and
  go with it.

User: ${task.content}
```

**Design rationale:** The hidden chain-of-thought (steps 1–5) forces the AI to reason deeply before responding, without cluttering the output. Starting with a verb creates momentum — it reads like a command, not a suggestion. The "under 2 minutes" constraint prevents the AI from suggesting multi-hour projects as a "first step."

### 4.3 Progressive Nudge (Nudges 2–5)

**Purpose:** Build on previous nudges to progressively advance the user through the task.

```
System: You are a productivity coach helping someone make progress on a
task through a series of small nudges. Each nudge should be a micro-action
completable in under 2 minutes.

CONTEXT — their other active tasks:
${otherTasks || "(no other tasks)"}

The task: "${task.content}"

Previous nudges you've already given (they've completed or acknowledged
these):
${nudgeHistoryText || "(none)"}

This is nudge ${nudgeNum} of 5. By nudge 5, the user should be roughly
60% done with the overall task — meaning all the preparation, research,
and setup is handled, and what remains is just the core execution.

Progression guide:
- Nudge 1: Address the earliest prerequisite or blocker
- Nudge 2: Gather or prepare the key materials/information needed
- Nudge 3: Set up the environment or draft the core deliverable
- Nudge 4: Refine or review what they've prepared
- Nudge 5: Position them to execute the final action (send, submit,
  publish, etc.)

RULES:
- Start with a verb.
- 2-3 sentences max, conversational tone.
- Don't repeat any action from previous nudges.
- Be specific to THIS task — reference actual tools, files, or steps.
- Account for what they've likely already done based on the previous
  nudges.

User: ${task.content}
```

**Design rationale:** The "60% done by nudge 5" target prevents the AI from spacing nudges too far apart or too close together. The progression guide ensures each nudge meaningfully advances the task rather than circling the same ground. Previous nudge history is injected so the AI never repeats itself.

### 4.4 Task Breakdown

**Purpose:** Decompose a task into 3–7 concrete, mindless sub-steps.

```
System: Break down this task into small, mindless, actionable steps.
Each step should be concrete and take no more than a few minutes.
Return JSON with format: {"steps": ["step 1", "step 2", ...]}.
Aim for 3-7 steps. Keep each step short and action-oriented.
Return ONLY valid JSON, no other text.

User: ${task.content}
```

**Design rationale:** The word "mindless" is intentional — steps should require zero decision-making. This complements the nudge system: nudges are sequential coaching, breakdowns are parallel decomposition. Both attack procrastination from different angles.

---

## 5. Daily Usage Features

### Implemented

| Feature | Status | Details |
|---|---|---|
| Guilt-Free Social Media Time | Built | +10 min per completed task. Counter displayed prominently on Today page with progress bar. |
| Monthly Streak Heatmap | Built | GitHub-style calendar showing completed tasks per day for the current month. Color intensity varies by task count. Displays "X days active" and "Y done" stats. |
| Quick-add via Dump | Built | Chat-like interface for rapid thought capture. Fixed-bottom input bar with mobile keyboard awareness. |
| Drag-and-drop triage | Built | Move tasks between Focus/Can Wait/Never Mind with touch-optimized drag (150ms delay, 8px threshold). |
| Swipe actions | Built | Swipe left on Queue items to reveal Edit/Delete buttons. |

### Not Implemented (Potential Future Features)

| Feature | Status | Notes |
|---|---|---|
| Daily reset / morning flow | Not built | No daily task rotation or morning review prompt |
| End-of-day review | Not built | No summary or reflection prompt |
| Time horizons (This Week / This Month) | Not built | All tasks are undated; no temporal bucketing |
| Recurring tasks | Not built | No repeat/recurrence logic |
| Procrastination check | Not built | No friction prompt when moving tasks out of Focus |

---

## 6. Technical Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, TypeScript |
| Routing | wouter (client-side) |
| State Management | TanStack Query v5 |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| UI Components | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS + CSS custom properties |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Replit Auth (OIDC) — Google, GitHub, Apple, email |
| AI | Anthropic Claude (claude-haiku-4-5) via @anthropic-ai/sdk |
| i18n | Custom lightweight system (EN/ZH) |

### Database Schema

#### `users` (Replit Auth)

| Column | Type | Constraints |
|---|---|---|
| id | varchar | PK, default `gen_random_uuid()` |
| email | varchar | Unique |
| firstName | varchar | — |
| lastName | varchar | — |
| profileImageUrl | varchar | — |
| createdAt | timestamp | default `now()` |
| updatedAt | timestamp | default `now()` |

#### `sessions` (Replit Auth)

| Column | Type | Constraints |
|---|---|---|
| sid | varchar | PK |
| sess | jsonb | Not null |
| expire | timestamp | Not null, indexed |

#### `user_state`

| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| userId | text | Not null |
| screenTimeMinutes | integer | Not null, default 0 |
| hasOnboarded | boolean | Not null, default false |

#### `priorities`

| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| userId | text | Not null |
| content | text | Not null |

#### `tasks`

| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| userId | text | Not null |
| content | text | Not null |
| tier | text | "focus" / "backlog" / "icebox", default "focus" |
| status | text | "pending" / "completed", default "pending" |
| createdAt | timestamp | Not null, default `now()` |
| completedAt | timestamp | Nullable |
| nudge | text | Nullable (latest nudge text) |
| nudgeCount | integer | Not null, default 0 |
| nudgeHistory | text[] | Array of all nudge texts |
| parentId | integer | Nullable (for sub-tasks) |

### API Routes

All routes require authentication via `isAuthenticated` middleware. Data is scoped per user via `userId`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/user` | Get current authenticated user |
| GET | `/api/user-state` | Get user state (screen time, onboarding status) |
| PATCH | `/api/user-state` | Update user state |
| GET | `/api/priorities` | List user priorities |
| POST | `/api/priorities/bulk` | Create priorities (batch) |
| GET | `/api/tasks` | List all user tasks |
| POST | `/api/tasks` | Create single task |
| POST | `/api/tasks/bulk` | Create tasks (batch) |
| PATCH | `/api/tasks/:id` | Update task (content, tier, status, nudge) |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/ai/process-dump` | AI: parse brain dump → categorized tasks |
| POST | `/api/ai/nudge/:id` | AI: generate next nudge for a task |
| POST | `/api/ai/breakdown/:id` | AI: break task into sub-steps |

### Key Frontend Components

| Component | File | Responsibility |
|---|---|---|
| Header | `components/Header.tsx` | App title, language toggle, theme toggle, logout |
| Navigation | `components/Navigation.tsx` | Bottom tab bar: Today / Dump / Queue |
| MonthlyStreak | `components/MonthlyStreak.tsx` | GitHub-style heatmap calendar |
| AuroraBackground | `components/AuroraBackground.tsx` | Placeholder (returns null) |
| ThemeProvider | `lib/theme.tsx` | Light/dark mode with localStorage persistence |
| i18n | `lib/i18n.ts` | EN/ZH translation dictionary and hooks |

### Bilingual Support (EN/ZH)
Custom lightweight i18n system in `client/src/lib/i18n.ts`:
- Translation keys for all UI text in English and Chinese
- `useI18n()` hook returns current language and `t()` function
- Language persisted to `localStorage`
- Toggle button in Header, Landing, and Onboarding pages

---

## 7. Design System

### Theme: Warm Newsprint / Paper & Ink

The design evokes the feeling of writing on quality paper with ink — warm, tactile, and distraction-free. No shadows, no gradients, no neon effects. Borders only for separation.

### Color Palette

#### Light Mode

| Token | Hex | Usage |
|---|---|---|
| --paper-bg | #F5F0E8 | Warm cream paper background |
| --paper-fg | #1C1917 | Near-black ink for primary text |
| --paper-secondary | #44403C | Dark warm gray (~7:1 contrast) |
| --paper-tertiary | #78716C | Disabled/hint text (~4.5:1 contrast) |
| --paper-border | #DDD6C8 | Subtle warm borders |
| --paper-card-bg | #EFE9DC | Card backgrounds |
| --paper-accent | #2C2825 | Button backgrounds (dark) |
| --paper-today-bg | #2C2825 | Today cell highlight (inverted) |
| --paper-today-fg | #F5F0E8 | Today cell text (inverted) |

#### Dark Mode (Warm Leather)

| Token | Hex | Usage |
|---|---|---|
| --paper-bg | #1c1915 | Warm dark brown background |
| --paper-fg | #e8dfd3 | Light cream text |
| --paper-secondary | #a89d8e | Muted warm gray (~5:1 contrast) |
| --paper-muted | #c8bfb0 | High-contrast labels |
| --paper-border | #332e27 | Subtle dark borders |
| --paper-card-bg | #242019 | Card backgrounds |
| --paper-accent | #e8dfd3 | Button backgrounds (inverted) |
| --paper-today-bg | #e8dfd3 | Today cell highlight (inverted) |
| --paper-today-fg | #1c1915 | Today cell text (inverted) |

### Typography

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Headings | Cormorant Garamond | 500–600 | Varies | Page titles, section headers |
| Body | EB Garamond | 400–500 | 1.05rem, line-height 1.45 | Task content, descriptions |
| Labels/Metadata | IBM Plex Mono | 300–500 | 0.7–0.75rem, letter-spacing 0.5–1.5px | Tier labels, timestamps, counts |

### Styling Patterns
- Theme-sensitive colors: `style={{ color: 'var(--paper-fg)' }}` (inline CSS variables)
- Structural layout: Tailwind utility classes (flex, padding, margins)
- Custom CSS classes: `.paper-card`, `.paper-btn`, `.paper-border`, `.fade-up`
- `.paper-btn` uses `--paper-accent` (dark in light mode, light in dark mode)

### Animation Patterns
- **Page transitions:** Framer Motion slide with direction awareness
- **Onboarding demos:** Staggered fade-in with scale transforms
- **Nudge expand/collapse:** CSS `max-height` transition (0 → 400px, 300ms ease)
- **Drag overlay:** 1.02 scale + subtle shadow during drag
- **Navigation active state:** Framer Motion layout animation on tab indicator

### Design Influences
- Apple Notes (simplicity, paper metaphor)
- Things 3 (tier-based organization, clean typography)
- GitHub Contributions (streak heatmap)
- iMessage (chat-bubble dump interface)

---

## 8. Known Issues & Planned Fixes

| Issue | Severity | Location | Details |
|---|---|---|---|
| AuroraBackground returns null | Low | `components/AuroraBackground.tsx` | Placeholder component — no visual effect rendered |
| Nudge max-height cap | Low | `index.css` | `.nudge-text.expanded` uses `max-height: 400px` — very long AI responses may clip |
| Queue in-tier reorder | Medium | `pages/Queue.tsx` | Drag-and-drop handles tier changes but lacks position/order tracking within a tier |
| No order field on tasks | Medium | `shared/schema.ts` | Tasks have no `sortOrder` column — within-tier ordering relies on creation order |
| Hardcoded reward value | Low | `pages/Today.tsx` | +10 minutes per task is hardcoded, not configurable |
| Dump ack is simulated | Low | `pages/Dump.tsx` | System acknowledgment message uses `setTimeout` — locally generated, not from AI |
| No task deduplication at DB level | Low | `server/routes.ts` | Dedup happens in the AI prompt/response parsing, not via unique constraints |

---

## 9. What's NOT Built (Current Scope Boundaries)

The following features are explicitly excluded from v1:

- **Notifications / reminders** — No push notifications or scheduled alerts
- **Calendar integration** — No sync with Google Calendar, Apple Calendar, etc.
- **Team / shared tasks** — Strictly single-user (multi-tenant, but no collaboration)
- **Due dates / deadlines** — Tasks are undated; urgency is expressed through tiers only
- **Recurring tasks** — No repeat logic
- **File attachments** — Text-only tasks
- **Offline mode** — Requires internet for all operations (AI features and data sync)
- **Native mobile app** — Web-only (PWA not configured)
- **Analytics / insights** — No weekly reports, productivity graphs, or AI-generated summaries
- **Search / filter** — No text search or advanced filtering on Queue
- **Undo / task recovery** — Deleted tasks are permanently removed
- **Daily reset / review flow** — No morning standup or end-of-day reflection
- **Procrastination check** — No friction prompt when demoting Focus tasks

---

## 10. Roadmap

### Phase 1: Foundation Polish (Current)
- [x] Multi-user auth (Replit OIDC)
- [x] 7-page animated onboarding
- [x] Brain Dump → AI triage
- [x] 3-tier task management (Focus/Can Wait/Never Mind)
- [x] Progressive 5-nudge system
- [x] Guilt-free social media reward
- [x] Monthly streak heatmap
- [x] Full bilingual support (EN/ZH)
- [x] Dark mode (warm leather theme)
- [x] Mobile-optimized input with keyboard awareness
- [x] Touch-friendly drag-and-drop

### Phase 2: Daily Rituals
- [ ] Morning flow: "Here's your Focus for today" summary
- [ ] End-of-day review: "You completed X tasks" with reflection prompt
- [ ] Daily reset: auto-rotate tasks based on completion patterns
- [ ] Configurable reward amounts (not just +10 min)

### Phase 3: Task Intelligence
- [ ] Task search and filtering
- [ ] Within-tier ordering (sort order field)
- [ ] Due dates and time horizons (Today / This Week / This Month)
- [ ] Recurring tasks
- [ ] Procrastination check when demoting Focus tasks
- [ ] Undo / task recovery (soft delete)

### Phase 4: Engagement
- [ ] Push notifications / reminder nudges
- [ ] Weekly productivity summary (AI-generated)
- [ ] Streak rewards and milestones
- [ ] PWA configuration for home screen install

### Phase 5: Platform Expansion
- [ ] Calendar integration (Google Calendar, Apple Calendar)
- [ ] Export/import tasks
- [ ] API for third-party integrations
- [ ] Multi-language expansion beyond EN/ZH

---

*This document reflects the application as built. For implementation details, see the codebase at the file paths referenced in each section.*
