# Tech Stack

- **Framework**: Next.js 16 (App Router, SPA mode)
- **Language**: TypeScript (strict mode)
- **UI**: React 19
- **Styling**: Tailwind CSS 4 via `@tailwindcss/postcss`, CSS Modules for component-scoped styles
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`
- **Linting**: ESLint 9 with `eslint-config-next` (core-web-vitals + typescript)
- **Build**: Next.js built-in bundler
- **Package manager**: npm

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Start production | `npm run start` |
| Lint | `npm run lint` |

## Conventions

- All interactive components must be Client Components (`'use client'` directive)
- Path alias `@/*` maps to the project root
- CSS custom properties defined in `app/globals.css` for theme colors (`--background`, `--foreground`)
- Tailwind theme extended inline via `@theme inline` in globals.css
- Dark mode via `prefers-color-scheme: dark` media query
