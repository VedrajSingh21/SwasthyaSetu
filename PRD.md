# SwasthyaSetu Product Requirements Document (PRD)

## 1. Product Overview
SwasthyaSetu is a closed-loop rural public healthcare care orchestration system. It is designed to track and manage patient referrals from initial assessment to care completion. 

## 2. Problem Statement
Rural healthcare suffers from broken referral loops. Patients are often referred to facilities that lack the capacity, specialists, or equipment to treat them, leading to wasted journeys, high patient burden, and incomplete care.

## 3. Target Users
- **Patients**: Rural citizens seeking healthcare.
- **Healthcare Facilities**: Doctors, nurses, and administrators at Primary Health Centers (PHCs), Community Health Centers (CHCs), and District Hospitals.
- **District/Admin**: District health officers monitoring the overall healthcare network performance.

## 4. User Personas
- **ASHA/ANM Worker**: Needs offline-capable tools to assess patients and initiate referrals.
- **Facility Medical Officer**: Needs clear care requirements to prepare for incoming patients and manage facility capacity.
- **District Health Officer**: Needs visibility into systemic bottlenecks (e.g., broken ECG machines causing reroutes).

## 5. Core Product Promise
"Don’t just refer the patient. Make sure the care is ready."

## 6. Product USP
Care Readiness + Dynamic Routing + Care Completion.

## 7. Why existing systems alone do not fully address the closed-loop problem
Existing systems often act as generic directories or appointment bookers without verifying if the specific *Care Bundle* required by the patient can actually be fulfilled at that exact moment. They do not proactively manage "Cannot Fulfil" scenarios or dynamic rerouting based on real-time facility capacity.

## 8. Product Philosophy
SwasthyaSetu is an orchestration layer, not a generic hospital management system or an AI chatbot. It ensures care continuity by explicitly tracking readiness and completion.

## 9. Core User Journey
Find → Assess → Refer → Reach → Treat → Follow-up

## 10. Patient Experience
- **Implemented:** Onboarding/login, simulated assisted assessment, demo journey tracking.
- **Planned:** Full Care Bundle generation, care-ready facility discovery, referral, dynamic rerouting, follow-up.
- **Future:** Comprehensive patient burden calculation.

## 11. Facility Experience
- **Implemented:** Dashboard, capacity management simulation (toggling specialist/diagnostic availability), simulated incoming referrals.
- **Planned:** Care Bundle requirement review, accept/refuse/cannot fulfil workflows, blocker identification, appointment handling, service completion.

## 12. Admin/District Experience
- **Implemented:** District dashboard, demo bottleneck detection (e.g., ECG machine breakdown).
- **Planned:** Bottleneck explanation, recommended actions, Care Routing Impact analysis, district/facility/service intelligence.

## 13. Care Bundle concept
A structured set of requirements (specialists, diagnostics, procedures) derived from the patient's assessment, which a facility must be able to fulfill to accept the referral.

## 14. Care Readiness Engine concept
The core logic that evaluates a facility's real-time capacity (staff, equipment, slots) against a patient's Care Bundle to determine if they are CARE READY.

## 15. Dynamic Routing
If a facility becomes NOT CARE-READY while a patient is in transit, the system automatically triggers a "Cannot Fulfil → identify blocker → find alternative → reroute → continue journey" flow.

## 16. Referral Recovery
Handling dropped or blocked referrals by immediately finding alternatives rather than abandoning the patient journey.

## 17. Care Completion
The journey only ends when the patient has received the required care, closing the loop.

## 18. District Care Bottleneck Intelligence
Aggregated insights for administrators showing why referrals are being rerouted (e.g., identifying that a specific CHC's broken X-ray machine is causing 50 reroutes a week).

## 19. AI role
- **Implemented:** DEMO SIMULATION of AI output in the frontend (deterministic local rules).
- **Planned:** Convert patient-reported information into structured Care Requirements / Care Bundles, multilingual/natural-language understanding, summarization/explanation.
- **Constraint:** The product must NOT be presented as an AI chatbot.

## 20. Low-connectivity direction
- **Implemented:** Visual/demo Low Connectivity Mode in the frontend.
- **Planned:** True offline-first synchronization for ASHA workers.
- **Future:** SMS fallback, production-grade offline capability.

## 21. Data/Interoperability direction
- **Planned:** ABDM compliance (ABHA, HFR, HPR), eSanjeevani integration.

## 22. Security/Trust direction
- **Planned:** Secure data handling, explicit patient consent, human-in-the-loop for AI outputs.

## 23. Demo Story
The current frontend demonstrates the flow from assessment to dynamic capacity constraints at a facility, showing how readiness scores change and bottlenecks are visualized for admins.

## 24. Success Metrics
- Reduction in abandoned referrals.
- Reduction in patient travel distance for unfulfilled care.
- Time to resolve "Cannot Fulfil" events.

## 25. Current Scope
- Frontend prototypes (Patient, Facility, Admin).
- Backend foundation (NestJS, PostgreSQL, Drizzle).
- Mock data and type definitions.
- Local deterministic rules simulating AI and routing.

## 26. Out of Scope / Future
- Real-time hardware integration.
- Full EMR replacements.
- Telemedicine video hosting (handled via integration).
