# BrainDump AI — Version 1 Build Instructions

A consolidated specification document capturing every idea, design decision, and iteration that shaped BrainDump AI v1. This document is written so that someone could rebuild the app from scratch and arrive at the same result.

---

## 1. Core Concept

**BrainDump AI** is a minimal, mobile-first, dark-mode-only web app designed for ambitious overthinkers. The core problem it solves: people who think too much and do too little. They have dozens of ideas and to-dos swirling in their head, but struggle to take action.

**Catchphrase:** "A to-do list built for ambitious overthinkers to get things done."

**Key philosophy:** While the app uses AI under the hood, it never advertises itself as an "AI app." The AI is invisible — users experience smart sorting and helpful nudges, but the marketing and UI never say "AI does this for you." The app should be judged on the merit of the experience itself.

---

## 2. Target Audience

- Ambitious people who overthink and over-plan
- People who have too many ideas but struggle with execution
- Bilingual users (English and Chinese)
- Mobile-first users (the app is designed for phone screens)

---

## 3. Visual Design Language

### 3.1 Overall Aesthetic
- **Inspiration:** Raycast-style dark UI with glassmorphism
- **Color scheme:** Dark mode only, no light mode
- **Primary accent:** Neon blue `#3B82F6` used throughout for buttons, active states, glows, and highlights
- **Max width:** 480px centered on screen (simulates a phone frame)
- **Typography:** Clean, tight tracking (`tracking-tighter` for headings), monospace for numbers

### 3.2 Glassmorphism Cards
Every card and interactive surface uses frosted glass styling:
- `backdrop-filter: blur(24px)`
- Semi-transparent background: `rgba(255, 255, 255, 0.02)`
- Subtle white border: `rgba(255, 255, 255, 0.04)`
- Neon blue glow on borders: `0 0 15px rgba(59, 130, 246, 0.08)`

### 3.3 CSS Utility Classes
```css
.glass-card        — Frosted glass background with blur
.neon-border-subtle — Thin border with faint neon blue glow
.neon-glow         — Stronger neon blue glow effect
.neon-dot          — Tiny pulsing neon blue dot
.neon-btn          — Button with neon blue shadow on hover
```

### 3.4 Aurora Background (Telegram-style)
- Three flowing light bands (NOT circular orbs)
- Slow drifting animations (30–40 second cycles)
- Heavy blur (`filter: blur(90px)`) for soft, ambient glow
- Moderate brightness — visible but not distracting
- Neon blue color palette with varying opacity (0.14–0.30)
- Band shapes: Large ellipses (600–800px) positioned at different parts of the screen
- CSS keyframe animations for gentle vertical/horizontal drift

**Iteration notes:**
- First version used circular "orbs" — changed to elongated flowing "bands" to match Telegram's aurora style
- Brightness was iterated multiple times: started too bright, went too dim, settled on a midpoint

### 3.5 Navigation
- Fixed bottom nav bar with three tabs: Today, Dump, Queue
- Glass card styling with animated pill indicator (framer-motion `layoutId`)
- Gradient fade at bottom edge to blend with content

### 3.6 Header
- App title "BrainDump AI" on the left
- Language toggle button (EN/中文) on the right
- Small neon blue status dot

---

## 4. Internationalization (i18n)

### 4.1 Implementation
- Custom lightweight i18n system (no external library)
- Toggle between English (`en`) and Chinese (`zh`)
- Language preference persisted to `localStorage` under key `braindump-lang`
- Listener pattern for real-time re-rendering on language switch
- Every visible string in the app goes through the `t()` translation function

### 4.2 Coverage
Full translation coverage across:
- Navigation labels
- Onboarding (all 6 pages)
- Today page (guilt-free time, nudges, breakdowns, completion messages)
- Dump page (welcome message, sorting feedback, error messages, acknowledgments)
- Queue page (tier names, drag feedback)
- Monthly streak component

### 4.3 Acknowledgment Messages
When a user sends a dump message, the system responds with a random casual acknowledgment:
- English: "Copy that", "Got it", "Noted", "On the list", "Logged", "Captured"
- Chinese: "收到", "了解", "已记录", "已列入", "已记下", "已捕获"

---

## 5. Onboarding Flow

### 5.1 Structure
Six swipeable pages using framer-motion drag gestures:

**Page 0 — Hero**
- App name: "BrainDump AI"
- Catchphrase: "A to-do list built for ambitious overthinkers to get things done."

**Page 1 — Set Your Priorities**
- Icon: Target
- "Tell us what matters most. We'll use your priorities to decide what deserves your focus."

**Page 2 — Dump → Auto Sort**
- Icon: Brain
- "Dump all your thoughts. We'll sort them into Focus, Can Wait, and Never Mind based on your priorities."

**Page 3 — Nudge to Start**
- Icon: Zap
- "Stuck? Get a tiny micro-step so easy you can't say no. Two minutes or less to get moving."

**Page 4 — Earn Screen Time**
- Icon: Trophy
- "Complete tasks, earn guilt-free screen time. +10 minutes for every task you finish."

**Page 5 — Priorities Input**
- Title: "What matters most to you in the next 3 months?"
- Subtitle: "Define your top 3 priorities. We'll sort your tasks based on these."
- Three text input fields
- "All Set" button to complete onboarding

### 5.2 Interactions
- Swipe left/right between intro pages (pages 0–4)
- Swipe threshold: 50px
- Arrow button to advance (pages 0–3)
- "Let's Go" button on page 4 to enter priorities
- Progress dots at bottom (5 dots, active dot is wider and neon blue)
- "Swipe to continue" hint text at bottom left

### 5.3 Design Iterations
- Originally a simple 2-step flow (intro + priorities)
- Redesigned to 6-page swipeable flow to properly showcase all features before asking for priorities
- AI mentions removed from all onboarding copy — uses "We'll" instead
- Priorities question changed from "What matters most?" to "What matters most to you in the next 3 months?"

---

## 6. Task Tiers (Colloquial Names)

### 6.1 Naming
The three tiers use friendly, colloquial labels instead of technical project management terms:

| Internal Value | Display Name (EN) | Display Name (ZH) | Meaning |
|---|---|---|---|
| `focus` | Focus | 专注 | Top priority, do this now |
| `backlog` | Can Wait | 可以等 | Useful but not urgent |
| `icebox` | Never Mind | 算了吧 | Not worth doing right now |

### 6.2 Iteration Notes
- Originally used "Backlog" and "Icebox" (technical terms)
- Changed to "Can Wait" and "Never Mind" for a more approachable, human feel
- Internal database values remain `focus`, `backlog`, `icebox` for compatibility

---

## 7. The Three Tabs

### 7.1 Today Tab
The daily focus view showing only what matters right now.

**Components:**
- **Monthly Streak Heatmap** — GitHub-style calendar grid showing task completion density for the current month. Whiter = more tasks completed that day. Shows total completed count and active days.
- **Guilt-Free Time Card** — Large number display of accumulated screen time minutes. Monospace font, glassmorphism card with ambient halo glow.
- **Focus Tasks List** — Only shows tasks in the `focus` tier with `pending` status. Each task card has:
  - Circle checkbox to mark complete
  - Task content text
  - "Nudge Me" button — generates a micro-step
  - "Break It Down" button — generates 3–7 sub-steps
  - Displayed nudge text (if generated) in a highlighted box
  - Sub-tasks indented below parent task
- **Completed Today Section** — Faded, strikethrough list of tasks completed today
- **All Done State** — When no focus tasks remain, shows celebratory message with earned minutes

**Task Completion:**
- Confetti animation (canvas-confetti) on completion
- Blue confetti particles matching neon theme
- +10 minutes added to screen time
- Toast notification: "+10 min earned — Guilt-free screen time banked."

### 7.2 Dump Tab
Chat-style interface for capturing thoughts quickly.

**Design:**
- Messenger/chat bubble layout
- User messages appear right-aligned with neon blue background
- System messages appear left-aligned with glassmorphism style
- Welcome message: "What's on your mind? Dump everything here."
- Text area input at bottom with send button
- Enter key sends (Shift+Enter for newline)

**Flow:**
1. User types thoughts, one at a time (each becomes a chat bubble)
2. System responds with random acknowledgment ("Got it", "Noted", etc.)
3. User keeps dumping as many thoughts as they want
4. When ready, taps "Done - Sort My Stuff" button
5. All accumulated thoughts are sent to AI for processing
6. System responds with count: "Sorted X tasks into your queue"
7. Tasks are auto-saved to the database, deduplicated against existing tasks

**Sort Button:**
- Only appears after user has sent at least one message
- Neon blue rounded pill with sparkle icon
- Shows "Sorting..." with spinning animation during processing

### 7.3 Queue Tab
View and manage all tasks across three tiers.

**Layout:**
- Three sections stacked vertically: Focus, Can Wait, Never Mind
- Each section has a colored header with icon and count
  - Focus: red/flame icon
  - Can Wait: yellow/archive icon
  - Never Mind: blue/snowflake icon
- Empty sections show "Drag tasks here" placeholder

**Interactions:**
- **Drag and drop** between tiers using @dnd-kit
  - Pointer sensor with 8px activation distance
  - Drag overlay with enhanced glow effect
  - Toast notification on tier change: "Moved to [tier name]"
- **Inline editing** — Click any task text to edit inline (no edit icon)
  - Enter to save, Escape to cancel, blur to save
- **Delete** — Trash icon appears on hover, red on hover

---

## 8. AI Features

### 8.1 Model Choice
- **Claude 3.5 Haiku** (`claude-3-5-haiku-20241022`) via Anthropic SDK
- Chosen specifically for speed (4–5x faster than Sonnet)
- All three AI endpoints use the same model

### 8.2 Brain Dump Processing (`POST /api/ai/process-dump`)
- Takes raw dump text + user's saved priorities
- System prompt instructs the model to extract actionable to-dos and sort into tiers
- Returns JSON array of `{content, tier}` objects
- Deduplication: checks against existing tasks (case-insensitive) before saving
- `extractJSON` helper strips markdown code fences from Claude responses

### 8.3 Nudge Generation (`POST /api/ai/nudge/:id`)
- Takes a single task
- System prompt: "Provide the absolute smallest first step for this task. Something so easy you can't say no. Two minutes or less."
- Returns a single short string
- Saved to the task's `nudge` field in the database
- Displayed inline on the task card

### 8.4 Task Breakdown (`POST /api/ai/breakdown/:id`)
- Takes a single task
- System prompt asks for 3–7 small, concrete, actionable steps
- Returns JSON array of step strings
- Displayed in a modal dialog with numbered steps
- "Add All Steps to My List" button creates sub-tasks (with `parentId` linking to parent)

### 8.5 AI Personality
- AI is invisible — no "AI" label on any response in the UI
- Error message says "Brain Freeze" not "AI Brain Freeze"
- Onboarding says "We'll sort" not "AI will sort"

---

## 9. Reward System

- Each completed task earns **+10 minutes** of guilt-free screen time
- Screen time accumulates and is displayed prominently on the Today page
- Large monospace number with "min" label
- Persisted in `user_state.screenTimeMinutes` in the database
- When all focus tasks are done: "All done for today. You earned X minutes. Go enjoy them."

---

## 10. Data Model

### Tables
```
user_state
  - id (serial, PK)
  - screenTimeMinutes (integer, default 0)
  - hasOnboarded (boolean, default false)

priorities
  - id (serial, PK)
  - content (text)

tasks
  - id (serial, PK)
  - content (text)
  - tier (text enum: focus/backlog/icebox, default focus)
  - status (text enum: pending/completed, default pending)
  - createdAt (timestamp)
  - completedAt (timestamp, nullable)
  - nudge (text, nullable)
  - parentId (integer, nullable — for sub-tasks)
```

---

## 11. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Routing | wouter |
| Animations | framer-motion |
| Drag & Drop | @dnd-kit |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Confetti | canvas-confetti |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| AI | Anthropic Claude 3.5 Haiku |
| Validation | Zod |
| Data Fetching | TanStack React Query v5 |
| i18n | Custom (no library) |

---

## 12. API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/user-state | Get screen time and onboarding status |
| PATCH | /api/user-state | Update screen time or onboarding flag |
| GET | /api/priorities | List user priorities |
| POST | /api/priorities/bulk | Create multiple priorities at once |
| GET | /api/tasks | List all tasks |
| POST | /api/tasks | Create a single task |
| POST | /api/tasks/bulk | Create multiple tasks at once |
| PATCH | /api/tasks/:id | Update task (content, tier, status, nudge) |
| DELETE | /api/tasks/:id | Delete a task |
| POST | /api/ai/process-dump | Process brain dump text into sorted tasks |
| POST | /api/ai/nudge/:id | Generate micro-step nudge for a task |
| POST | /api/ai/breakdown/:id | Generate 3–7 step breakdown for a task |

---

## 13. Project Structure

```
shared/
  schema.ts          — Drizzle database schema + Zod types
  routes.ts          — API route definitions with Zod validation

server/
  routes.ts          — Express route handlers + Anthropic AI logic
  storage.ts         — Database CRUD operations

client/src/
  pages/
    Onboarding.tsx   — 6-page swipeable onboarding flow
    Today.tsx        — Daily focus view with nudge/breakdown
    Dump.tsx         — Chat-style thought capture
    Queue.tsx        — Drag-and-drop task management
  components/
    Header.tsx       — App title + language toggle
    Navigation.tsx   — Bottom tab bar
    MonthlyStreak.tsx — GitHub-style heatmap
    AuroraBackground.tsx — Animated aurora bands
  hooks/
    use-tasks.ts     — Task CRUD hooks
    use-ai.ts        — AI feature hooks
    use-user-state.ts — User state hooks
    use-priorities.ts — Priority hooks
  lib/
    i18n.ts          — Internationalization system
    queryClient.ts   — TanStack Query configuration
  index.css          — Global styles, aurora, glassmorphism, neon utilities
```
