import { offlineDb } from './db';
import type { SyncOperation } from '@swasthyasetu/types';

const API_URL = 'http://localhost:3000';
const MAX_RETRIES = 3;

class SyncService {
  private isSyncing = false;

  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync is already in progress. Skipping duplicate invocation.');
      return;
    }

    this.isSyncing = true;
    try {
      const pendingOperations = await offlineDb.getOperationsByStatus('PENDING');
      
      // Sort deterministically: createdAt ASC, then operationId ASC
      pendingOperations.sort((a, b) => {
        if (a.createdAt === b.createdAt) {
          return a.operationId.localeCompare(b.operationId);
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      for (const operation of pendingOperations) {
        await this.processOperation(operation);
      }
    } catch (error) {
      console.error('Fatal error during sync process:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      // Mark as syncing to prevent external interference
      operation.syncStatus = 'SYNCING';
      await offlineDb.enqueueOperation(operation);

      if (operation.entityType !== 'Assessment' || operation.operationType !== 'CREATE') {
        throw new Error(`Unsupported operation: ${operation.operationType} on ${operation.entityType}`);
      }

      const formData = operation.payload as Record<string, string>;
      
      if (!formData.patientId) {
        await this.handleFatalFailure(operation, 'Validation/Client error: missing patientId in offline payload');
        return;
      }

      const payload = {
        patientId: formData.patientId,
        patientReportedSymptoms: `${formData.problem || ''} ${formData.symptoms || ''}`.trim(),
        duration: formData.duration,
        additionalContext: formData.history,
      };

      const response = await fetch(`${API_URL}/assessments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: No authentication token is included as the prototype doesn't have it implemented yet.
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Success lifecycle
        operation.syncStatus = 'SYNCED';
        await offlineDb.enqueueOperation(operation);

        // Update the local record
        const record = await offlineDb.getRecord(operation.entityId);
        if (record) {
          record.syncStatus = 'SYNCED';
          await offlineDb.storeRecord(record);
        }
      } else if (response.status === 409) {
        // Conflict lifecycle
        const errorText = await response.text();
        await this.handleConflict(operation, `Server conflict 409: ${errorText}`);
      } else {
        const isServerFailure = response.status >= 500;
        const errorText = await response.text();

        if (isServerFailure) {
          await this.handleRetryableFailure(operation, `Server error ${response.status}: ${errorText}`);
        } else {
          // Client/Validation failure (e.g. 400, 404 for missing patientId)
          await this.handleFatalFailure(operation, `Validation/Client error ${response.status}: ${errorText}`);
        }
      }
    } catch (error: any) {
      // Network/Temporary failure
      await this.handleRetryableFailure(operation, `Network or temporary error: ${error.message}`);
    }
  }

  private async handleConflict(operation: SyncOperation, reason: string): Promise<void> {
    console.warn(`Conflict for operation ${operation.operationId}:`, reason);
    operation.syncStatus = 'CONFLICT';
    operation.conflictStatus = 'UNRESOLVED';
    operation.errorMessage = reason;
    await offlineDb.enqueueOperation(operation);

    const record = await offlineDb.getRecord(operation.entityId);
    if (record) {
      record.syncStatus = 'CONFLICT';
      await offlineDb.storeRecord(record);
    }
  }

  async resolveConflict(operationId: string, resolution: 'DISCARD' | 'RETRY'): Promise<void> {
    const ops = await offlineDb.getOperationsByStatus('CONFLICT');
    const operation = ops.find(o => o.operationId === operationId);
    
    if (!operation) {
      console.warn(`Cannot resolve conflict: Operation ${operationId} not found or not in CONFLICT state.`);
      return;
    }

    if (resolution === 'DISCARD') {
      operation.syncStatus = 'FAILED'; 
      operation.conflictStatus = 'RESOLVED_CLIENT';
      await offlineDb.enqueueOperation(operation);

      const record = await offlineDb.getRecord(operation.entityId);
      if (record) {
        record.syncStatus = 'FAILED';
        await offlineDb.storeRecord(record);
      }
    } else if (resolution === 'RETRY') {
      operation.syncStatus = 'PENDING';
      operation.conflictStatus = 'RESOLVED_CLIENT';
      operation.retryCount = 0; 
      await offlineDb.enqueueOperation(operation);

      const record = await offlineDb.getRecord(operation.entityId);
      if (record) {
        record.syncStatus = 'PENDING';
        await offlineDb.storeRecord(record);
      }
    }
  }

  private async handleRetryableFailure(operation: SyncOperation, reason: string): Promise<void> {
    console.warn(`Retryable failure for operation ${operation.operationId}:`, reason);
    
    if (operation.retryCount >= MAX_RETRIES) {
      await this.handleFatalFailure(operation, `Exceeded MAX_RETRIES. Last error: ${reason}`);
    } else {
      operation.retryCount += 1;
      operation.syncStatus = 'PENDING';
      operation.errorMessage = reason;
      await offlineDb.enqueueOperation(operation);
      
      const record = await offlineDb.getRecord(operation.entityId);
      if (record) {
        record.syncStatus = 'PENDING';
        await offlineDb.storeRecord(record);
      }
    }
  }

  private async handleFatalFailure(operation: SyncOperation, reason: string): Promise<void> {
    console.error(`Fatal failure for operation ${operation.operationId}:`, reason);
    operation.syncStatus = 'FAILED';
    operation.errorMessage = reason;
    await offlineDb.enqueueOperation(operation);

    const record = await offlineDb.getRecord(operation.entityId);
    if (record) {
      record.syncStatus = 'FAILED';
      await offlineDb.storeRecord(record);
    }
  }
}

export const syncService = new SyncService();
