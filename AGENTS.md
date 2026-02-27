# Rules

1. NEVER downgrade GitHub Actions versions. Versions are intentionally pinned.
2. NEVER add test jobs to deploy.yml. CI is the single gate; deploy triggers via `workflow_run`.
3. NEVER use separate `git commit` and `git push` calls. ALWAYS combine: `git commit ... && git push`.
4. NEVER try to fix a major bug directly. MUST write a reproducing test first, then fix.
5. MUST use `git-committing` skill after each logical block of work.
6. MUST use bun and bun APIs. NEVER use npm/npx/yarn/pnpm/node.
7. MUST follow existing codebase patterns. TypeScript with strict mode, path aliases (`@lib/`, `@app/`, `@tests/`).
8. Skip `bun run check && bun run lint` after changes unless asked for.

## Overview

Write is a precision text counting and visualization tool built as an Astro static site with a React client-only island.

## Core Stack

- Bun
- Astro + React (`client:only="react"`)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- TypeScript (strict)

## Commands

| Command | Use |
|---------|-----|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run test:unit` | Unit tests (Vitest) |
| `bun run test:browser` | Browser tests (Playwright) |
| `bun run check` | TypeScript typecheck |
| `bun run lint` | ESLint |

## Gotchas

- **Tailwind v4**: Uses `@tailwindcss/vite` plugin directly, NOT `@astrojs/tailwind` (which only supports v3).
- **React island**: App mounts via `client:only="react"` — no SSR for the React tree.
- **Deploy workflow**: `deploy.yml` must only deploy; test jobs belong in CI workflows.
