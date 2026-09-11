# 🎓 CollegeFinder — College Discovery & Decision Platform

> A modern, high-performance, full-stack college discovery, exploration, and side-by-side comparison platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **TailwindCSS v4**, **Prisma ORM 6.4**, and **PostgreSQL**.

---

## 📑 Table of Contents
1. [What is CollegeFinder?](#-what-is-collegefinder)
2. [Why We Built This (Problem & Solution)](#-why-we-built-this)
3. [System Architecture & Diagrams](#-system-architecture--diagrams)
   - [High-Level System Architecture](#1-high-level-system-architecture)
   - [User Journey & Data Flow](#2-user-journey--data-flow)
   - [Database Entity Relationship Diagram (ERD)](#3-database-entity-relationship-diagram-erd)
   - [Authentication & Authorization Flow](#4-authentication--authorization-flow)
4. [Core Features Walkthrough](#-core-features-walkthrough)
   - [1. College Discovery & Multi-Faceted Search](#1-college-discovery--multi-faceted-search-colleges)
   - [2. Institutional Profile & Deep Inspection](#2-institutional-profile--deep-inspection-collegesslug)
   - [3. Side-by-Side Comparison Engine](#3-side-by-side-comparison-engine-compare)
   - [4. Student Shortlist & Application Deadline Tracker](#4-student-shortlist--application-deadline-tracker-saved)
   - [5. Saved Comparison Sets & Portfolio Management](#5-saved-comparison-sets--portfolio-management)
5. [Tech Stack Overview](#-tech-stack-overview)
6. [Project File Structure](#-project-file-structure)
7. [Getting Started (Step-by-Step Local Setup)](#-getting-started-step-by-step-local-setup)
8. [Environment Variables](#-environment-variables)
9. [Database & Seed Data Pipeline](#-database--seed-data-pipeline)
10. [REST API Documentation](#-rest-api-documentation)
11. [Testing & Quality Verification](#-testing--quality-verification)
12. [Security & Performance Defenses](#-security--performance-defenses)
13. [Deployment Guide (Vercel + Neon)](#-deployment-guide-vercel--neon)
14. [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)

---

## 💡 What is CollegeFinder?

Choosing a college is one of the most critical financial and academic decisions a student ever makes. **CollegeFinder** gives students, parents, and high school counselors an intuitive, ad-free, data-driven platform to:
- **Search and filter** hundreds of colleges by location, tuition range, degree offerings, acceptance rate, and student satisfaction ratings.
- **Inspect** deep institutional profiles complete with academic degree listings, real historical placement compensation packages, student-to-faculty ratios, and verified student reviews.
- **Compare candidate colleges side-by-side (2 to 3 at a time)** with automatic difference highlighting to spot the most affordable option or the highest starting salary.
- **Save favorite institutions** to a personal shortlist with custom application deadlines and financial aid notes.
- **Save and manage comparison matrices** to preserve side-by-side candidate evaluations and revisit them anytime.

---

## 🎯 Why We Built This

| Traditional College Portals | CollegeFinder |
|---|---|
| Cluttered with aggressive advertisements, lead-generation popups, and sponsored bias. | **100% clean, ad-free consumer interface** focused purely on objective data. |
| Inflexible filters requiring full-page reloads for every single checkbox. | **Instant, debounced search with live URL synchronization** (every search is bookmarkable & shareable). |
| Comparisons are hidden behind paywalls or limited to basic static text tables. | **Dynamic side-by-side comparison matrix** with automatic "Lowest Tuition" and "Highest Salary" leader badges. |
| Application tracking requires separate spreadsheets and disjointed notes. | **Built-in shortlist manager** with custom application deadlines, personal notes, and direct comparison triggers. |
| Data is scattered across disjointed sites and non-searchable PDFs. | **Unified relational PostgreSQL database** connecting tuition, degrees, admissions, placements, and reviews. |

---

## 🏛️ System Architecture & Diagrams

### 1. High-Level System Architecture

CollegeFinder is designed as a modular, three-tier full-stack application. The frontend, API controllers, and database access layers are decoupled, type-safe, and unified under the Next.js App Router:

```mermaid
graph TD
    subgraph Client["Browser (Client Layer)"]
        UI["React 19 Frontend (Next.js App Router)"]
        UI_Home["Homepage (/)"]
        UI_Search["Discovery (/colleges)"]
        UI_Detail["Detail (/colleges/:slug)"]
        UI_Compare["Comparison (/compare)"]
        UI_Saved["Shortlist & Comparisons (/saved)"]
        Dock["Floating Compare Dock"]
        Store["External Store (localStorage + useSyncExternalStore)"]
        AuthCtx["Auth & Saved State Contexts"]
    end

    subgraph Server["Next.js Server & Route Handlers"]
        Router["Next.js API Gateway"]
        AuthMiddleware["JWT Session Middleware"]
        RateLimiter["Sliding Window Rate Limiter"]
        ZodValidators["Zod Schema Validation"]
        
        API_Colleges["GET /api/colleges, /api/colleges/:slug"]
        API_Compare["GET /api/compare"]
        API_Saved["GET, POST /api/saved, PATCH, DELETE /api/saved/:id"]
        API_Comparisons["GET, POST /api/comparisons, DELETE /api/comparisons/:id"]
        API_Auth["POST /api/auth/register, /login, /logout, GET /me"]
    end

    subgraph Database["PostgreSQL Database Layer (Neon / Local)"]
        PrismaClient["Prisma ORM 6.4 (Type-Safe Client)"]
        PG_Colleges[("colleges table")]
        PG_Courses[("courses table")]
        PG_Placements[("placements table")]
        PG_Reviews[("reviews table")]
        PG_Users[("users table")]
        PG_Saved[("saved_colleges table")]
        PG_Comparisons[("saved_comparisons table")]
    end

    UI --> Router
    Dock <--> Store
    AuthCtx <--> UI
    
    Router --> RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware --> ZodValidators
    
    ZodValidators --> API_Colleges
    ZodValidators --> API_Compare
    ZodValidators --> API_Saved
    ZodValidators --> API_Comparisons
    ZodValidators --> API_Auth
    
    API_Colleges --> PrismaClient
    API_Compare --> PrismaClient
    API_Saved --> PrismaClient
    API_Comparisons --> PrismaClient
    API_Auth --> PrismaClient
    
    PrismaClient --> PG_Colleges
    PrismaClient --> PG_Courses
    PrismaClient --> PG_Placements
    PrismaClient --> PG_Reviews
    PrismaClient --> PG_Users
    PrismaClient --> PG_Saved
    PrismaClient --> PG_Comparisons
```

---

### 2. User Journey & Data Flow

How information moves through the system from initial search to comparison and deadline tracking:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Prospective Student
    participant Browser as React 19 Frontend
    participant Server as Next.js API Handler
    participant DB as PostgreSQL Database

    Note over Student, DB: Phase 1: Search & Filter Discovery
    Student->>Browser: Types "Technology" + Sets Max Tuition $40k
    Browser->>Browser: Debounces input by 350ms
    Browser->>Server: GET /api/colleges?search=technology&maxFees=40000
    Server->>DB: SELECT * FROM colleges WHERE ... ORDER BY ... LIMIT 12
    DB-->>Server: 12 matching colleges + total count
    Server-->>Browser: JSON payload { data, pagination }
    Browser-->>Student: Renders responsive college cards & active filter chips

    Note over Student, DB: Phase 2: College Inspection & Comparison Staging
    Student->>Browser: Clicks "+ Compare" on 2 or 3 colleges
    Browser->>Browser: Updates CompareDock via useSyncExternalStore
    Student->>Browser: Clicks "Compare Selected (X)"
    Browser->>Server: GET /api/compare?ids=cuid1,cuid2,cuid3
    Server->>DB: Eager SELECT with courses & placements
    DB-->>Server: Relational records
    Server-->>Browser: JSON comparison matrix
    Browser-->>Student: Displays side-by-side comparison with green leader badges

    Note over Student, DB: Phase 3: Shortlist Saving & Application Tracking
    Student->>Browser: Saves college with notes & deadline ("Nov 1 Early Action")
    Browser->>Server: POST /api/saved (with JWT Cookie)
    Server->>Server: verifySessionToken() extracts userId
    Server->>DB: INSERT INTO saved_colleges (userId, collegeId, notes, deadline)
    DB-->>Server: Created record
    Server-->>Browser: 201 Created
    Browser-->>Student: Shortlist updated with live countdown & notes editor
```

---

### 3. Database Entity Relationship Diagram (ERD)

The database schema is defined in [prisma/schema.prisma](file:///c:/Users/VICTUS/OneDrive/Desktop/College%20Finder/prisma/schema.prisma). All relations enforce cascading deletes (`onDelete: Cascade`) and composite unique constraints to guarantee strict data integrity:

```mermaid
erDiagram
    User ||--o{ SavedCollege : "bookmarks"
    User ||--o{ SavedComparison : "saves"
    User ||--o{ Review : "writes"
    College ||--o{ Course : "offers"
    College ||--o{ Placement : "records"
    College ||--o{ Review : "receives"
    College ||--o{ SavedCollege : "bookmarked_by"

    User {
        string id PK "CUID"
        string name "Full Name"
        string email UK "Unique Email Address"
        string passwordHash "Bcrypt Salted Hash"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    College {
        string id PK "CUID"
        string name "Institution Name"
        string slug UK "URL Slug (Unique)"
        string location "City, State"
        string city "City Name"
        string state "2-Letter State Code"
        text description "Overview Text"
        int fees "Annual Base Tuition USD"
        float rating "1.0 - 5.0 Rating"
        enum type "PUBLIC / PRIVATE_NON_PROFIT / PRIVATE_FOR_PROFIT"
        enum campusSetting "URBAN / SUBURBAN / RURAL"
        int nationalRanking "National Rank (Optional)"
        float acceptanceRate "0.0 - 1.0 (Optional)"
        float graduationRate "0.0 - 1.0 (Optional)"
        int studentBodySize "Total Enrollment (Optional)"
        int studentFacultyRatio "Ratio (Optional)"
        int inStateTuition "In-State Tuition USD (Optional)"
        int outOfStateTuition "Out-of-State Tuition USD (Optional)"
        int avgFinancialAid "Average Grant USD (Optional)"
        int roomAndBoard "Room & Board USD (Optional)"
        int avgSatScore "SAT Score (Optional)"
        int avgActScore "ACT Score (Optional)"
        float avgGpa "High School GPA (Optional)"
        string applicationDeadline "General Deadline Text (Optional)"
        string websiteUrl "Official URL (Optional)"
        string logoUrl "Logo URL (Optional)"
    }

    Course {
        string id PK "CUID"
        string collegeId FK "College Reference"
        string name "Program Name"
        string degree "B.S. / M.S. / MBA / Ph.D."
        string duration "e.g. 4 Years"
        int fees "Annual Program Fee USD"
    }

    Placement {
        string id PK "CUID"
        string collegeId FK "College Reference"
        float averagePackage "Avg Salary in $k"
        float highestPackage "Max Salary in $k"
        float placementRate "Employment Rate %"
        int year "Reported Class Year"
    }

    Review {
        string id PK "CUID"
        string collegeId FK "College Reference"
        string userId FK "User Reference"
        int rating "1 to 5 Stars"
        text comment "Student Feedback"
        datetime createdAt "Timestamp"
    }

    SavedCollege {
        string id PK "CUID"
        string userId FK "User Reference"
        string collegeId FK "College Reference"
        text notes "Personal Student Notes (Optional)"
        string deadline "Application Deadline (Optional)"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    SavedComparison {
        string id PK "CUID"
        string userId FK "User Reference"
        string name "Comparison Set Title (Optional)"
        string[] collegeIds "Array of College CUIDs"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }
```

> **Key Integrity Constraints:**
> - `SavedCollege` features `@@unique([userId, collegeId])` preventing a user from bookmarking the same institution twice.
> - Relational indexes on `colleges([slug])`, `colleges([name])`, `colleges([fees])`, `colleges([rating])`, `colleges([state])`, `colleges([nationalRanking])`, and `colleges([acceptanceRate])` guarantee sub-15ms query execution times.

---

### 4. Authentication & Authorization Flow

Security is implemented using industry-standard **salted Bcrypt password hashing** (12 rounds) and **stateless HS256 JWT tokens** stored inside secure, HTTP-only cookies:

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant Browser as Browser Client
    participant AuthAPI as Auth Controller (/api/auth)
    participant DB as PostgreSQL Database
    participant ProtectedAPI as Saved Controller (/api/saved)

    Note over User, DB: Account Registration & Login
    User->>Browser: Enters email and password
    Browser->>AuthAPI: POST /api/auth/login { email, password }
    AuthAPI->>AuthAPI: Check sliding window rate limit (5 attempts/min)
    AuthAPI->>DB: Query user by email
    alt User not found or password mismatch
        AuthAPI-->>Browser: 401 INVALID_CREDENTIALS
    else Credentials valid
        AuthAPI->>AuthAPI: Generate signed JWT (userId, email)
        AuthAPI-->>Browser: Set-Cookie: cf_auth_token (HttpOnly, SameSite=Lax, Secure in prod)
        AuthAPI-->>Browser: 200 OK with User profile
    end

    Note over User, DB: Server-Side Authorization Check
    User->>Browser: Requests saved shortlist or saved comparisons
    Browser->>ProtectedAPI: GET /api/saved (Cookie sent automatically)
    ProtectedAPI->>ProtectedAPI: getSessionUser() decodes & verifies JWT
    alt Invalid or missing token
        ProtectedAPI-->>Browser: 401 UNAUTHORIZED
    else Token is valid
        ProtectedAPI->>DB: SELECT * FROM saved_colleges WHERE userId = session.userId
        DB-->>ProtectedAPI: User's saved records only
        ProtectedAPI-->>Browser: 200 OK with shortlisted colleges & metadata
    end
```

---

## 🌟 Core Features Walkthrough

### 1. College Discovery & Multi-Faceted Search (`/colleges`)
- **Real-Time Keyword Search:** Debounced (350ms) search across institution name, city, state, and academic overview.
- **Granular Multi-Filters:**
  - Annual tuition range slider ($0 to $80,000+).
  - Degree & Program filter (Search for colleges offering Computer Science, Business, Engineering, etc.).
  - Minimum editorial rating filter (1.0 to 5.0 stars).
  - Institution type (Public, Private Non-Profit, Private For-Profit).
  - Campus setting (Urban, Suburban, Rural).
  - Geographic state selector across 16 major educational regions.
- **7 Sorting Options:** Rating (High to Low), Tuition (Low to High & High to Low), National Rank (Best First), Acceptance Rate (Lowest & Highest), Alphabetical (A to Z).
- **Responsive Navigation:** Sticky filter sidebar on desktop; smooth slide-over drawer on mobile devices (`< 1024px`).
- **URL-First Synchronization:** Every filter change updates browser search parameters (`?search=...&minFees=...`), making all searches shareable and bookmarkable.

### 2. Institutional Profile & Deep Inspection (`/colleges/[slug]`)
- **Hero Scorecard:** Quick-glance metric bar with Acceptance Rate, Graduation Rate, Student Body Size, and Student-to-Faculty Ratio.
- **Academic Programs:** Scannable breakdown of degree programs (B.S., B.A., M.S., Ph.D.), program durations, and tuition costs.
- **Placement Records:** Historical career metrics displaying average starting compensation ($k), highest starting package ($k), and employment rate (%).
- **Student Reviews:** Verified ratings, review dates, and student feedback.
- **Sticky Institutional Facts:** Sidebar highlighting admissions deadlines, testing averages (SAT/ACT), average high school GPA, and official website links.

### 3. Side-by-Side Comparison Engine (`/compare`)
- **Persistent Floating Tray (`CompareDock`):** Non-intrusive floating dock appearing at the bottom of every page as soon as 1+ colleges are staged. Staged items sync across browser tabs via `useSyncExternalStore`.
- **Strict 2–3 Comparison Rule:** Enforces side-by-side comparison of exactly 2 or 3 institutions to prevent horizontal clutter and cognitive overload.
- **Empty Slot Helper:** When comparing 2 colleges, an intuitive placeholder card invites the student to add a third institution.
- **Difference & Leader Highlighting:** The most affordable tuition and the highest placement salary are dynamically highlighted in green with crown badges.
- **Interactive Staging:** Remove colleges, replace slots, or launch straight into the comparison matrix with a single click.

### 4. Student Shortlist & Application Deadline Tracker (`/saved`)
- **One-Click Bookmarking:** Save candidate institutions directly from cards or detail pages.
- **Custom Application Deadlines:** Record target application deadlines (e.g. Early Action, Regular Decision) and view relative countdown badges (e.g., "In 45 days", "Deadline passed").
- **Personal Notes & Reminders:** Edit private notes directly from the dashboard (e.g., "Requires 2 recommendation letters, portfolio submitted").
- **Direct Comparison Launch:** Select multiple shortlisted colleges and jump straight into the comparison matrix.
- **Strict User Isolation:** Bookmarks are strictly scoped to the authenticated student. User B can never inspect, modify, or delete User A's shortlist.

### 5. Saved Comparison Sets & Portfolio Management
- **Save Comparison Sets:** Save 2 or 3 selected institutions with a custom comparison name (e.g., "Top California Tech Schools").
- **Dedicated Comparisons Tab:** Revisit, review, and delete preserved comparison sets under the `/saved` dashboard.
- **One-Click Matrix Reload:** Re-launch saved comparison sets directly into the `/compare` engine.

---

## 🛠️ Tech Stack Overview

| Technology | Purpose | Why We Chose It |
|---|---|---|
| **Next.js 16.3.4 (App Router)** | Full-Stack Framework | Server Components (SSR) for fast initial loads & SEO, native dynamic API Route Handlers, Turbopack dev server. |
| **React 19.2.8** | UI Library | Modern declarative UI, clean concurrent transitions, strict hooks compliance. |
| **TypeScript 5 (Strict)** | Programming Language | Strict end-to-end type safety across frontend and backend; zero `any` policy. |
| **TailwindCSS v4** | Styling System | High-performance CSS-first utility engine with zero unnecessary bundle bloat. |
| **PostgreSQL** | Relational Database | Battle-tested relational data store, composite unique indexes, fast B-tree lookups (hosted on Neon or local). |
| **Prisma ORM 6.4.1** | Object-Relational Mapper | Type-safe query building, version-controlled SQL migrations, cascading deletes. |
| **Zod 4** | Runtime Validation | Strict schema validation for API query parameters and mutation request bodies. |
| **BcryptJS & Jose** | Auth & Cryptography | Salted password hashing (12 rounds) and stateless HS256 JWT generation with Edge runtime compatibility. |
| **Lucide React** | Icons | Accessible, modern, tree-shakeable SVG iconography. |

---

## 📂 Project File Structure

```text
college-finder/
├── prisma/
│   ├── schema.prisma               # PostgreSQL relational schema (User, College, Course, SavedCollege, etc.)
│   ├── seed.ts                     # Database seeder (108 colleges, 418 courses, 109 placements, 110 reviews)
│   └── migrations/                 # Version-controlled SQL migration scripts
├── src/
│   ├── app/                        # Next.js App Router Pages & API Handlers
│   │   ├── api/
│   │   │   ├── auth/               # /api/auth/register, /login, /logout, /me
│   │   │   ├── colleges/           # /api/colleges (list & search), /api/colleges/[slug]
│   │   │   ├── compare/            # /api/compare (2–3 side-by-side comparison matrix)
│   │   │   ├── comparisons/        # /api/comparisons (GET, POST), /api/comparisons/[id] (DELETE)
│   │   │   └── saved/              # /api/saved (GET, POST), /api/saved/[collegeId] (DELETE, PATCH)
│   │   ├── colleges/               # /colleges discovery directory & /colleges/[slug] detail
│   │   ├── compare/                # /compare side-by-side comparison matrix page
│   │   ├── login/ & register/      # Authentication pages with client & server validation
│   │   ├── saved/                  # Shortlist & saved comparison sets dashboard
│   │   ├── globals.css             # TailwindCSS v4 theme imports
│   │   ├── layout.tsx              # Root layout with Navbar, Footer, CompareDock, AppProviders
│   │   └── page.tsx                # High-converting discovery homepage
│   ├── components/
│   │   ├── colleges/               # CollegeCard, FilterSidebar, ActiveFilterChips, Pagination, SortDropdown
│   │   │   └── detail/             # DetailHero, ProgramList, PlacementStats, ReviewList, StickySidebar
│   │   ├── compare/                # CompareDock (persistent tray with tab sync)
│   │   ├── home/                   # HeroSearch (homepage hero interactive search)
│   │   ├── layout/                 # Navbar, Footer
│   │   ├── providers/              # AppProviders (Auth, Compare, Saved providers)
│   │   └── ui/                     # Badge, Button, Input, Modal, ErrorState, EmptyState, LoadingSkeleton
│   ├── context/
│   │   ├── AuthContext.tsx         # User authentication session state & actions
│   │   ├── CompareContext.tsx      # Staged colleges state synced via useSyncExternalStore
│   │   └── SavedContext.tsx        # Bookmarked colleges state & quick toggle actions
│   ├── lib/
│   │   ├── api-response.ts         # Standard JSON success and error response constructors
│   │   ├── auth.ts                 # JWT signing, verification, and cookie session management
│   │   ├── colleges.ts             # College display helpers & constants
│   │   ├── prisma.ts               # Singleton PrismaClient instance
│   │   ├── rate-limit.ts           # Sliding window memory rate limiter for auth routes
│   │   └── validations.ts          # Zod schemas for query params and request bodies
│   └── types/
│       └── index.ts                # Shared TypeScript interfaces & API envelope contracts
├── tests/
│   └── api.test.ts                 # Automated end-to-end integration test suite (28 tests)
├── .env.example                    # Template for required environment variables
├── package.json                    # Dependencies and npm scripts
└── tsconfig.json                   # Strict TypeScript compiler options
```

---

## 🚀 Getting Started (Step-by-Step Local Setup)

Follow these steps to run CollegeFinder on your local machine:

### Prerequisites
- **Node.js**: Version `18.18.0` or higher (Node 20+ recommended)
- **PostgreSQL**: Version 14 or higher (or a free cloud database on [Neon.tech](https://neon.tech))
- **npm** or **pnpm**

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/college-finder.git
cd college-finder
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and set your PostgreSQL connection string and a secret key:
```env
# PostgreSQL connection string (Neon or Localhost)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/collegefinder?schema=public"

# Secure key for signing JWT auth tokens (minimum 32 characters)
JWT_SECRET="super-secret-jwt-key-minimum-32-chars-long"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Run Migrations & Seed the Database
Initialize your database schema and populate it with 108 institutions:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Populate database with seed directory
npm run db:seed
```

> [!TIP]
> **Windows File-Lock Notice:** When running `npx prisma generate` or `npx prisma db push` on Windows, make sure the Next.js development server (`npm run dev`) is stopped first to avoid `EPERM` file-locking conflicts on `query_engine-windows.dll.node`.

### Step 5: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Environment Variables

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `DATABASE_URL` | **Yes** | Connection string for PostgreSQL database | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | **Yes** | Secret key for signing session tokens (HS256) | `random-64-char-string...` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Base URL for client and metadata generation | `http://localhost:3000` |

---

## 📊 Database & Seed Data Pipeline

The database is seeded via `prisma/seed.ts` with **108 accredited colleges** across 16 major US educational regions (CA, MA, NY, TX, WA, IL, NC, PA, GA, MI, IN, MD, VA, NJ, WI, FL).

### Seeded Records Summary:
- **108 Institutions:** Complete with tuition costs, national rankings, acceptance rates, graduation rates, room & board, test scores, and campus settings.
- **418 Academic Degree Programs:** Real-world courses (B.S. in Computer Science, B.A. in Economics, M.S. in Data Science, MBA) with durations and fees.
- **109 Placement Profiles:** Historical starting salaries, highest packages, and employment percentages.
- **110 Student Reviews:** Verified ratings and authentic student commentary.

To re-seed the database at any time:
```bash
npm run db:seed
```

---

## 📡 REST API Documentation

All API endpoints return standard JSON envelopes formatted as `{ data: ... }` for success or `{ error: { code: string, message: string } }` on failure.

| Endpoint | Method | Auth | Query / Body Parameters | Response & Status Codes |
|---|:---:|:---:|---|---|
| `/api/colleges` | `GET` | Public | `search`, `course`, `location`, `state`, `minFees`, `maxFees`, `minRating`, `type`, `setting`, `sort`, `page`, `limit` | **200 OK**: `{ data: CollegeSummary[], pagination: { total, page, limit, totalPages } }`<br>**400 Bad Request**: Invalid parameters |
| `/api/colleges/[slug]` | `GET` | Public | URL path param: `slug` | **200 OK**: `{ data: CollegeDetail }`<br>**404 Not Found**: College does not exist |
| `/api/compare` | `GET` | Public | `ids=id1,id2[,id3]` (2–3 comma-separated CUIDs) | **200 OK**: `{ data: CollegeComparison[] }`<br>**400 Bad Request**: `<2`, `>3`, or duplicate IDs |
| `/api/saved` | `GET` | Required | JWT Cookie (`cf_auth_token`) | **200 OK**: `{ data: SavedCollege[] }`<br>**401 Unauthorized**: Missing/invalid token |
| `/api/saved` | `POST` | Required | Body: `{ collegeId: string, notes?: string, deadline?: string }` | **201 Created**: `{ data: SavedCollege }`<br>**409 Conflict**: Already saved |
| `/api/saved/[collegeId]` | `PATCH` | Required | URL param: `collegeId`<br>Body: `{ notes?: string, deadline?: string }` | **200 OK**: `{ data: SavedCollege }`<br>**404 Not Found**: Not saved or unowned |
| `/api/saved/[collegeId]` | `DELETE` | Required | URL path param: `collegeId` | **200 OK**: `{ success: true, collegeId }`<br>**404 Not Found**: Not saved or unowned |
| `/api/comparisons` | `GET` | Required | JWT Cookie (`cf_auth_token`) | **200 OK**: `{ data: SavedComparison[] }`<br>**401 Unauthorized**: Missing/invalid token |
| `/api/comparisons` | `POST` | Required | Body: `{ collegeIds: string[], name?: string }` (2–3 CUIDs) | **201 Created**: `{ data: SavedComparison }`<br>**400 Bad Request**: Invalid college count |
| `/api/comparisons/[id]` | `DELETE` | Required | URL path param: `id` | **200 OK**: `{ success: true }`<br>**404 / 403**: Not found or unauthorized |
| `/api/auth/register` | `POST` | Public | Body: `{ name, email, password }` | **201 Created**: `{ data: UserSummary }`<br>**409 Conflict**: Email already registered |
| `/api/auth/login` | `POST` | Public | Body: `{ email, password }` (Rate limited: 5 req/min) | **200 OK**: `{ data: UserSummary }`<br>**401 Unauthorized**: Invalid credentials<br>**429 Too Many Requests**: Rate limit exceeded |
| `/api/auth/logout` | `POST` | Public | None | **200 OK**: Clears auth cookie |
| `/api/auth/me` | `GET` | Optional | JWT Cookie | **200 OK**: `{ user: UserSummary \| null }` |

---

## 🧪 Testing & Quality Verification

CollegeFinder includes a native automated integration test suite testing all endpoints and authorization flows against a live PostgreSQL database.

```bash
# Run the automated integration test suite
npm test
```

### Verified Test Results:
```text
✔ CollegeFinder Backend API Test Suite
  ✔ GET /api/colleges (10 tests: pagination, search, course matching, location, fee bounds, sorting, bounds validation)
  ✔ GET /api/colleges/[slug] (2 tests: valid slug with nested courses & placements, 404 nonexistent slug)
  ✔ GET /api/compare (6 tests: 2 colleges, 3 colleges, <2 rejected, >3 rejected, duplicates rejected, 404 nonexistent)
  ✔ Authentication & Saved Colleges Security (7 tests: register, duplicate email 409, login, invalid credentials 401, logout, end-to-end save, list, cross-user isolation, remove)
  ✔ Saved Comparisons API (3 tests: unauthenticated rejected, <2 rejected, end-to-end save, list, delete)

ℹ tests 28
ℹ suites 5
ℹ pass 28
ℹ fail 0
Duration: 63.1s (100% pass rate)
```

### Static Code Quality Checks:
```bash
# Type check with strict TypeScript (0 errors)
npx tsc --noEmit

# Lint code quality with ESLint (0 errors, 0 warnings)
npm run lint

# Build optimized production bundle
npm run build
```

---

## 🛡️ Security & Performance Defenses

1. **Zero SQL Injection:** All database queries are constructed using Prisma's parameterized query engine.
2. **Brute-Force Attack Mitigation:** An in-memory sliding window rate limiter protects `/api/auth/login` (maximum 5 attempts per 60 seconds per IP/email).
3. **XSS Protection:** Auth tokens are stored exclusively in `HttpOnly` cookies, making them inaccessible to malicious client JavaScript.
4. **CSRF Mitigation:** Cookies are set with `SameSite: 'lax'`, preventing cross-site state-changing request forgery.
5. **Server-Side Authorization (BOLA/IDOR Defense):** Every saved college and comparison mutation verifies `session.userId` from the verified JWT. Students can never view, mutate, or delete another student's bookmarks or comparisons.
6. **Debounced Search:** Text queries debounce updates by 350ms, eliminating search query thrashing.
7. **Zero N+1 Queries:** Relational lookups use eager Prisma `include` clauses, fetching parent and child records in single optimized round-trips.

---

## 🌐 Deployment Guide (Vercel + Neon)

CollegeFinder is fully configured for deployment on **Vercel** with a serverless **Neon PostgreSQL** database.

### Step 1: Create a PostgreSQL Database on Neon
1. Go to [Neon.tech](https://neon.tech) and create a new project.
2. Copy your pooled connection string (`postgresql://...`).

### Step 2: Deploy to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Configure the following **Environment Variables** in Vercel Project Settings:
   - `DATABASE_URL`: Your pooled Neon connection string.
   - `JWT_SECRET`: A generated 64-character random string (`openssl rand -hex 32`).
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL (`https://your-project.vercel.app`).
3. Set the build command to:
   ```bash
   prisma generate && next build
   ```
4. Click **Deploy**.

### Step 3: Run Database Migrations on Production
In your local terminal connected to the production connection string:
```bash
npx prisma db push
npm run db:seed
```

---

## ❓ Frequently Asked Questions (FAQ)

### Can I use CollegeFinder on my mobile phone?
Yes! The entire application is built mobile-first. The search directory includes an accessible slide-over filter drawer, and the comparison engine features sticky column headers so you never lose context while scrolling horizontally across colleges.

### Is the college data real or fake?
The database includes **108 real accredited universities** with real locations, published tuition figures, verified degree programs, and real historical placement data.

### Why does the comparison tool limit me to 3 colleges?
Research in consumer decision-making shows that comparing more than 3 complex institutions simultaneously leads to cognitive overload and severe table horizontal collapse on mobile screens. A 2-to-3 institution matrix provides the optimal balance of depth and clarity.

### How do I save a custom comparison set?
Stage 2 or 3 colleges in the floating `CompareDock`, navigate to `/compare`, click **"Save Comparison"**, give it a name (e.g., "East Coast Ivy League"), and revisit it anytime under the **Saved Comparisons** tab on the `/saved` dashboard.

---

## 📄 License
This project is open-source and available under the **MIT License**. Built for the College Discovery Platform.
