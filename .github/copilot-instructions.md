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

Count is a precision text counting and visualization tool. Astro static site with a React SPA island, Tailwind CSS v4, deployed to GitHub Pages. Supports multiple tabs, local history persistence, version history, diff visualization, dark/light theme, and sharing via compressed URL params.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Astro (static output) + React (client island)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Language**: TypeScript (strict)
- **Testing**: Vitest (unit/integration/component) + Playwright (smoke/e2e)
- **CI**: GitHub Actions with reusable workflows + AutoLighthouse
- **Deploy**: GitHub Pages

## Commands

| Command | Use |
|---------|-----|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run check` | TypeScript typecheck |
| `bun run lint` | ESLint + Stylelint + markdownlint |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run test:unit` | Unit tests |
| `bun run test:integration` | Integration tests |
| `bun run test:component` | Component tests |
| `bun run test:smoke` | Playwright smoke tests |
| `bun run test:e2e` | Playwright E2E tests |
| `bun run coverage` | Unit tests with V8 coverage |

## Project Structure

- `src/app/` — React application (stores, components, hooks)
- `src/lib/` — Pure library code (analysis engine, persistence, sharing)
- `src/pages/` — Astro pages (single index.astro)
- `src/components/` — Astro layout components
- `src/styles/` — Global CSS and design tokens
- `tests/` — All test files (unit, integration, component, smoke, e2e)
- `.github/` — CI/CD workflows and composite actions

## Gotchas

- **Tailwind v4**: Uses `@tailwindcss/vite` plugin directly, NOT `@astrojs/tailwind` (which only supports v3).
- **React island**: App mounts via `client:only="react"` — no SSR for the React tree.
- **CI skips tests** for non-code changes (docs, markdown, config files).
- **Coverage thresholds**: 90/90/90/80 per-file (statements/branches/functions/lines).
