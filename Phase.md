# SwasthyaSetu Development Phases

## Phase 0 — Product Definition & Documentation
- **Objective:** Establish the source-of-truth documentation and strict project rules.
- **Scope:** PRD, Requirements, Roadmap (Phases), and Rules.
- **Inputs:** Initial product vision and existing repository state.
- **Outputs:** `PRD.md`, `Requirements.md`, `Phase.md`, `Rules.md`.
- **Dependencies:** None.
- **Acceptance Criteria:** Documents are created, consistent in terminology, and accurately reflect the distinction between implemented and planned features.
- **What NOT to build:** No application code changes.
- **Status:** Implemented.

## Phase 1 — Frontend Experience
- **Objective:** Build the core UI prototypes for Patient, Facility, and Admin workflows using mock data.
- **Scope:** Patient login/assessment, Facility capacity management, Admin bottleneck dashboards.
- **Inputs:** Figma designs/UI concepts, Care Bundle logic.
- **Outputs:** React/Vite components, mock data files (`mockData.ts`), simulated AI/routing logic.
- **Dependencies:** Phase 0.
- **Acceptance Criteria:** All core screens are navigable, and the demo story (capacity toggling, bottleneck visualization) works with local state.
- **What NOT to build:** Real backend APIs, actual database connections, real AI integrations.
- **Status:** Implemented (Demo level).

## Phase 2 — Backend & Database Foundation
- **Objective:** Establish the NestJS backend and PostgreSQL database schema.
- **Scope:** Drizzle ORM setup, core entity models (User, Facility, Referral, CareBundle), basic CRUD APIs.
- **Inputs:** Frontend data models.
- **Outputs:** NestJS modules, database migrations, seed scripts.
- **Dependencies:** Phase 1.
- **Acceptance Criteria:** Database runs locally, migrations execute successfully, APIs can serve static or basic dynamic data to the frontend.
- **What NOT to build:** Complex routing logic, AI processing.
- **Status:** Planned / Under Verification (Code exists but runtime/migration verification pending).

## Phase 3 — Care Readiness Engine
- **Objective:** Implement the backend logic to evaluate facility capacity against a Care Bundle.
- **Scope:** Matching algorithm considering specialist, diagnostic, and appointment availability.
- **Inputs:** Care Bundle payload, Facility real-time state.
- **Outputs:** Readiness score / CARE READY status.
- **Dependencies:** Phase 2.
- **Acceptance Criteria:** Engine accurately flags facilities as NOT CARE-READY when required resources are toggled off.
- **What NOT to build:** The actual rerouting workflow (handled in Phase 4).
- **Status:** Partially Implemented (Phase 3 Task 1-4 — Care Readiness API Hardening implemented).

## Phase 4 — Referral & Dynamic Routing Engine
- **Objective:** Build the closed-loop referral and rerouting mechanism.
- **Scope:** "Cannot Fulfil" triggers, automated alternative discovery (BLOCKED -> REROUTED). Admin bottleneck aggregation.
- **Inputs:** Care Readiness Engine outputs.
- **Outputs:** Updated Referral states, Admin dashboard metrics.
- **Dependencies:** Phase 3.
- **Acceptance Criteria:** A "Cannot Fulfil" action at a facility automatically routes the patient to the next CARE READY facility.
- **What NOT to build:** External SMS/WhatsApp notifications (future scope).
- **Status:** Complete (Phase 4 Task 1, 2, 3, 4 implemented).

## Phase 5 — AI Integration
- **Objective:** Replace frontend simulated AI with actual LLM calls for care requirement extraction.
- **Scope:** Prompt engineering, API integration, structured output parsing.
- **Inputs:** Patient natural language input.
- **Outputs:** Structured Care Bundle JSON.
- **Dependencies:** Phase 2.
- **Acceptance Criteria:** System accurately identifies required specialists and tests from free-text descriptions. Must include human-in-the-loop review.
- **What NOT to build:** A conversational AI chatbot.
- **Status:** Complete (Phase 5 Tasks 1, 2, 3, and 4 — AI Integration Foundation, Real LLM Provider, AI -> Care Bundle, and AI Evaluation/Guardrails implemented).

## Phase 6 — Offline/Low Connectivity
- **Objective:** Implement true offline-first capabilities for field workers.
- **Dependencies:** Phase 2, 4.
- **Acceptance Criteria:** A field worker can create an assessment completely disconnected, and it reliably syncs once reconnected.
- **What NOT to build:** Complex conflict resolution right away. Last-write-wins is acceptable for MVP.
- **Status:** Partially Implemented (Phase 6 Tasks 1, 2, and 3 implemented).

### Phase 6 Implementation Details
**IMPLEMENTED:**
- Shared offline/sync contracts in `@swasthyasetu/types` (`NetworkStatus`, `SyncStatus`, `OfflineRecord`, `SyncOperation`, etc.).
- Web IndexedDB foundation (`apps/web/src/lib/offline/db.ts`).
- Browser network detection utility and React hook (`apps/web/src/lib/offline/network.ts`).
- Worker SQLite architecture interface documented (`apps/worker/src/lib/offline/sqlite-architecture.md`).
- offline assessment capture
- IndexedDB persistence
- pending sync operation creation
- local restoration
- sync queue processing
- Assessment CREATE synchronization
- controlled online/manual sync trigger
- sequential deterministic processing
- retry handling
- sync status lifecycle
- failure recording

**NOT IMPLEMENTED:**
- conflict resolution
- advanced conflict detection
- server-side idempotency
- background sync API/service worker
- SMS fallback
- full mobile SQLite sync
- advanced retry/backoff system

## Phase 7 — Interoperability & Security
- **Objective:** Integrate with national healthcare infrastructure (ABDM).
- **Scope:** ABHA ID generation/linking, HFR facility mapping.
- **Inputs:** ABDM API specs.
- **Outputs:** ABDM compliant records.
- **Dependencies:** Phase 2.
- **Acceptance Criteria:** Patients can link their ABHA ID to their SwasthyaSetu profile.
- **What NOT to build:** Full EMR functionality.
- **Status:** Planned.

## Phase 8 — End-to-End Integration
- **Objective:** Connect the frontend to the real backend APIs, replacing all mock data.
- **Scope:** API client integration, state management updates.
- **Inputs:** Phase 1 frontend, Phase 2-4 backend.
- **Outputs:** Fully functional integrated application.
- **Dependencies:** All previous phases.
- **Acceptance Criteria:** The entire Find → Assess → Refer → Reach → Treat → Follow-up journey works end-to-end against the real database.
- **What NOT to build:** New features outside the core journey.
- **Status:** Planned.

## Phase 9 — QA, Demo Hardening & SIH Submission
- **Objective:** Final testing, bug fixing, and preparation for deployment/presentation.
- **Scope:** Load testing, edge-case handling, demo script refinement.
- **Inputs:** Integrated application.
- **Outputs:** Production-ready (or demo-ready) stable release.
- **Dependencies:** Phase 8.
- **Acceptance Criteria:** System is stable, demo flows execute flawlessly, zero critical bugs.
- **What NOT to build:** Any new functionality.
- **Status:** Planned.
