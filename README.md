# SwasthyaSetu

🟢 **Live Web Dashboard Demo:** [swasthya-setu-web.vercel.app](https://swasthya-setu-web.vercel.app/)
**A Rural Healthcare Referral & Follow-up Coordination Platform**

*Not a telemedicine app. Not an AI doctor. A referral-closure and care-continuity engine that plugs into ABDM/eSanjeevani, built ASHA-first, works offline, and only "closes" a case when the patient actually received care.*

## Overview

SwasthyaSetu tracks patient referrals all the way to completion. It is designed to work in low-bandwidth, rural environments with offline-first capabilities for ASHA workers. It provides intelligent, assistive AI for summarizing patient details, multilingual translation, and priority scoring—while keeping humans firmly in the loop for all clinical decisions.

## Features

- **Offline-First Synchronization**: Real-time event-sourced synchronization allowing ASHA/ANM workers to handle referrals without internet access.
- **Capacity-Aware Routing**: Directs referrals based on actual availability of beds, specialists, and medicines at receiving facilities.
- **Assistive AI**: Generates patient summaries and identifies missing fields to assist health workers, while maintaining strict human-in-the-loop oversight.
- **ABDM Compliant**: Plugs directly into the existing ABHA, HFR, and HPR sandbox ecosystem.

## Tech Stack & Architecture

SwasthyaSetu is built as a Turborepo monorepo encompassing the web dashboards, mobile worker app, and NestJS backend. 

For full details on the architectural decisions and frameworks used, see the [Tech Stack Documentation](./TECHSTACK.md).

## Getting Started

To run the local development server:
1. Navigate to the project root.
2. Run `npm install` (dependencies are already installed during scaffold).
3. Run `npm run dev` to spin up the web and backend development servers.
4. For the mobile app, navigate to `apps/asha-worker-app` and run `npm start` (using Expo).