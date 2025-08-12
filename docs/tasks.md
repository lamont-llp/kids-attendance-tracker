# Kids Attendance Tracker — Improvement Tasks Checklist

Note: Each item is actionable and ordered from foundational setup to architecture, code quality, testing, performance, security, and documentation. Check off [ ] when complete.

1. [x] Repository hygiene and developer setup
   - [x] Add a .env.local.example with required variables (DATABASE_URL, KINDE credentials) and short comments for each.
   - [x] Update README “Getting Started” with explicit steps using pnpm, Node LTS>=18, and common troubleshooting (e.g., Drizzle MySQL permissions).
   - [x] Ensure tsconfig and path aliases are documented; add examples of absolute '@/…' imports.

2. [x] Linting, formatting, and type safety baseline
   - [x] Add Prettier config and script (format:write) and document usage.
   - [x] Ensure ESLint is configured for Next 15/React 19 and TypeScript rules (strict mode) and wire "pnpm lint" to CI.
   - [x] Enable TypeScript strict options where safe (strict, noImplicitAny, noUncheckedIndexedAccess) and address any surfaced issues incrementally.

3. [x] Testing infrastructure hardening
   - [x] Validate Jest project separation works: jsdom (jest.config.js) vs node (jest.api.config.js), and add a CONTRIBUTING snippet on running per-project tests.
   - [x] Add a GitHub Action CI workflow to run pnpm install, pnpm lint, and pnpm test across both Jest projects.
   - [x] Provide test utilities to mock '@/utils' (db) and '@/utils/schema' consistently; add a factory for example Kid and Attendance records.

4. [ ] API input validation with zod and consistent error responses
   - [ ] Introduce zod schemas for request bodies/query params for app/api/kid and attendance endpoints (POST/PUT/DELETE/GET).
   - [ ] Return consistent JSON error shapes: { error: string, details?: any } with precise 4xx/5xx statuses.
   - [ ] Add unit tests for handlers validating both success and validation failure paths (mock db and next/server as needed).

5. [ ] Service/handler layering and typing
   - [ ] Keep route handlers thin; extract DB logic to lib/services (framework-agnostic) with explicit function types.
   - [ ] Fully type axios wrappers in app/services/GlobalApi.ts (request/response generics; remove any and lax types).
   - [ ] Normalize date formats across client and server (prefer ISO 8601; document format in GlobalApi and DB layer).

6. [ ] Database schema clarity and naming consistency (Drizzle ORM)
   - [ ] Align naming: pick a convention for snake_case vs camelCase within table columns and TypeScript interfaces (e.g., created_at vs createdAt) and ensure UI selectors match.
   - [ ] Fix interface mismatches: AttendanceRecord.kid.created_at/updated_at are typed as string while Kids interface uses Date; unify types and adapters at the boundary.
   - [ ] Consider adding an explicit age_group relation on Kids (age_group_id) instead of storing only free-form age string; ensure UI uses group lookup.
   - [ ] Add foreign key constraints and onDelete behaviors explicitly where appropriate.
   - [ ] Document and run pnpm db:push after schema changes; include a reversible migration plan in README.

7. [ ] Attendance feature robustness
   - [ ] Replace moment usage with date-fns (already installed) to reduce bundle size and standardize date handling; update all format/parse calls.
   - [ ] Ensure consistent month format across app (prefer yyyy-MM) and sanitize inputs before querying; update GlobalApi.GetAttendanceList signature and server route.
   - [ ] Guard against non-Sunday dates: centralize Sunday calculation utility and unit test edge cases (month start on Sunday, DST boundaries).
   - [ ] Make AttendanceGrid handlers stable via useCallback and memoize heavy computations; avoid re-creating columnDefs needlessly.
   - [ ] Handle network errors and optimistic UI updates when marking attendance (rollback on failure, toasts for both success/failure).

8. [ ] AG Grid and UI consistency
   - [ ] Extract common grid defaultColDef and themes to a shared config to keep tables consistent.
   - [ ] Add quickFilter debouncing and retain pagination state across re-renders.
   - [ ] Ensure grid is accessible: proper aria labels on search input, keyboard navigation guidance, and sufficient color contrast for warningCellStyle.

9. [ ] Kids CRUD improvements
   - [ ] Validate contact number and address with zod in the client before submission; surface field-level errors.
   - [ ] In AddNewKid, remove duplicated local state where react-hook-form can control values; ensure isVisitor default is false and typed.
   - [ ] In Edit flow, prefill values and validate on submit; add tests for UpdateKid request shaping.
   - [ ] In API, return consistent record shapes (guardian_name field present and documented), and ensure 404/400/409 scenarios are covered.

10. [ ] Auth and authorization
    - [ ] Add server-side checks in API route handlers to enforce authenticated access, not only middleware gating (defense in depth).
    - [ ] Normalize permission checks (admin vs check-in) in a small helper module, unit tested in isolation.

11. [ ] Error monitoring and logging hygiene
    - [ ] Replace console.log in production paths with a lightweight logger; silence noisy logs in tests.
    - [ ] Add structured error context (operation, params) to aid debugging; scrub PII in logs.

12. [ ] Performance and bundle size
    - [ ] Tree-shake lucide-react icon imports and ensure only used icons are bundled.
    - [ ] Audit moment removal and dead code elimination after migration to date-fns.
    - [ ] Memoize expensive selectors and move data massaging out of render paths in dashboard components.

13. [ ] Accessibility (a11y)
    - [ ] Ensure all interactive controls have labels and appropriate roles; verify with @testing-library/jest-dom and axe (optional) in tests.
    - [ ] Provide focus states and keyboard navigation for dialogs and grids; verify dialog traps are correct.

14. [ ] Security and input hardening
    - [ ] Validate and sanitize all string inputs on server; limit lengths (e.g., name 50, contact 11) consistently with schema.
    - [ ] Consider rate limiting sensitive endpoints and CSRF considerations for non-GET operations if exposed cross-origin.

15. [ ] DX: scripts and ergonomics
    - [ ] Add scripts: test:web, test:api, test:watch:web, test:watch:api, typecheck, format.
    - [ ] Add a script to open Drizzle Studio with env checks and friendly error if DATABASE_URL is missing.

16. [ ] Documentation coverage
    - [ ] Expand README with database ERD overview (ageGroup, guardians, kids, attendance) and common query patterns.
    - [ ] Add a docs/ARCHITECTURE.md explaining App Router layout, service layers, and testing strategy.

17. [ ] Monitoring and observability (optional/future)
    - [ ] Introduce lightweight runtime metrics/logs for API latency and DB query timing behind a feature flag.

18. [ ] Release readiness
    - [ ] Add production build verification checklist (pnpm build && pnpm start), environment smoke tests, and database connectivity probe.
