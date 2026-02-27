# Write

A precision instrument for measuring your text.

[![CI](https://github.com/avishj/Write/actions/workflows/ci.yml/badge.svg)](https://github.com/avishj/Write/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## About

Write is a text counting and visualization tool that provides real-time analysis of characters, words, sentences, and paragraphs. Features include multiple tabs, local history persistence, version history, diff visualization for character/word limits, dark/light theme, and sharing via compressed URL parameters.

## Tech Stack

- **Astro** — Static site generation
- **React** — Interactive UI island
- **Tailwind CSS v4** — Utility-first styling
- **TypeScript** — Strict type safety
- **Bun** — Runtime, package manager, and task runner

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Testing

```bash
bun run test:unit        # Vitest unit tests
bun run test:browser     # Playwright browser tests
bun run coverage         # Unit tests with V8 coverage
bun run lint             # ESLint
bun run check            # TypeScript typecheck
```

## License

[AGPL-3.0](LICENSE)
