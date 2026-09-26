# SwasthyaSetu Tech Stack & Architecture (Updated 2026)

## System Architecture Overview

SwasthyaSetu is an ASHA-first rural healthcare referral, care-readiness, and care-continuity engine. Built for low-connectivity environments and budget smartphones, it bridges field workers, primary health centers (PHCs), community health centers (CHCs), district hospitals (DHs), and district health administration.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                              │
│                                                                        │
│   [ Patient & ASHA PWA ]        [ Facility Panel ]    [ Admin Panel ]  │
│   React 19 + Tailwind v4        React + Vite          React + Vite     │
│   Web Speech API (0MB STT)      Capacity Toggles      Bottlenecks KPI  │
│   Tesseract.js WASM (OCR)       Referrals Workflow    Catchment Maps   │
│   PWABuilder Android APK        Leaflet.js + OSM                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST / Beckn
┌───────────────────────────────────▼────────────────────────────────────┐
│                           BACKEND & CORE SERVICES                      │
│                                                                        │
│   NestJS Enterprise Backend (TypeScript Node.js)                       │
│   ├── AuthModule: JWT + Phone OTP (ASHA & Patient Identity)           │
│   ├── CareReadinessEngine: Sub-10ms Batched Capacity Matching         │
│   ├── DynamicRoutingEngine: Closed-Loop Referral & Reroute Engine      │
│   ├── VoiceModule: Bhashini API (22 Indian Languages) + STT            │
│   ├── OcrModule: Tesseract Medical Slip & Prescription Ingestion       │
│   ├── NotificationsModule: Indian DLT SMS Gateway (Fast2SMS / MSG91)  │
│   ├── BottlenecksModule: District Care Bottleneck Intelligence         │
│   └── InteroperabilityModule: FHIR Mapping + Beckn Protocol (ABDM UHI)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL / Drizzle ORM
┌───────────────────────────────────▼────────────────────────────────────┐
│                             DATA & CLOUD BaaS                          │
│                                                                        │
│   PostgreSQL / Supabase (Free Tier)                                    │
│   ├── Drizzle ORM Type-Safe Schemas                                    │
│   ├── Event-Sourced Audit Logs (referral_events, journey_events)       │
│   └── pgvector for semantic medical guideline search                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Specifications by Component

### 1. Frontend & Mobile (Lightweight PWA + PWABuilder)
- **Framework**: React 19 + Vite + Tailwind CSS v4.
- **Mobile Distribution**: Lightweight PWA (< 150 MB RAM on budget Android devices) packaged into an Android APK via **PWABuilder (Trusted Web Activity - TWA)**.
- **Offline Storage**: Native IndexedDB (`offline_records`, `sync_queue`) with deterministic sequential sync engine.
- **Geospatial Maps**: **Leaflet.js + OpenStreetMap** (free, no Google Maps API quotas or billing) for visual facility readiness and reroute tracking.

### 2. Edge AI & Assistive Intelligence
- **Voice STT**: Browser Native STT (**Web Speech API**, 0 MB server overhead) + **Bhashini API** (Govt. of India, 22 official regional languages) for rural patients and ASHA workers speaking in vernacular languages.
- **Prescription & Lab OCR**: **Tesseract.js WASM** (runs 100% on-device in WebAssembly without internet) to digitize doctor slips and lab recommendations.
- **Clinical Extraction Brain**: **Google Gemini (gemini-2.5-flash)** with deterministic fallback for structured Care Bundle JSON extraction (non-diagnostic, human-in-the-loop).

### 3. Backend & Application Services
- **Framework**: **NestJS (Node.js)** with modular layered architecture (Controllers → Services → Drizzle ORM).
- **Care Readiness Algorithm**: Optimized batch SQL evaluation ranking facilities by availability of required specialists, diagnostics, and appointments in a single roundtrip (O(1) database queries, zero N+1 loops).
- **Dynamic Routing**: Deterministic finite-state machine transitioning referrals (`PENDING` → `ACCEPTED` → `BLOCKED` → `REROUTED` → `COMPLETED`).
- **Care Bottleneck Intelligence**: Aggregates equipment breakdowns, specialist vacancies, and blocked referrals at the district level for Chief Medical Officers.

### 4. Communications & Interoperability
- **SMS Gateway**: DLT-registered SMS notification pipeline (**Fast2SMS / MSG91**) sending Hindi/Hinglish alerts to patients on basic feature phones when referrals are created or rerouted.
- **National Health Infrastructure**:
  - **FHIR R4**: Mappings for `Patient`, `CarePlan`, `ServiceRequest`, `Organization`, and `Practitioner`.
  - **Beckn Protocol (ABDM UHI / ONDC-aligned)**: Open discovery, order initialization, and referral confirmation across public and private hospitals.

### 5. Security & Privacy
- **Authentication**: JWT-based token contract with Phone OTP verification for rural patients and role-based access for facility staff (`PATIENT`, `FACILITY_STAFF`, `ASHA_WORKER`, `DISTRICT_ADMIN`).
- **Data Protection**: Strict input validation (`ValidationPipe`), UUID verification (`ParseUUIDPipe`), CORS domain whitelist, and absence of external PII leakages.
