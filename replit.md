# BrainDump AI

## Overview
BrainDump AI is a minimal, mobile-first web app for overthinkers. It helps users capture thoughts instantly (brain dump), uses AI to sort them into actionable tiers (Focus/Backlog/Icebox), and provides micro-step nudges and task breakdowns. Multi-user with Replit Auth (Google, GitHub, Apple, email sign-in).

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
- **Background**: #f5efe7 (warm cream paper)
- **Primary text**: #2b2520 (dark espresso brown)
- **Secondary text**: #9e9484
- **Tertiary/disabled**: #c5baa8
- **Borders**: #ddd5c8
- **Active/hover**: #e8dfd3
- **Today cell**: bg #2b2520, text #f6f1eb (inverted)

### Dark Mode
- **Background**: #1a1a1f (dark charcoal)
- **Primary text**: #e8e0d4 (warm light)
- **Secondary text**: #8a8078
- **Tertiary/disabled**: #5a524a
- **Borders**: #2e2e35
- **Active/hover**: #2a2a32
- **Today cell**: bg #e8e0d4, text #1a1a1f (inverted)

### Typography
- **Headings**: Source Serif 4, Georgia, serif — weight 700 (app title 1.9rem), weight 600 sections
- **Body text**: Source Serif 4, 1.05rem, weight 400, line-height 1.45
- **Labels/metadata**: IBM Plex Mono, 0.6-0.72rem, weight 400-500, letter-spacing 0.5-1.5px

### Styling Pattern
- All theme-sensitive colors use `style={{ color: 'var(--paper-fg)' }}` inline styles (not Tailwind color classes)
- Structural classes (flex, padding, margins, etc.) still use Tailwind
- Custom CSS classes: .paper-card, .paper-btn, .paper-border, .fade-up — all use CSS variables
- No shadows, no gradients, no neon/glow effects — borders only for separation

### CSS Variables (--paper-*)
- --paper-bg, --paper-fg, --paper-secondary, --paper-tertiary, --paper-border
- --paper-active, --paper-hover, --paper-separator, --paper-card-bg
- --paper-today-bg, --paper-today-fg, --paper-muted, --paper-subtle
- --paper-track, --paper-overlay, --paper-empty, --paper-mid
- --paper-delete-bg, --paper-delete-fg, --paper-edit-bg, --paper-edit-fg
- --paper-streak-empty

## Key Features
1. **Authentication**: Replit Auth with Google SSO, GitHub, Apple, email/password. Landing page for logged-out users.
2. **Onboarding**: 7-page swipeable onboarding with animated demos, then set top 3 priorities — per user
3. **Dump Tab**: Chat-like interface to dump thoughts. AI auto-processes and saves tasks. No confirmation screens.
4. **Queue Tab**: View tasks in Focus/Backlog/Icebox tiers with drag-and-drop reordering. Inline editing. Swipe-to-reveal edit/delete.
5. **Today Tab**: Focus tasks with progressive Nudge (micro-step). Completing tasks earns guilt-free social media time.
6. **Reward System**: +10 min social media time per completed task, displayed prominently with progress bar.
7. **Language Toggle**: EN/中文 switch in header, persisted to localStorage
8. **Dark Mode Toggle**: Moon/Sun icon next to language button in Header, Landing, Onboarding — persisted to localStorage
9. **Monthly Streak**: GitHub-style calendar heatmap showing completed tasks per day

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
- Added full dark mode support with ThemeProvider context and CSS custom properties
- All hardcoded hex colors replaced with --paper-* CSS variables in :root and .dark overrides
- Moon/Sun toggle icon added next to language button in Header, Landing, and Onboarding
- Dark mode persisted to localStorage, applied via document.documentElement.classList
- Warm newsprint UI: paper-card, paper-btn, paper-border CSS classes use CSS variables
- Fonts: Source Serif 4 (headings/body) and IBM Plex Mono (labels/metadata)
- AuroraBackground component returns null (no animated background)
- Calendar streak uses warm brown intensity scale with CSS variable colors
- Checkboxes: 22px circles with brown borders, completed state fills with --paper-fg
- Task items use 1px border-bottom separators via --paper-separator
- Progress bar: 3px height, --paper-fg fill on --paper-track track
- Navigation is shrink-0 in-flow element for proper flex layout
- DnD uses setActivatorNodeRef for drag handle separation from swipe
- 100dvh for proper mobile browser viewport handling

## Running
`npm run dev` starts Express backend + Vite frontend on port 5000.
