# SwasthyaSetu Requirements

## 1. Functional Requirements
- **FR-FUNC-001 (MVP):** The system shall manage the lifecycle of a patient referral from creation to completion.
- **FR-FUNC-002 (Phase 2):** The system shall support multiple distinct user roles: Patient/ASHA, Facility Admin, District Admin.

## 2. Patient Requirements
- **FR-PAT-001 (MVP):** Patients/ASHA workers shall be able to log in and create a profile.
- **FR-PAT-002 (MVP):** Patients/ASHA workers shall be able to view their active Care Journey.

## 3. Assessment Requirements
- **FR-ASSESS-001 (MVP):** The system shall capture initial patient symptoms and demographic data.

## 4. Care Requirement Extraction Requirements
- **FR-EXTRACT-001 (Phase 5):** The system shall extract structured care requirements from natural language symptom descriptions. (Currently DEMO SIMULATION).

## 5. Care Bundle Requirements
- **FR-BUNDLE-001 (MVP):** The system shall group care requirements into a defined "Care Bundle".
- **FR-BUNDLE-002 (Phase 3):** A Care Bundle must specify required specialists, diagnostics, and procedures.

## 6. Care Readiness Requirements
- **FR-READINESS-001 (MVP):** The system shall evaluate a facility's real-time state against a Care Bundle to determine if it is "CARE READY" or "NOT CARE-READY".
- **FR-READINESS-002 (Phase 3):** The Care Readiness Engine shall output a match score or binary readiness status.

## 7. Facility Requirements
- **FR-FAC-001 (MVP):** Facilities shall have a dashboard to view incoming referrals.
- **FR-FAC-002 (MVP):** Facilities shall be able to toggle the availability of specialists and diagnostic equipment.
- **FR-FAC-003 (Phase 3):** Facilities shall be able to explicitly accept, refuse, or mark a referral as "Cannot Fulfil".

## 8. Referral Requirements
- **FR-REF-001 (MVP):** The system shall generate a referral to the nearest CARE READY facility.

## 9. Dynamic Routing Requirements
- **FR-ROUTE-001 (Phase 4):** If a facility marks a referral as "Cannot Fulfil", the system shall change the status to "BLOCKED".
- **FR-ROUTE-002 (Phase 4):** The system shall automatically find an alternative CARE READY facility and change the status to "REROUTED — ALTERNATIVE FOUND".

## 10. Care Journey Requirements
- **FR-JOURNEY-001 (MVP):** The system shall track the patient's state across Find → Assess → Refer → Reach → Treat → Follow-up.
- **FR-JOURNEY-002 (MVP):** The journey shall end with a "CARE COMPLETED" status.

## 11. Follow-up Requirements
- **FR-FOLLOWUP-001 (Phase 2):** The system shall flag missed appointments or incomplete care loops for follow-up.

## 12. Capacity Requirements
- **FR-CAP-001 (MVP):** Facilities must report operational capacity (e.g., bed availability, appointment slots).

## 13. Admin/Bottleneck Requirements
- **FR-ADMIN-001 (MVP):** District admins shall have a dashboard viewing aggregated facility data.
- **FR-ADMIN-002 (Phase 4):** The system shall surface "District Care Bottleneck Intelligence" (e.g., repeated reroutes due to a specific broken machine).

## 14. AI Requirements
- **FR-AI-001 (Phase 5):** AI shall be used strictly for converting natural language to structured Care Requirements, translation, and summarization.
- **FR-AI-002 (MVP):** All AI outputs in the current build must be clearly labelled as "DEMO SIMULATION: SIMULATED AI OUTPUT".

## 15. Low Connectivity Requirements
- **FR-OFFLINE-001 (Phase 6):** The ASHA worker application shall support offline data entry and sync when connectivity is restored. (Currently a visual demo mode).

## 16. Interoperability Requirements
- **FR-INTEROP-001 (Phase 7):** The system shall integrate with ABDM (ABHA, HFR, HPR).

## 17. Security Requirements
- **FR-SEC-001 (Phase 2):** All API endpoints must be authenticated and authorized based on user roles.

## 18. Accessibility Requirements
- **FR-A11Y-001 (Phase 2):** Frontend applications shall meet WCAG 2.1 AA standards where applicable.

## 19. Performance Requirements
- **FR-PERF-001 (Phase 2):** The Care Readiness Engine shall evaluate facility matches in under 2 seconds.

## 20. Data Requirements
- **FR-DATA-001 (MVP):** The system shall use PostgreSQL for relational data storage and Drizzle ORM for access.

## 21. API requirements
- **FR-API-001 (Phase 2):** The backend shall expose RESTful (or GraphQL) APIs for all client operations.

## 22. Validation/error handling
- **FR-ERR-001 (Phase 2):** The system shall gracefully handle API failures and display user-friendly error messages.

## 23. Demo/mock-data requirements
- **FR-MOCK-001 (MVP):** The system shall use distinct, clearly segregated mock data files for frontend prototyping until the backend is fully verified.
