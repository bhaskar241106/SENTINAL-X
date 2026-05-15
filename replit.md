# DriveLegal BIMSTEC AI

A hackathon-ready AI-powered traffic law assistant covering all 7 BIMSTEC nations (Bangladesh, Bhutan, India, Myanmar, Nepal, Sri Lanka, Thailand).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/drivelegal run dev` — run the React frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY` — Gemini AI via Replit integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (at `/api`)
- Frontend: React + Vite + Tailwind v4 + shadcn/ui (at `/`)
- DB: PostgreSQL + Drizzle ORM
- AI: Gemini 2.5 Flash via `@google/genai` (SSE streaming)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Routing: wouter

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas for API validation
- `lib/db/src/schema/` — Drizzle ORM schema (conversations, messages tables)
- `artifacts/api-server/src/data/bimstec.ts` — all static law/country/violation/emergency data
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/drivelegal/src/pages/` — React page components
- `artifacts/drivelegal/src/components/Layout.tsx` — sidebar + nav
- `artifacts/drivelegal/src/App.tsx` — routing + CountryContext

## Architecture decisions

- All traffic law data is static (in-memory) — no DB needed for read-only law data; only conversations and messages use Postgres
- Gemini AI uses SSE streaming via raw `fetch` on the frontend (not via generated hook) for real-time token streaming
- Country context is global via React Context, persists across all pages, synced to sidebar country selector
- Myanmar drives RIGHT (all other BIMSTEC countries drive LEFT) — highlighted with warnings throughout the app
- `@google/genai` is externalized in esbuild and must be a direct `dependency` of `api-server` (not just a transitive dep via the gemini lib)

## Product

- **Dashboard** — stats, country grid, feature cards
- **AI Legal Assistant** — Gemini-powered multi-turn chat with country + mode context (general/tourist/violation/emergency), SSE streaming
- **Fine Calculator** — select country + violation + vehicle class → full fine breakdown with base/surcharge/court fee + USD equivalent + payment methods
- **Law Explorer** — full-text search across all BIMSTEC laws + side-by-side country comparison by category
- **Country Detail** — per-country flag, driving side, emergency numbers, filterable law table
- **SOS & Emergency** — large SOS button, clickable emergency phone numbers, FIR checklist, insurance tips

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after editing DB schema files
- `@google/genai` must be in `api-server` `dependencies` (externalized in build, needs to be present at runtime)
- DB table names are `conversations` and `messages` (not `conversationsTable`/`messagesTable`)
- Gemini streaming: map `"assistant"` → `"model"` for the Gemini API role field

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
