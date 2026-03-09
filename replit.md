# BrainDump

## Overview
BrainDump is a minimal, mobile-first web app for overthinkers. It helps users capture thoughts instantly (brain dump), uses AI to sort them into actionable tiers (Focus/Backlog/Icebox), and provides micro-step nudges and task breakdowns. Multi-user with Replit Auth (Google, GitHub, Apple, email sign-in).

## Architecture
- **Frontend**: React + Vite, wouter routing, framer-motion animations, @dnd-kit drag-and-drop, shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OIDC) — supports Google, GitHub, Apple, email/password login
- **AI**: Anthropic Claude (claude-haiku-4-5) via @anthropic-ai/sdk — optimized for speed
- **Styling**: Tailwind CSS, warm newsprint/paper theme with dark mode, full-width layout
- **Theme**: ThemeProvider context (client/src/lib/theme.tsx) with light/dark toggle, persisted to localStorage
- **i18n**: Custom lightweight i18n system with English/Chinese toggle (client/src/lib/i18n.ts)

## Design System — Warm Newsprint / Paper & Ink
All colors use CSS custom properties (--paper-*) defined in index.css for automatic light/dark adaptation.

### Light Mode
- **Background**: #F5F0E8 (warm cream paper)
- **Primary text**: #1C1917 (near-black ink)
- **Secondary text**: #44403C (dark warm gray, ~7:1 contrast)
- **Tertiary/disabled**: #78716C (~4.5:1 contrast)
- **Borders**: #DDD6C8
- **Card bg**: #EFE9DC
- **Accent (buttons)**: #2C2825
- **Today cell**: bg #2C2825, text #F5F0E8 (inverted)

### Dark Mode (warm dark leather, not blue-black)
- **Background**: #1c1915 (warm dark brown)
- **Card backgrounds**: #242019
- **Primary text**: #e8dfd3
- **Secondary text**: #a89d8e (~5:1 contrast)
- **Tertiary/disabled**: #7a6e62
- **Muted**: #c8bfb0 (high contrast for labels)
- **Borders**: #332e27
- **Accent (buttons)**: #e8dfd3 (inverted)
- **Today cell**: bg #e8dfd3, text #1c1915 (inverted)

### Typography
- **Headings**: Cormorant Garamond (--font-heading, Tailwind: font-heading) — weight 500-600
- **Body text**: EB Garamond (--font-body, Tailwind: font-body) — weight 400-500, 1.05rem, line-height 1.45
- **Labels/metadata**: IBM Plex Mono (--font-mono, Tailwind: font-mono) — 0.7-0.75rem, weight 300-500, letter-spacing 0.5-1.5px

### Styling Pattern
- All theme-sensitive colors use `style={{ color: 'var(--paper-fg)' }}` inline styles (not Tailwind color classes)
- Structural classes (flex, padding, margins, etc.) still use Tailwind
- Custom CSS classes: .paper-card, .paper-btn, .paper-border, .fade-up — all use CSS variables
- .paper-btn uses --paper-accent for background (dark in light mode, light in dark mode)
- No shadows, no gradients, no neon/glow effects — borders only for separation

### CSS Variables (--paper-*)
- --paper-bg, --paper-fg, --paper-secondary, --paper-tertiary, --paper-border
- --paper-active, --paper-hover, --paper-separator, --paper-card-bg
- --paper-today-bg, --paper-today-fg, --paper-muted, --paper-subtle
- --paper-track, --paper-overlay, --paper-empty, --paper-mid
- --paper-delete-bg, --paper-delete-fg, --paper-edit-bg, --paper-edit-fg
- --paper-streak-empty, --paper-input-bg, --paper-accent

## Key Features
1. **Authentication**: Replit Auth with Google SSO, GitHub, Apple, email/password. Landing page for logged-out users.
2. **Onboarding**: 7-page swipeable onboarding with animated demos, then set top 3 priorities — per user
3. **Dump Tab**: Chat-like interface to dump thoughts. AI auto-processes and saves tasks. Fixed-bottom input bar stays visible when mobile keyboard opens (visualViewport API).
4. **Queue Tab**: View tasks in Focus/Backlog/Icebox tiers with drag-and-drop reordering. Touch-friendly sensors (PointerSensor distance:8, TouchSensor delay:150ms, KeyboardSensor). Inline editing. Swipe-to-reveal edit/delete.
5. **Today Tab**: Focus tasks with iterative 5-nudge progressive system. Collapsible nudge text with expand/collapse animation. Progress dots (1/5 to 5/5). "Got it, what's next?" button. Completion message at nudge 5.
6. **AI Nudges**: Context-aware — considers other active tasks to infer intent. Progressive: 5 nudges get user ~60% through any task. Nudge history persisted in database.
7. **Reward System**: +10 min social media time per completed task, displayed prominently with progress bar.
8. **Language Toggle**: EN/中文 switch in header, persisted to localStorage
9. **Dark Mode Toggle**: Moon/Sun icon next to language button in Header, Landing, Onboarding — persisted to localStorage
10. **Monthly Streak**: GitHub-style calendar heatmap showing completed tasks per day

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
client/src/components/  - Header, Navigation, MonthlyStreak, AuroraBackground (returns null)
client/src/lib/i18n.ts  - Internationalization (EN/ZH translations)
client/src/lib/theme.tsx - ThemeProvider context with light/dark toggle
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
- Fix: Dump page input now uses fixed-bottom bar with visualViewport keyboard offset (iOS mobile keyboard fix)
- Fix: Collapsible nudge text with CSS max-height transition (.nudge-text / .nudge-text.expanded classes)
- Feature: Iterative 5-nudge progressive system — nudgeHistory text array stored in DB, progress dots UI, "Got it, what's next?" flow
- Feature: Context-aware nudge prompts — AI considers other active tasks to infer intent and prerequisites
- Fix: Queue drag-and-drop — PointerSensor distance 8, KeyboardSensor added, improved DragOverlay with scale+shadow
- Schema: Added nudgeHistory text array column to tasks table
- Improved readability: boosted contrast on secondary/tertiary/muted/subtle colors in both light and dark mode
- Increased font sizes: labels from 0.6rem→0.72rem, metadata from 0.55rem→0.7rem, descriptions from text-sm→text-base
- Full dark mode with warm leather tones (not blue-gray)

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000.
