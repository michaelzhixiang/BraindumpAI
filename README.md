# BrainDump

A minimal, mobile-first web app for overthinkers. Capture thoughts instantly, let AI sort them into actionable tiers, and get micro-step nudges to stay unblocked.

## Features

- **Brain Dump** — Chat-like interface to dump your thoughts. Type freely, and AI auto-processes your text into organized tasks.
- **Smart Task Triage** — AI sorts tasks into Focus (do now), Backlog (can wait), and Icebox (never mind) tiers based on your priorities.
- **Progressive Nudges** — AI-powered micro-step nudges that build on each other. 5 nudges get you 60% of the way through any task.
- **Today View** — See your Focus tasks. Complete tasks to earn guilt-free social media time (+10 min per task).
- **Queue Management** — Drag-and-drop reordering within and across tiers. Swipe to edit or delete. Inline editing.
- **Monthly Streak** — GitHub-style calendar heatmap showing your completed tasks per day.
- **Dark Mode** — Warm leather-toned dark theme (not blue-gray). Toggle persisted to localStorage.
- **Bilingual** — Full English/Chinese (EN/中文) interface with one-tap toggle.
- **Multi-User** — Authentication via Replit Auth (Google, GitHub, Apple, email). All data scoped per user.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Routing | wouter |
| State | TanStack React Query v5 |
| UI Components | shadcn/ui, Radix UI |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit |
| Styling | Tailwind CSS |
| Backend | Express.js 5, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI | Anthropic Claude (claude-haiku-4-5) |
| Auth | Replit Auth (OpenID Connect) |

## Design System — Warm Newsprint / Paper & Ink

The visual identity uses a warm, paper-inspired palette with high-contrast readability.

### Typography
- **Headings**: Cormorant Garamond (500-600 weight)
- **Body text**: EB Garamond (400-500 weight, 1.05rem, line-height 1.45)
- **Labels/metadata**: IBM Plex Mono (300-500 weight, 0.7-0.75rem, letter-spacing 0.5-1.5px)

### Color Palette

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Background | `#F5F0E8` (warm cream) | `#1c1915` (warm dark brown) |
| Primary text | `#1C1917` (near-black ink) | `#e8dfd3` |
| Secondary text | `#44403C` (~7:1 contrast) | `#a89d8e` (~5:1 contrast) |
| Tertiary | `#78716C` (~4.5:1 contrast) | `#7a6e62` |
| Borders | `#DDD6C8` | `#332e27` |
| Card background | `#EFE9DC` | `#242019` |
| Accent (buttons) | `#2C2825` | `#e8dfd3` |

All colors are defined as CSS custom properties (`--paper-*`) in `client/src/index.css` for automatic light/dark adaptation.

## Project Structure

```
braindump/
├── client/
│   └── src/
│       ├── components/        # Shared UI components
│       │   ├── Header.tsx     # App header with language & theme toggles
│       │   ├── Navigation.tsx # Bottom tab navigation
│       │   ├── MonthlyStreak.tsx # GitHub-style streak calendar
│       │   └── ui/            # shadcn/ui components
│       ├── hooks/             # Custom React hooks
│       │   ├── use-tasks.ts   # Task CRUD operations
│       │   ├── use-ai.ts      # AI mutation hooks (dump processing, nudges)
│       │   ├── use-user-state.ts # User state (screen time, onboarding)
│       │   ├── use-priorities.ts # User priorities
│       │   └── use-auth.ts    # Authentication hook
│       ├── lib/
│       │   ├── i18n.ts        # Internationalization (EN/ZH translations)
│       │   ├── theme.tsx      # ThemeProvider context (light/dark)
│       │   ├── queryClient.ts # TanStack Query config
│       │   └── utils.ts       # Utility functions
│       ├── pages/
│       │   ├── Landing.tsx    # Landing page (unauthenticated users)
│       │   ├── Onboarding.tsx # 7-page swipeable onboarding flow
│       │   ├── Today.tsx      # Daily focus view with nudges & rewards
│       │   ├── Dump.tsx       # Brain dump chat interface
│       │   └── Queue.tsx      # Task queue with drag-and-drop
│       ├── App.tsx            # Root app with routing
│       └── index.css          # Global styles & CSS variables
├── server/
│   ├── routes.ts              # Express API routes & AI logic
│   ├── storage.ts             # Database CRUD (Drizzle ORM)
│   ├── db.ts                  # Database connection
│   ├── index.ts               # Server entry point
│   └── replit_integrations/   # Replit Auth OIDC integration
│       └── auth/
├── shared/
│   ├── schema.ts              # Drizzle schema & Zod types
│   ├── routes.ts              # API route definitions with validation
│   └── models/
│       └── auth.ts            # Users & sessions tables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── drizzle.config.ts
```

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+
- **Anthropic API Key** — Get one at [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/braindump.git
cd braindump

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/braindump
ANTHROPIC_API_KEY=sk-ant-...

# Required for auth (Replit Auth specific)
SESSION_SECRET=your-random-session-secret

# Optional — Replit Auth requires these in production
REPL_ID=your-repl-id
REPLIT_DEPLOYMENT=1
ISSUER_URL=https://replit.com/oidc
```

> **Note on Authentication**: This app uses Replit Auth (OpenID Connect) for authentication. If you are deploying outside of Replit, you will need to replace the auth integration in `server/replit_integrations/auth/` with your own auth provider (e.g., Passport.js with Google/GitHub OAuth, NextAuth, Clerk, etc.).

### Database Setup

```bash
# Push the schema to your PostgreSQL database
npm run db:push
```

### Running

```bash
# Development (Express + Vite on port 5000)
npm run dev

# Production build
npm run build
npm start
```

The app will be available at `http://localhost:5000`.

## API Reference

All endpoints require authentication. Data is scoped per user.

### User State
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/user-state` | Get screen time & onboarding status |
| `PATCH` | `/api/user-state` | Update screen time or onboarding status |

### Priorities
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/priorities` | List user priorities |
| `POST` | `/api/priorities/bulk` | Create multiple priorities |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks` | Create a single task |
| `POST` | `/api/tasks/bulk` | Create multiple tasks |
| `PATCH` | `/api/tasks/:id` | Update a task (content, tier, status, nudge) |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### AI
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/process-dump` | Process brain dump text into categorized tasks |
| `POST` | `/api/ai/nudge/:id` | Generate progressive micro-step nudge for a task |

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/user` | Get current authenticated user |
| `GET` | `/api/login` | Initiate login flow |
| `GET` | `/api/logout` | Log out |
| `GET` | `/api/callback` | OAuth callback |

## Database Schema

```sql
-- User state (screen time, onboarding)
user_state (id, user_id, screen_time_minutes, has_onboarded)

-- User priorities (set during onboarding)
priorities (id, user_id, content)

-- Tasks with AI nudge tracking
tasks (id, user_id, content, tier, status, created_at, completed_at, nudge, nudge_count, parent_id)
```

**Tier values**: `focus`, `backlog`, `icebox`
**Status values**: `pending`, `completed`

## How the AI Works

### Brain Dump Processing
When a user dumps their thoughts, the AI (Claude Haiku 4.5) extracts actionable tasks and sorts them into Focus/Backlog/Icebox tiers based on the user's priorities. Duplicate tasks are automatically filtered out.

### Progressive Nudge System
Each task supports up to 5 progressive nudges that build on each other:

1. **Nudge 1**: Address the earliest prerequisite or blocker
2. **Nudge 2**: Gather or prepare key materials
3. **Nudge 3**: Set up the environment or draft the deliverable
4. **Nudge 4**: Refine or review what's been prepared
5. **Nudge 5**: Position to execute the final action

The AI considers the user's other active tasks to infer intent and provide context-aware suggestions.

## Deploying Outside Replit

If deploying to another platform (Vercel, Railway, Fly.io, etc.):

1. **Replace Replit Auth** — The auth system in `server/replit_integrations/auth/` is Replit-specific. Swap it for your preferred auth provider.
2. **Set environment variables** — Ensure `DATABASE_URL`, `ANTHROPIC_API_KEY`, and `SESSION_SECRET` are set.
3. **Build and run**:
   ```bash
   npm run build
   npm start
   ```
4. The production server listens on `PORT` (defaults to 5000).

## License

MIT
