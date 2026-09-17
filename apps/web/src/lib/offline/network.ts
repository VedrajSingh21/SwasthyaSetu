import type { NetworkStatus } from '@swasthyasetu/types';
import { useState, useEffect } from 'react';

type NetworkCallback = (status: NetworkStatus) => void;

class NetworkManager {
  private status: NetworkStatus;
  private listeners: Set<NetworkCallback> = new Set();

  constructor() {
    // Default to true in non-browser environments just in case,
    // otherwise check navigator.onLine.
    this.status = typeof navigator !== 'undefined' && navigator.onLine === false ? 'OFFLINE' : 'ONLINE';

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateStatus('ONLINE'));
      window.addEventListener('offline', () => this.updateStatus('OFFLINE'));
    }
  }

  getStatus(): NetworkStatus {
    return this.status;
  }

  subscribe(callback: NetworkCallback): () => void {
    this.listeners.add(callback);
    callback(this.status); // Initial call
    return () => this.listeners.delete(callback);
  }

  private updateStatus(newStatus: NetworkStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach(listener => listener(this.status));
    }
  }
}

export const networkManager = new NetworkManager();

/**
 * A React hook for consuming the current browser network state.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(networkManager.getStatus());

  useEffect(() => {
    return networkManager.subscribe(setStatus);
  }, []);

  return status;
}
