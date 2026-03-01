# Contributing to BrainDump

Thanks for your interest in contributing! This guide will help you get set up and understand the codebase conventions.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL and create a database
4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
5. Fill in your `DATABASE_URL` and `ANTHROPIC_API_KEY`
6. Push the database schema: `npm run db:push`
7. Start the dev server: `npm run dev`

## Code Conventions

### Styling

- **Never use Tailwind color classes** for theme-sensitive colors. Always use inline styles with CSS variables:
  ```tsx
  // Correct
  style={{ color: 'var(--paper-fg)' }}

  // Wrong
  className="text-black dark:text-white"
  ```
- Structural layout (flex, padding, margins, etc.) uses Tailwind utility classes as normal.
- All theme colors are defined as `--paper-*` CSS variables in `client/src/index.css`.

### Typography

- Headings: `font-heading` class (Cormorant Garamond)
- Body text: `font-body` class (EB Garamond)
- Labels/metadata: `font-mono` class (IBM Plex Mono)

### Components

- Use shadcn/ui components from `@/components/ui/` where possible.
- Add `data-testid` attributes to all interactive elements and elements displaying meaningful data.
- Keep components minimal. Collapse similar components into a single file when practical.

### State Management

- Use TanStack React Query for all server state.
- Queries use the default `queryFn` — don't define custom fetch functions in queries.
- Mutations use `apiRequest` from `@/lib/queryClient` and must invalidate relevant query keys after success.

### API Routes

- All routes go in `server/routes.ts`.
- Validate request bodies with Zod schemas from `@shared/schema.ts`.
- Keep route handlers thin — delegate to `storage.ts` for database operations.
- All data must be scoped by `userId` from the authenticated session.

### Database

- Schema lives in `shared/schema.ts` using Drizzle ORM.
- Run `npm run db:push` to sync schema changes to the database.
- Never manually write SQL migrations.

### Internationalization

- All user-facing text must use the `t()` function from `useI18n()`.
- Add translations for both English and Chinese in `client/src/lib/i18n.ts`.

## Pull Request Guidelines

1. Create a feature branch from `main`.
2. Keep PRs focused on a single change.
3. Test on mobile (iOS Safari) — this is a mobile-first app.
4. Ensure dark mode works correctly for any UI changes.
5. Add translations for any new user-facing text.
6. Run `npm run check` to verify TypeScript types.
