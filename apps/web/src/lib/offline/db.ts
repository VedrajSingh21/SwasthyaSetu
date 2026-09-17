import type { OfflineRecord, SyncOperation } from '@swasthyasetu/types';

const DB_NAME = 'swasthyasetu_offline_db';
const DB_VERSION = 1;
const RECORDS_STORE = 'offline_records';
const QUEUE_STORE = 'sync_queue';

export class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(RECORDS_STORE)) {
          db.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'operationId' });
          queueStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
      };
    });
  }

  // --- Offline Records ---

  async storeRecord(record: OfflineRecord): Promise<void> {
    return this.executeWrite(RECORDS_STORE, record);
  }

  async getRecord(id: string): Promise<OfflineRecord | undefined> {
    return this.executeRead(RECORDS_STORE, id);
  }

  async deleteRecord(id: string): Promise<void> {
    return this.executeDelete(RECORDS_STORE, id);
  }

  async getRecordsByType(entityType: string): Promise<OfflineRecord[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      
      const transaction = this.db.transaction(RECORDS_STORE, 'readonly');
      const store = transaction.objectStore(RECORDS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allRecords = request.result as OfflineRecord[];
        resolve(allRecords.filter(r => r.entityType === entityType));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- Sync Queue ---

  async enqueueOperation(operation: SyncOperation): Promise<void> {
    return this.executeWrite(QUEUE_STORE, operation);
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      
      const transaction = this.db.transaction(QUEUE_STORE, 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const index = store.index('syncStatus');
      
      const request = index.getAll('PENDING');
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateOperationStatus(operationId: string, status: SyncOperation['syncStatus'], error?: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));

      const transaction = this.db.transaction(QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.get(operationId);

      request.onsuccess = () => {
        const operation = request.result as SyncOperation;
        if (operation) {
          operation.syncStatus = status;
          if (error) operation.errorMessage = error;
          
          const updateRequest = store.put(operation);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getOperationsByStatus(status: string): Promise<SyncOperation[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      
      const transaction = this.db.transaction(QUEUE_STORE, 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allOps = request.result as SyncOperation[];
        resolve(allOps.filter(op => op.syncStatus === status));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- Internal Helpers ---

  private async executeWrite(storeName: string, data: any): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async executeRead(storeName: string, key: string): Promise<any> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async executeDelete(storeName: string, key: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDb = new OfflineDB();
