# SwasthyaSetu Development Setup

## Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js** (v20+ LTS)
- **npm** (v10+)
- **Python** (v3.10+, accessible via `py` command on Windows for AI/ML features)
- **Git**

*(React Native Expo Go will be used for mobile development; Android Studio is optional at this stage.)*

## Services & Ports
- Web App: `http://localhost:5173`
- API Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/VedrajSingh21/SwasthyaSetu.git
cd SwasthyaSetu
npm install
```

### 2. Environment Variables
Copy the `.env.example` file to `.env` in the root and in any specific apps as needed:
```bash
cp .env.example .env
```

### 3. Run the Monorepo
Start all applications concurrently:
```bash
npm run dev
```

### 4. Mobile Worker App (Optional)
To test the ASHA Worker app:
```bash
cd apps/worker
npm run start
```
Scan the QR code with the Expo Go app on your physical device.
