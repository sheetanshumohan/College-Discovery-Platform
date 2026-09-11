# CollegeFinder Architecture & System Design Document

This document provides a deep architectural breakdown of **CollegeFinder**, a full-stack college discovery, exploration, and comparison platform.

---

## 1. System Overview & Architecture Diagram

CollegeFinder uses a modern full-stack architecture built on the **Next.js App Router**, leveraging React Server Components (RSC) where beneficial and client interactivity where dynamic state (search debounce, comparison docks, filter sheets) is essential.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Client (Browser)                                │
│                                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────────┐  │
│  │ Homepage (/)  │ │ Discovery     │ │ College Detail│ │ Compare Engine │  │
│  │ Hero / Stats  │ │ (/colleges)   │ │ (/colleges/   │ │ (/compare)     │  │
│  │ Quick Search  │ │ URL-synced    │ │   [slug])     │ │ 2-3 Matrix     │  │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └───────┬────────┘  │
│          │                 │                 │                 │            │
│          └────────┬────────┴────────┬────────┴────────┬────────┘            │
│                   │                 │                 │                     │
│          ┌────────▼─────────────────▼─────────────────▼────────┐           │
│          │ Global UI Components: Navbar, CompareDock, UI Modals │           │
│          └──────────────────────────┬───────────────────────────┘           │
│                                     │ Client State / useSyncExternalStore   │
│                                     ▼                                       │
│          ┌─────────────────────────────────────────────────────┐            │
│          │ CompareContext (LocalStorage 'cf_compare_items_v2') │            │
│          └──────────────────────────┬──────────────────────────┘            │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ HTTP / JSON API Fetch
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Next.js Route Handlers (Server Layer)                    │
│                                                                             │
│   GET /api/colleges         GET /api/colleges/[slug]   GET /api/compare     │
│   POST /api/auth/register   POST /api/auth/login       POST /api/auth/logout│
│   GET /api/auth/me          GET /api/saved             POST /api/saved      │
│                             DELETE /api/saved/[id]                          │
│                                     │                                       │
│   ┌─────────────────────────────────▼───────────────────────────────────┐   │
│   │ Middleware & Validation: Zod Runtime Schema Validation & JWT Auth   │   │
│   │ - verifySessionToken() via 'cf_auth_token' HTTP-Only Cookie         │   │
│   └─────────────────────────────────┬───────────────────────────────────┘   │
│                                     │ Type-Safe Query Construction          │
│                                     ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Prisma ORM Client (Singelton Instance with Prisma Client 6.4)       │   │
│   └─────────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ Connection Pooling / SQL
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database (v18)                           │
│                                                                             │
│   Tables:                                                                   │
│   - colleges       (indexes: slug, name, location, state, fees, rating,     │
│                     nationalRanking, acceptanceRate)                        │
│   - courses        (foreign key: collegeId -> colleges.id, CASCADE)         │
│   - placements     (foreign key: collegeId -> colleges.id, CASCADE)         │
│   - reviews        (foreign keys: collegeId, userId, CASCADE)               │
│   - users          (unique: email)                                          │
│   - saved_colleges (composite unique: [userId, collegeId], CASCADE)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Next.js App Router Structure
The application adopts Next.js 16's App Router architecture:
- **`src/app/page.tsx`**: High-impact landing page featuring hero search, quick category shortcuts, live directory statistics, and featured institutions.
- **`src/app/colleges/page.tsx`**: Discovery search directory. Wrapped with `<Suspense>` for search parameter hydration. Synchronizes query state directly with the browser address bar.
- **`src/app/colleges/[slug]/page.tsx`**: Dynamic college inspection profile. Server-rendered with metadata generation (`generateMetadata`) and dynamic fallbacks (`not-found.tsx`, `error.tsx`, `loading.tsx`).
- **`src/app/compare/page.tsx`**: Dedicated side-by-side comparison page. Reads `?ids=id1,id2,id3` from the URL, fetching comparison data directly from `/api/compare`.
- **`src/app/saved/page.tsx`**: User shortlist dashboard. Protected route checking authenticated state; displays bookmarked institutions and note annotations.
- **`src/app/login/page.tsx` & `src/app/signup/page.tsx`**: Authentication gateways with redirect handling (`?redirect=/...`).

### 2.2 React 19 Patterns & State Management
- **`useSyncExternalStore` for Global Compare State**:
  The floating `CompareDock` synchronizes selected colleges across all browser tabs via `src/context/CompareContext.tsx`. Using `useSyncExternalStore` avoids hydration mismatches between server-rendered markup and browser `localStorage`.
- **Render-Phase State Adjustments**:
  In accordance with React 19's strict rules forbidding synchronous `setState` inside `useEffect`, filter inputs in `FilterSidebar` update parent state through user interaction callbacks (`onChange`) and event listeners.
- **Micro-Debouncing**:
  Search inputs in `colleges/page.tsx` utilize a 350ms debounce before pushing query updates to the URL, preventing excessive re-renders and server requests while typing.

---

## 3. API & Validation Layer

### 3.1 REST API Design
All endpoints reside in `src/app/api/...` following strict REST conventions:
- Standard HTTP verbs (`GET`, `POST`, `DELETE`).
- Standard HTTP status codes:
  - `200 OK`: Successful retrieval or mutation.
  - `201 Created`: Successful resource creation (new account, saved college).
  - `400 Bad Request`: Validation failure (malformed JSON, invalid query parameter, negative numbers, inverted fee bounds).
  - `401 Unauthorized`: Missing or invalid session token.
  - `404 Not Found`: Non-existent slug, missing college ID, or attempt to mutate unowned records.
  - `409 Conflict`: Unique constraint violation (duplicate email, duplicate college bookmark).
  - `500 Internal Server Error`: Uncaught exceptions, masked to prevent sensitive stack trace leaks.

### 3.2 Zod Validation Schemas
Located in `src/lib/validations.ts`:
- **`collegeQuerySchema`**: Validates `page` (positive int, default 1), `limit` (1-50, default 12), `search`, `location`, `state`, `minFees`, `maxFees`, `minRating` (0-5), `type`, `setting`, and `sort`. Enforces `minFees <= maxFees`.
- **`compareQuerySchema`**: Enforces a comma-separated list containing 2 to 3 valid CUIDs. Checks for duplicate IDs and enforces strict bounds.
- **`registerSchema`**: Validates `name` (min 2 chars), `email` (valid RFC 5322 format), and `password` (minimum 8 characters with lowercase, uppercase, and digit).
- **`loginSchema`**: Validates email format and non-empty password.
- **`saveCollegeSchema`**: Validates `collegeId` CUID and optional `notes` string (max 1000 chars).

---

## 4. Prisma ORM & PostgreSQL Design

### 4.1 Prisma Client Singleton
To prevent connection exhaustion in serverless or development environments with hot-module replacement, `src/lib/prisma.ts` exports a cached global client instance:
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4.2 Relational Integrity & Cascades
All child relations (`Course`, `Placement`, `Review`, `SavedCollege`) declare `onDelete: Cascade`. If an institution is updated or removed, all dependent relations are cleanly purged without orphaned records.

### 4.3 Composite Unique Constraints
The `SavedCollege` model features:
```prisma
@@unique([userId, collegeId])
```
This guarantees that concurrent duplicate save requests cannot insert duplicate records at the database level.

### 4.4 PostgreSQL Query Optimization & Indexing
Full table scans are eliminated by indexing high-cardinality fields:
- `colleges`: `[slug]`, `[name]`, `[location]`, `[state]`, `[fees]`, `[rating]`, `[nationalRanking]`, `[acceptanceRate]`.
- `courses`: `[collegeId]`.
- `placements`: `[collegeId]`.
- `reviews`: `[collegeId]`, `[userId]`.
- `saved_colleges`: `[collegeId]`, `[userId, collegeId]`.

---

## 5. Authentication & Authorization Flow

```
┌──────────┐                     ┌──────────────────┐               ┌────────────┐
│  Client  │                     │ Next.js Auth API │               │ PostgreSQL │
└────┬─────┘                     └────────┬─────────┘               └─────┬──────┘
     │                                    │                               │
     │ 1. POST /api/auth/register         │                               │
     │    { name, email, password }       │                               │
     ├───────────────────────────────────>│                               │
     │                                    │ 2. Check if email exists      │
     │                                    ├──────────────────────────────>│
     │                                    │<──────────────────────────────┤
     │                                    │ 3. bcrypt.hash(password, 12)  │
     │                                    │ 4. INSERT INTO users          │
     │                                    ├──────────────────────────────>│
     │                                    │<──────────────────────────────┤
     │ 5. Set HTTP-Only Cookie            │                               │
     │    ('cf_auth_token', MaxAge=7d)    │                               │
     │<───────────────────────────────────┤                               │
     │                                    │                               │
     │ 6. GET /api/saved (with Cookie)    │                               │
     ├───────────────────────────────────>│                               │
     │                                    │ 7. verifySessionToken()       │
     │                                    │    Extracts userId from JWT   │
     │                                    │ 8. SELECT FROM saved_colleges │
     │                                    │    WHERE userId = session.id  │
     │                                    ├──────────────────────────────>│
     │                                    │<──────────────────────────────┤
     │ 9. Return JSON [Saved Colleges]    │                               │
     │<───────────────────────────────────┤                               │
```

### 5.1 Defense in Depth
1. **Password Hashing:** `bcryptjs` with 12 salt rounds protects against rainbow tables and brute force attacks.
2. **HTTP-Only Cookies:** Auth tokens cannot be accessed via JavaScript (`document.cookie`), preventing XSS token exfiltration.
3. **Strict CSRF Mitigation:** Cookies use `SameSite: 'lax'`, preventing cross-site state-changing request forgery.
4. **Server-Side Authorization:** The `userId` is never trusted from client payloads or request URLs. It is extracted exclusively from the cryptographically verified JWT session.

---

## 6. Search & Filtering Engine

The search and filtering engine (`GET /api/colleges`) constructs dynamic Prisma queries:
- **Keyword Search (`search`)**: Translates into an `OR` clause matching `name`, `description`, `city`, and `state` case-insensitively using `mode: 'insensitive'`.
- **Tuition Range (`minFees`, `maxFees`)**: Constructs `fees: { gte: minFees, lte: maxFees }`.
- **Location & State**: Exact and prefix matching against `state` and `location`.
- **Editorial Rating**: Lower bound filtering (`rating: { gte: minRating }`).
- **Institutional Attributes**: Direct enum matching on `type` (`PUBLIC`, `PRIVATE_NON_PROFIT`, `PRIVATE_FOR_PROFIT`) and `campusSetting` (`URBAN`, `SUBURBAN`, `RURAL`).
- **Sorting**: Mapped to verified column ordering (`fees: 'asc'`, `rating: 'desc'`, `nationalRanking: 'asc'`, etc.).
- **Pagination**: Executed with `take` and `skip`, paired with a concurrent `prisma.college.count()` query inside a single round-trip.

---

## 7. Comparison Engine

### 7.1 Architecture & Workflow
1. User clicks "+ Compare" on any card or detail page.
2. The item `{ id, name }` is appended to `cf_compare_items_v2` in `localStorage`.
3. The `CompareDock` updates instantly across all open windows.
4. User clicks "Compare Now", routing to `/compare?ids=id1,id2,id3`.
5. The `/api/compare` endpoint validates that `ids` contains between 2 and 3 unique valid CUIDs.
6. The endpoint executes `prisma.college.findMany` with `where: { id: { in: idList } }`, eager-loading `courses` and `placements`.
7. The returned data preserves the exact order specified in the query parameters.
8. The UI computes and highlights the best values (lowest fees, highest placement packages) in green with crown badges.

---

## 8. Saved Colleges Engine

The saved colleges subsystem maintains a personalized shortlist for logged-in students:
- **`GET /api/saved`**: Reads the user's session and retrieves all saved institutions with full `college` details.
- **`POST /api/saved`**: Checks for an existing record or catches Prisma `P2002` unique constraint violations to return a clean `409 ALREADY_SAVED`.
- **`DELETE /api/saved/[collegeId]`**: Validates ownership before deletion. Attempting to delete another user's saved college returns `404 NOT_FOUND`.

---

## 9. Deployment Architecture (Vercel + Neon)

```
[ Developer / Git Repository ]
             │
             │ Push to main
             ▼
[ Vercel CI / CD Pipeline ]
             │
             ├─ 1. npx prisma generate
             ├─ 2. next build (Turbopack optimization & type checking)
             │
             ▼
[ Vercel Edge & Serverless Functions ]
             │
             │ Connection Pooled TCP (pgbouncer)
             ▼
[ Neon Serverless PostgreSQL ]
             │
             ├─ Auto-scaling storage
             ├─ Automated point-in-time recovery
             └─ Schema migrations via Prisma Migrate
```

---

## 10. Summary of Architectural Guarantees

| Requirement | Implementation Guarantee |
|---|---|
| **Data Integrity** | PostgreSQL foreign keys with cascading deletes and composite unique constraints |
| **Type Safety** | End-to-end TypeScript strict mode, zero `any`, Zod runtime validation |
| **Performance** | Multi-column database indexes, eager relational fetching, zero N+1 queries |
| **Security** | Bcrypt password hashing, signed HTTP-only JWTs, server-side authorization |
| **UX & Usability** | URL-synchronized filters, persistent cross-tab comparison tray, responsive mobile drawers |
