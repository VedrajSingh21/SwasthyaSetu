import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Activity, Bell, Wifi, WifiOff, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "../../lib/offline/network";
import { syncService } from "../../lib/offline/sync";
import { offlineDb } from "../../lib/offline/db";

export function PatientLayout() {
  const [lowConnectivity, setLowConnectivity] = useState(false);
  const networkStatus = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check pending count periodically
    const checkPending = async () => {
      try {
        const ops = await offlineDb.getOperationsByStatus('PENDING');
        setPendingCount(ops.length);
      } catch (err) {
        console.error('Failed to get pending operations', err);
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (networkStatus === 'ONLINE' && pendingCount > 0) {
      handleSync();
    }
  }, [networkStatus, pendingCount]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncPendingOperations();
      // Update count after sync
      const ops = await offlineDb.getOperationsByStatus('PENDING');
      setPendingCount(ops.length);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">SwasthyaSetu</span>
          </Link>
          <div className="flex items-center gap-4">
            
            {networkStatus === 'OFFLINE' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <WifiOff className="w-4 h-4" />
                <span className="hidden sm:inline">Offline Mode</span>
              </div>
            ) : pendingCount > 0 ? (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : `Sync ${pendingCount} Items`}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-50 text-slate-600 border border-slate-200">
                <Wifi className="w-4 h-4" />
                <span className="hidden sm:inline">Connected</span>
              </div>
            )}

            <button 
              onClick={() => setLowConnectivity(!lowConnectivity)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                lowConnectivity 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle Simulated Low Connectivity Mode"
            >
              {lowConnectivity ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-medium">
              RK
            </div>
          </div>
        </div>
      </header>

      {lowConnectivity && (
        <div className="bg-amber-50 border-b border-amber-100 shadow-sm z-40 relative">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900">LOW CONNECTIVITY MODE</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 tracking-wide uppercase border border-amber-200">
                Demo Simulation
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> Assessment available
              </span>
              <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> Bundle preparation
              </span>
              <div className="flex items-center gap-4 text-amber-700 ml-auto sm:ml-0">
                <span>Pending sync: {pendingCount}</span>
                <button onClick={handleSync} className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2">
                  <Clock className="w-4 h-4" /> Sync when online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
