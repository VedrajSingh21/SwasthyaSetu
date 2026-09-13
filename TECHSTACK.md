# SwasthyaSetu Tech Stack & Architecture

## System Architecture

SwasthyaSetu is built with a robust, scalable architecture separated into multiple client interfaces and a unified backend system.

### Client Layer
- **Patient App**: React + PWA for low-bandwidth access.
- **ASHA/ANM/PHC Worker App**: React Native (Expo) offering true offline-first capabilities using WatermelonDB & SQLite.
- **Receiving Facility Panel**: React web application.
- **Admin/District Dashboard**: React web application.

### Backend Services
- **API & Core Logic**: Node.js with NestJS.
- **Database**: PostgreSQL (primary), Redis (caching and queues).
- **Queue/Jobs**: BullMQ for overdue-follow-up checks, reminders, and sync reconciliation.

### Integrations
- **ABDM**: Integration with ABHA, HFR, and HPR sandbox.
- **eSanjeevani**: Hand-off capabilities via mocked adapters for teleconsults.
- **Bhashini**: Multilingual NLU/Translation and Voice (STT/TTS) APIs.
- **Messaging**: SMS/WhatsApp Business API for patient reminders.

## Technical Choices & Reasoning

### Frontend - Web Apps (Patient App & Facility Panel)
- **Framework**: React + Vite
- **Reasoning**: Rural users require low-barrier entry. A PWA degrades gracefully on 2G/3G networks and provides essential offline caching (via IndexedDB and Workbox). Facility panels don't require offline access, making standard React the perfect choice.

### Frontend - Mobile App (ASHA/ANM Worker App)
- **Framework**: React Native (Expo)
- **Database**: WatermelonDB & SQLite
- **Reasoning**: Field workers require deep device integration (camera, GPS) and true offline capabilities for sync engines. The event-sourced sync handles conflict resolution offline.

### Backend API
- **Framework**: NestJS (Node.js)
- **Reasoning**: Keeps the stack unified in TypeScript. The backend models the referral process as an explicit **Finite-State Machine**, ensuring unambiguous referral states and detailed event logging for traceability.

### AI & ML Capabilities (Assistive, Non-clinical)
- **Summarization**: Generates structured patient summaries (requires doctor approval).
- **Multilingual Support**: Dynamic translation for doctor notes and Voice (STT) intent routing.
- **Priority Scoring**: Rules-based engine for queue prioritization.
- **Follow-up Predictor**: Identifies high-risk no-shows to assist ASHA workers.
