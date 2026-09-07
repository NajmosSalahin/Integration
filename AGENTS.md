# Agents — Integration Project Rules

## Version Documentation

- After completing a version (all features for that release done), ALWAYS update:
  1. `CHANGELOG.md` — add summary entry at top
  2. `versions/vX.Y.Z.md` — fill in all sections from `versions/TEMPLATE.md`
- Use `versions/TEMPLATE.md` as the structure for new version files
- Never ship a version without updating both files
- When adding new API endpoints, data models, or dependencies — note them in the version file immediately

## Build Order

- Follow the build order in `versions/v0.1.0.md`
- Resist urge to polish before step 5 (order flow) works end-to-end
- A functioning ugly order flow beats a beautiful broken one

## Code Style

- No comments unless explicitly asked
- Tailwind CSS for all styling
- Zustand for client state (cart)
- TanStack Query for server state (products, orders, auth)
- Zod for backend input validation
- Framer Motion for animations

## Git Commits

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- One logical change per commit
- Never commit secrets or API keys

## Environment

- Separate `.env.development` and `.env.production` — never share values
- Brevo API key only on server-side — never expose to frontend
- JWT secrets must be different between dev and prod

## Scope Control

- If you find yourself building any "out of scope" item before the core loop works end-to-end, STOP and refocus
- See `versions/v0.1.0.md` for explicit exclusions

## Legal Pages

- Generate template content for review — do not use placeholder text
- About page requires actual brand storytelling — not filler
