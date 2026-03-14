# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── spat/               # SPAT React+Vite frontend (main app at /)
│   └── mockup-sandbox/     # UI component sandbox
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
├── package.json            # Root package with hoisted devDeps
└── README.md               # Project documentation with QA table
```

## Main Application: SPAT (Sistem Pelacakan Alumni Terintegrasi)

A professional web app for University Alumni Office to track alumni across public sources.

### Features
- Dashboard with stats (total alumni, tracked, pending, success rate) + global scheduler
- Alumni management with CRUD operations, tag inputs for name variations & affiliation keywords
- Tracking engine with Confidence Score calculation: Name (40%) + Affiliation (30%) + Major (20%) + Timeline (10%)
- Tracking results with source icons, confidence progress bars, verify/reject actions
- Cross-validation detail view showing evidence from multiple sources
- Chart visualizations using Recharts

### Database Tables
- `m_alumni` — Master alumni data
- `t_search_candidates` — Tracking candidates with confidence scores
- `t_extracted_signals` — Extracted signals (job title, company, location, education, publication)

### Pages
- `/` — Dashboard overview
- `/alumni` — Alumni management table
- `/tracking` — Tracking results with filter/verify/reject
- `/alumni/:id/detail` — Cross-validation detail view

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Packages

### `artifacts/spat` (`@workspace/spat`)
React + Vite frontend for SPAT app at `/`. Key packages: recharts, react-hook-form, zod, framer-motion, lucide-react.

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. Routes: health, alumni, scheduler.

### `lib/db` (`@workspace/db`)
Database layer using Drizzle ORM. Schema: m_alumni, t_search_candidates, t_extracted_signals.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec with routes for alumni CRUD, candidates, scheduler, and dashboard stats.

### `lib/api-zod` (`@workspace/api-zod`)
Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)
Generated React Query hooks from OpenAPI spec.
