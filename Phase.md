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
- **Status:** Partially Implemented (Phase 6 Tasks 1, 2, 3, and 4 implemented).

### Phase 6 Implementation Details
**IMPLEMENTED:**
- Shared offline/sync contracts in `@swasthyasetu/types` (`NetworkStatus`, `SyncStatus`, `OfflineRecord`, `SyncOperation`, etc.).
- Web IndexedDB foundation (`apps/web/src/lib/offline/db.ts`).
- Browser network detection utility and React hook (`apps/web/src/lib/offline/network.ts`).
- Worker SQLite architecture interface documented (`apps/worker/src/lib/offline/sqlite-architecture.md`).
- **Task 1: Offline Architecture Foundation**
  - Implemented `Dexie` wrapper for `indexedDB`.
  - Added sync queue table (`sync_queue`) and offline records table (`offline_records`).
  - Created global network observer hook (`useNetworkStatus`).
- **Task 2: Offline Assessment Capture**
  - Updated Assessment flow to store locally when offline.
  - Preserved full UI flow without backend dependency.
  - Added queue entry creation.
- **Task 3: Basic Sync Engine**
  - Created deterministic sync service for sequential operation processing.
  - Implemented retry logic (max 3 retries, distinguishing fatal vs retryable errors).
  - Added sync trigger on network restore in `PatientLayout`.
- **Task 4: Evaluation & Conflict Resolution**
  - Verified conflict state in offline sync layer (intercepts `409 Conflict`).
  - Implemented `CONFLICT` status in `SyncStatus`.
  - Preserves original payload and conflict reason safely without automatic retries.
  - Added `[Retry]` and `[Discard]` resolution UI for conflicts in offline assessments list.
  - Maintained backend boundaries: No actual clinical logic or database conflict rules were modified.

**NOT IMPLEMENTED:**
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
- **Status:** Complete (Phase 7 Task 1, 2, and 3 implemented).

### Phase 7 Implementation Details
**IMPLEMENTED:**
- **Task 1: Interoperability & Security Foundation**
  - Configured strict CORS handling based on `ALLOWED_ORIGINS` environment variable.
  - Enforced request validation globally using NestJS `ValidationPipe` (whitelist: true, forbidNonWhitelisted: true).
  - Validated API request parameters globally using `ParseUUIDPipe` where applicable.
  - Implemented data minimization on the patients API, stripping out sensitive internal data.
  - Created a new Interoperability Module/Mapper for FHIR-inspired resources mapping (`Patient`, `CarePlan`, `ServiceRequest`).
  - Added safe internal SwasthyaSetu identifier mapping for Patients.
  - Explicitly avoided true ABDM/ABHA integration in favor of a prototype interoperability layer.
- **Task 2: HFR Facility Mapping**
  - Implemented GET `/interoperability/facilities/:id` using `ParseUUIDPipe`.
  - Mapped internal `facilities` schema to a FHIR-inspired `Organization` resource.
  - Enforced SwasthyaSetu internal namespace for facility IDs, explicitly noting it is not a production HFR ID.
  - Accurately preserved operational facility type (mapped to `prov`), address, latitude, and longitude fields using appropriate FHIR structures and extensions.
  - Explicitly kept ABHA ID linking out of scope to avoid schema pollution or fake government identifiers.
- **Task 3: HPR Practitioner Mapping**
  - Implemented GET `/interoperability/practitioners/:id` using `ParseUUIDPipe`.
  - Mapped internal user schema to a FHIR-inspired `Practitioner` resource.
  - Enforced SwasthyaSetu internal namespace for practitioner IDs, explicitly noting it is not a production HPR ID.
  - Accurately preserved practitioner professional roles and metadata using appropriate FHIR structures.
  - Explicitly kept national registry verification out of scope to avoid schema pollution or fake government identifiers.

**LIMITATIONS & CONSTRAINTS:**
- This is a FHIR-inspired interoperability prototype, not a production FHIR server or ABDM integration.
- The SwasthyaSetu patient identifier used here is an internal identifier and is not an ABHA identifier.
- No government health APIs, ABHA, or Aadhaar integration was implemented.
- No authentication or authorization (RBAC) was added in this phase.
- CORS is configured for development origins only.
- No backend clinical logic was modified.

### Phase 8: End-to-End Integration
Goal: Connect React frontend to Supabase via NestJS backend.

- [x] **Task 1:** API Client Foundation (Centralized client with robust error handling/timeouts) - ✅ COMPLETE
- [x] **Task 2:** Patient Dashboard Read-Only Integration (Fetch patient, bundles, referrals, journeys) - ✅ COMPLETE
- [ ] **Task 3:** Assessment to Care Bundle Flow (Submit assessment to API -> AI processing -> render bundle)
- [ ] **Task 4:** Care Readiness Selection (Map recommended facilities and select destination)
- [ ] **Task 5:** Dynamic Routing Integration (Handle referral creation and failover rerouting)
- [ ] **Task 6:** Facility Dashboard Workflow (Acknowledge inbound referrals, update status)
- [ ] **Task 7:** End-to-End Regression Testing (Ensure offline syncing still functions across the loop) 
- **What NOT to build:** New features outside the core journey.

### Task 1: API Client & Environment (COMPLETED)
- Created centralized `api.ts` with error handling.
- Configured safe `VITE_` environment variables.

- **Status:** PENDING

## Phase 9 — QA, Demo Hardening & SIH Submission
- **Objective:** Final testing, bug fixing, and preparation for deployment/presentation.
- **Scope:** Load testing, edge-case handling, demo script refinement.
- **Inputs:** Integrated application.
- **Outputs:** Production-ready (or demo-ready) stable release.
- **Dependencies:** Phase 8.
- **Acceptance Criteria:** System is stable, demo flows execute flawlessly, zero critical bugs.
- **What NOT to build:** Any new functionality.
- **Status:** Planned.
