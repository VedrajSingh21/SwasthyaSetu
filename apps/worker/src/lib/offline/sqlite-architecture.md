# Worker Offline SQLite Architecture

As part of Phase 6 Task 1 (Offline Architecture Foundation), we have defined the offline architecture for the Worker mobile app (React Native). Since the Worker app is currently a placeholder, this document defines the intended storage layer structure to match the shared `@swasthyasetu/types` offline contracts, without unnecessarily bloating the placeholder with native mobile dependencies (like `react-native-sqlite-storage` or `expo-sqlite`) at this exact moment.

## Architecture

While the Web PWA relies on IndexedDB, the React Native Worker app will rely on SQLite for persistent offline storage. The API abstraction will mirror the Web's IndexedDB wrapper (`OfflineDB`) to ensure that Sync Engines can remain mostly platform-agnostic.

### Intended Adapter Structure

```typescript
import { OfflineRecord, SyncOperation } from '@swasthyasetu/types';
// e.g., import * as SQLite from 'expo-sqlite';

export class SQLiteOfflineAdapter {
  private db: any; // SQLite.SQLiteDatabase

  async init(): Promise<void> {
    // 1. Open SQLite database
    // 2. Create `offline_records` table if not exists (id PRIMARY KEY, entityType TEXT, payload TEXT, lastModifiedLocallyAt TEXT, syncStatus TEXT)
    // 3. Create `sync_queue` table if not exists (operationId PRIMARY KEY, entityType TEXT, entityId TEXT, operationType TEXT, payload TEXT, createdAt TEXT, retryCount INTEGER, syncStatus TEXT)
  }

  // --- Offline Records ---
  
  async storeRecord(record: OfflineRecord): Promise<void> {
    // INSERT OR REPLACE INTO offline_records ...
  }

  async getRecord(id: string): Promise<OfflineRecord | undefined> {
    // SELECT * FROM offline_records WHERE id = ?
  }

  async deleteRecord(id: string): Promise<void> {
    // DELETE FROM offline_records WHERE id = ?
  }

  // --- Sync Queue ---
  
  async enqueueOperation(operation: SyncOperation): Promise<void> {
    // INSERT INTO sync_queue ...
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    // SELECT * FROM sync_queue WHERE syncStatus = 'PENDING'
  }

  async updateOperationStatus(operationId: string, status: SyncOperation['syncStatus'], error?: string): Promise<void> {
    // UPDATE sync_queue SET syncStatus = ?, errorMessage = ? WHERE operationId = ?
  }
}
```

## Shared Contracts

The SQLite adapter will serialize the JSON payload strings from SQLite into the exact same `OfflineRecord` and `SyncOperation` TypeScript interfaces defined in `@swasthyasetu/types`.

This ensures that the business logic for Background Sync, Conflict Resolution, and Queue Management (to be built in later Phase 6 tasks) can operate identically regardless of whether the host environment is the Web PWA (IndexedDB) or the Worker App (SQLite).
