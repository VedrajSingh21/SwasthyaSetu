# SwasthyaSetu Project Rules

## 1. Product Identity
- The product IS: "A care orchestration layer that determines whether required care is ready, routes patients dynamically when conditions change, and tracks the journey until care is completed."
- The product is NOT: A generic hospital directory, an AI chatbot, a generic appointment booking system, a generic HMS, or a generic analytics dashboard.

## 2. Core USP Protection
- All features must align with the core USP: Care Readiness + Dynamic Routing + Care Completion.
- Do not build features that merely list hospitals without considering their real-time readiness for the patient's specific Care Bundle.

## 3. Terminology
Strictly adhere to the following terminology across UI, code, and documentation:
- Care Bundle
- Care Requirement
- Care Readiness
- CARE READY
- NOT CARE-READY
- Cannot Fulfil
- BLOCKED
- REROUTED — ALTERNATIVE FOUND
- CARE COMPLETED
- DEMO SIMULATION
- SIMULATED AI OUTPUT
- Patient Burden
- Care Journey
- District Care Bottleneck Intelligence

## 4. Architecture Boundaries
- Maintain strict separation between Patient, Facility, and Admin client interfaces.
- The backend (NestJS) acts as the single source of truth for state management and Care Readiness logic.

## 5. Frontend Rules
- Do not hardcode production API keys in the frontend.
- Visual demo features (like low connectivity toggles or AI outputs) must be clearly labeled as simulations.

## 6. Backend Rules
- All state changes (especially referrals) must follow explicit, predefined states to ensure traceability.

## 7. Database Rules
- Ensure Drizzle schemas accurately reflect the Care Bundle and routing concepts.
- Do not treat the database as verified until migrations and seeds have been successfully run in a local or CI environment.

## 8. API Rules
- APIs must return strongly typed responses.
- Implement robust error handling for "Cannot Fulfil" and rerouting scenarios.

## 9. AI Rules
- Do not make fake AI claims.
- Current AI is a local deterministic rule set; it must be labeled "DEMO SIMULATION: SIMULATED AI OUTPUT".
- Future AI implementation is strictly for Care Requirement extraction and translation, not clinical diagnosis or open-ended chatting.

## 10. Mock-data Rules
- Mock data must reside in distinct files (e.g., `mockData.ts`) and should not be mingled with actual API client code.

## 11. Demo-simulation Rules
- Clearly demarcate demo simulations from production code.

## 12. Low-connectivity Claims
- Do not claim full production-grade offline capability or SMS fallback until it is fully implemented and tested (currently in Phase 6). The current frontend only has a visual demo.

## 13. Accessibility
- Adhere to basic accessibility standards (alt text, contrast, semantic HTML) to ensure usability.

## 14. Security/privacy
- Do not commit secrets, passwords, or PII to the repository.

## 15. Naming Conventions
- Use descriptive naming that aligns with the terminology in Rule 3 (e.g., `CareReadinessEngine`, `updateCareBundle`).

## 16. Type Safety
- Maintain strict TypeScript typings across the monorepo (frontend and backend).

## 17. Dependency Rules
- Do not add unnecessary external dependencies. Prefer built-in solutions or established libraries within the existing tech stack.

## 18. Git Rules
- Commit messages should clearly state the intent and component being modified.

## 19. Testing/verification Rules
- Do not claim a feature is complete merely because the code is written. It must be verified at runtime.

## 20. Scope-control Rules
- Do not invent features that are not part of the current product direction outlined in the PRD.

## 21. No Unnecessary Refactoring
- Do not refactor existing working code unless explicitly assigned or necessary to unblock a core feature.

## 22. No Fake AI Claims
- Never present deterministic rules or basic logic as "AI".

## 23. No Fake Real-time Availability Claims
- The current system uses toggles to simulate real-time availability. Do not present this as a live integration with hardware or external systems.

## 24. No Fake Production-readiness Claims
- Accurately report the status of backend modules and database schemas as "pending verification" if they haven't been fully tested.

## 25. No Modifying Apps/Worker Unless Explicitly Assigned
- Restrict changes to the specific module/app required for the current task.

## 26. No Modifying Unrelated Modules During Focused Tasks
- Maintain focus on the assigned task to prevent scope creep and unintended regressions.
