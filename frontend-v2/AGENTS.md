# AGENTS.md

Guidance for AI Assistants working with this frontend codebase.

## Project Overview

Frontend UI for **Forecast-in-a-Box** (FIAB), a portable ML-based weather forecasting system for ECMWF.

**Core workflows:**

1. **Configure** - AI weather forecasts (model, parameters, region, outputs)
2. **Monitor** - Real-time execution (progress, task graphs, logs)
3. **Visualize** - Download results (images, plots, maps, data)

## Technology Stack

| Category  | Technology                                    |
| --------- | --------------------------------------------- |
| Framework | React 19 + TypeScript (strict)                |
| Build     | Vite 7                                        |
| State     | Zustand (client) + TanStack Query v5 (server) |
| Routing   | TanStack Router (file-based)                  |
| Styling   | Tailwind CSS v4 (CSS-based config)            |
| UI        | shadcn/ui (Base-UI only, no Radix)            |
| Forms     | Zod 4                                         |
| i18n      | i18next                                       |
| HTTP      | Native fetch (no axios)                       |
| Testing   | Vitest Browser Mode + Playwright              |
| Mocking   | MSW v2                                        |
| Linting   | ESLint (TanStack config) + Prettier           |

## Commands

```bash
# Development
npm run dev              # Dev server (real backend)
npm run dev:mock         # Dev server (mocked API)

# Build & Test
npm run build            # Production build
npm run validate         # Fix + test + build (full check)
npm run test             # Vitest watch mode
npm run test:run         # Vitest single run (CI)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # With coverage report
npm run test:e2e         # Playwright E2E - ALL tests against MSW mocks (no backend needed)
npm run test:e2e:stack   # Playwright E2E - stack tests against real backend (port 8000)
npm run analyze          # Bundle visualization (dist/stats.html)

# Code Quality
npm run check            # Lint + format check (CI)
npm run fix              # Auto-fix lint + format
```

**Always use npm scripts** (not `npx` directly) for consistent tool versions.

## Project Structure

```
src/
├── api/                 # HTTP client, endpoints, TanStack Query hooks, types
├── components/
│   ├── base/            # Custom base components
│   ├── common/          # Shared components (LoadingSpinner, ErrorBoundary, etc.)
│   ├── layout/          # AppShell, Header, Sidebar, Footer
│   └── ui/              # shadcn/ui components (auto-generated)
├── features/            # Feature modules
│   ├── admin/           # Admin panel
│   ├── auth/            # Authentication
│   ├── dashboard/       # Dashboard
│   ├── fable-builder/   # Forecast configuration builder
│   ├── landing/         # Landing page
│   ├── plugins/         # Plugin management
│   ├── sources/         # Data source management
│   └── status/          # System status
├── hooks/               # Shared custom hooks
├── lib/                 # Utilities (logger, toast, queryClient, utils)
├── locales/             # i18n translations (en/)
├── providers/           # React context providers
├── routes/              # TanStack Router (file-based)
├── stores/              # Zustand stores (configStore, uiStore)
├── types/               # Global TypeScript types
└── utils/               # Helper functions

mocks/                   # MSW handlers and fixtures
tests/                   # Unit, integration, E2E tests
```

## Architecture Patterns

### Path Aliases

| Alias      | Maps To     | Usage          |
| ---------- | ----------- | -------------- |
| `@/*`      | `./src/*`   | Source imports |
| `@tests/*` | `./tests/*` | Test utilities |

```typescript
// ✅ Good
import { Button } from '@/components/ui/button'
import { worker } from '@tests/test-extend'

// ❌ Bad - deep relative imports
import { Button } from '../../../components/ui/button'
```

### State Management

- **Server state** → TanStack Query (caching, background refresh)
- **Client state** → Zustand stores in `src/stores/`

### API Layer

Native fetch with typed client - **do NOT use axios**:

```typescript
// src/api/hooks/useModels.ts
export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => modelsApi.getAll(),
  })
}
```

### Routing

File-based routing in `src/routes/`:

- `__root.tsx` - Root layout
- `index.tsx` - Landing page (`/`)
- `_authenticated.tsx` - Protected layout
- `_authenticated/dashboard.tsx` - `/dashboard`
- `_authenticated/configure.tsx` - `/configure`

### i18n

Namespace-based translations in `locales/en/`:

```typescript
const { t } = useTranslation('configuration')
return <h1>{t('selectModel.title')}</h1>
```

## Coding Standards

### TypeScript

- Strict mode enabled
- **Never use `any`** - use `unknown` with type guards
- Use `type` for aliases, `interface` for extendable shapes

### Components

- Functional components only
- Named exports
- Props interface: `{ComponentName}Props`
- **File naming**: kebab-case for shadcn/ui, PascalCase for custom

```typescript
interface ModelSelectorProps {
  onSelect: (modelId: string) => void
  disabled?: boolean
}

export function ModelSelector({
  onSelect,
  disabled = false,
}: ModelSelectorProps) {
  // ...
}
```

### Styling (Tailwind CSS v4)

- Config in `src/styles.css` (CSS custom properties, not JS config)
- Use `cn()` from `@/lib/utils` for conditional classes
- Semantic tokens: `primary`, `secondary`, `muted`, `destructive`
- **Minimum font size: 14px (`text-sm`)** - avoid `text-xs`
- See [docs/UI_DESIGN.md](./docs/UI_DESIGN.md) for design guidelines

### Zod 4

```typescript
// ✅ Good: Zod 4 patterns
z.url() // Not z.string().url()
z.string().min(5, { error: 'msg' }) // Not { message: 'msg' }
z.treeifyError(error) // Not error.format()
```

### Error Handling

1. Use `createLogger()` from `@/lib/logger` (not `console.*`)
2. Use `showToast` from `@/lib/toast` for user notifications
3. Let TanStack Query handle API errors globally (don't wrap in try-catch)

```typescript
import { createLogger } from '@/lib/logger'
const log = createLogger('MyComponent')
log.error('Failed:', { id, error }) // Always logged
log.debug('Debug info') // Dev only
```

### Client-Side Storage

All keys in `src/lib/storage-keys.ts` with `fiab.` prefix:

```typescript
import { STORAGE_KEYS, STORE_VERSIONS } from '@/lib/storage-keys'
```

Zustand stores with persistence use `version` + `migrate` pattern.

### API Endpoints

All paths in `src/api/endpoints.ts`:

```typescript
import { API_ENDPOINTS } from '@/api/endpoints'
apiClient.get(API_ENDPOINTS.models.metadata(modelId))
```

## Responsive Design

Desktop-first, but **must work on mobile/tablet**:

```tsx
// ✅ Good: Responsive patterns
<div className="flex flex-col gap-4 sm:flex-row">
<div className="min-w-0 flex-1">  {/* Allows truncation */}
<SelectTrigger className="min-w-[200px]">  {/* Not w-[200px] */}
```

**Test all pages at 375px width** - horizontal scroll is a bug.

## Accessibility

- Must pass AXE checks
- Must meet WCAG AA (focus, contrast, ARIA)

## Security

- BFF auth pattern (HTTPOnly cookies, no client-side tokens)
- `isValidInternalRedirect()` for redirect validation
- No `dangerouslySetInnerHTML`
- External links: `rel="noopener noreferrer"`

## Testing

**Vitest Browser Mode** (real Chromium, not JSDOM) + MSW v2 for mocking. **Playwright** for E2E.

See [docs/TESTING.md](./docs/TESTING.md) for patterns and [docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md) for strategy.

**Test distribution:** 40 unit + 16 integration + 6 E2E = 62 test files

| Layer       | Location                    | Tool             | Count |
| ----------- | --------------------------- | ---------------- | ----- |
| Unit        | `tests/unit/`               | Vitest           | 40    |
| Integration | `tests/integration/`        | Vitest + MSW     | 16    |
| E2E (mock)  | `tests/e2e/*.spec.ts`       | Playwright + MSW | 1     |
| E2E (stack) | `tests/e2e/*.stack.spec.ts` | Playwright       | 5     |

**Two Playwright configs:**

- `playwright.config.ts` — MSW-mocked, runs ALL E2E tests, parallel, 30s timeout
- `playwright.config.stack.ts` — real backend, runs only `*.stack.spec.ts`, sequential, 1 worker, 60s timeout

All E2E tests run in both modes. MSW mocks cover all API endpoints, so `test:e2e` validates the full suite without a backend. `test:e2e:stack` confirms the same flows work against a real API.

## Common Tasks

### Add API endpoint

1. Add path to `src/api/endpoints.ts`
2. Add types in `src/api/types/`
3. Add TanStack Query hook in `src/api/hooks/`
4. Add MSW handler in `mocks/handlers/`

### Add route

1. Create file in `src/routes/` - route tree auto-generates

### Add translation

1. Add keys to `locales/en/{namespace}.json`
2. Use `t('namespace:key')`

### Add Zustand store

1. Create in `src/stores/{name}Store.ts`
2. For persistence: add to `STORAGE_KEYS` and `STORE_VERSIONS`

## Key Reminders

- **No axios** - use native fetch
- **No `tailwind.config.js`** - config is in `src/styles.css`
- **No hardcoded strings** - use i18next
- **No `console.*`** - use `createLogger()`
- **Backend is FastAPI** (Python) via REST + SSE
