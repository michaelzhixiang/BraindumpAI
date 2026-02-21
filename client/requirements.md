## Packages
framer-motion | Page transitions and detailed micro-interactions
canvas-confetti | Reward animations for task completion
@types/canvas-confetti | Types for confetti
clsx | Conditional class names
tailwind-merge | Class merging utility

## Notes
- Dark mode is enforced globally
- Mobile-first layout: max-width 480px, centered
- API endpoints derived from schema:
  - GET/PATCH /api/user-state
  - GET/POST /api/priorities (bulk)
  - GET/POST/PATCH/DELETE /api/tasks
  - POST /api/ai/process-dump
  - POST /api/ai/nudge/:id
