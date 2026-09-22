import { useState, useEffect, useCallback } from 'react';
import { CareJourneyVisual } from '../../components/healthcare/CareJourneyVisual';
import { AlertTriangle, RefreshCcw, Loader2, WifiOff } from 'lucide-react';
import { getPatientJourneys, getPatientReferrals } from '../../lib/api/patient';
import { dynamicRoutingApi, type ReroutingResponse } from '../../lib/api/dynamicRouting';
import { config, ApiError, NetworkError } from '../../lib/api';
import type { CareJourney, Referral } from '@swasthyasetu/types';

export default function Journey() {
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [routingState, setRoutingState] = useState<ReroutingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!config.demoPatientId) {
      setError('Patient ID not configured');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const [journeys, referrals] = await Promise.all([
        getPatientJourneys(config.demoPatientId),
        getPatientReferrals(config.demoPatientId)
      ]);
      
      const activeJourney = journeys[0]; 
      // Look for a referral that is PENDING, ACCEPTED, or REROUTED
      const activeReferral = referrals.find((r: Referral) => !['CANCELLED', 'COMPLETED'].includes(r.status)) || referrals[0];
      
      setJourney(activeJourney || null);
      setReferral(activeReferral || null);
      
      const ref = activeReferral;
      if (ref && !['COMPLETED', 'CANCELLED', 'REROUTED', 'BLOCKED'].includes(ref.status)) {
         if (ref.targetFacilityId && ref.careBundleId) {
            const routing = await dynamicRoutingApi.getReroute(
              ref.careBundleId, 
              ref.targetFacilityId
            );
            setRoutingState(routing);
         }
      } else {
        setRoutingState(null);
      }
    } catch (err: unknown) {
      if (err instanceof NetworkError) {
         setError('Network error. Offline mode enabled.');
         setIsOffline(true);
      } else if (err instanceof ApiError) {
         setError(err.message);
      } else {
         setError('Failed to load journey data');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecover = async () => {
    if (!referral) return;
    try {
      setIsRecovering(true);
      setError(null);
      await dynamicRoutingApi.recoverReferral(referral.id);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof NetworkError) {
         setError('Live rerouting requires connectivity.');
         setIsOffline(true);
      } else if (err instanceof ApiError) {
         setError(err.message);
      } else {
         setError('Recovery failed');
      }
    } finally {
      setIsRecovering(false);
    }
  };

  if (isLoading && !journey) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  const isBlocked = routingState?.currentFacility?.status === 'NOT_CARE_READY';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Care Journey</h1>
          <p className="text-slate-500 mt-2">Track your progress and upcoming appointments.</p>
        </div>
        <button 
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {isOffline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" /> 
          <div>
             <strong>Offline Mode:</strong> Viewing locally available journey information. Live rerouting and updates require connectivity.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isBlocked && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-800">Care Journey Blocked</h4>
                <p className="text-sm text-rose-700 mt-1">
                  Your current facility ({routingState.currentFacility.facilityName}) can no longer complete the required care bundle.
                </p>
                <div className="mt-3 space-y-1">
                  {routingState.currentFacility.blockingReasons?.map((reason, idx) => (
                    <div key={idx} className="text-sm font-medium text-rose-800 bg-rose-100/50 px-2 py-1 rounded">
                      • {reason.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {journey ? (
            <CareJourneyVisual journey={journey} />
          ) : (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">No active journey found.</p>
            </div>
          )}
        </div>

        <div>
          {routingState && !isBlocked && routingState.routingStatus === 'CURRENT_ROUTE_STILL_VALID' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Facility</div>
              <h3 className="font-bold text-slate-800">{routingState.currentFacility.facilityName}</h3>
              <p className="text-sm text-emerald-600 font-medium mt-1">✓ CARE READY</p>
            </div>
          )}

          {routingState && isBlocked && routingState.routingStatus === 'NO_ALTERNATIVE_AVAILABLE' && (
            <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm">
               <div className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-2">No Alternative Available</div>
               <p className="text-sm text-slate-600">
                  The system is currently unable to find a CARE READY facility for your required bundle. 
                  Please check back later or contact support.
               </p>
            </div>
          )}

          {routingState && isBlocked && routingState.alternative && (
            <div className="bg-white border-2 border-teal-500 rounded-xl p-5 shadow-md animate-in fade-in slide-in-from-right-4">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded mb-3 uppercase tracking-wider">
                <RefreshCcw className="w-3 h-3" /> Alternative Found
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{routingState.alternative.facilityName}</h3>
              
              <div className="mt-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <p className="text-sm text-slate-600">
                    The current facility cannot fulfil the care requirement. 
                    This alternative is fully evaluated and <span className="font-bold text-teal-600">CARE READY</span>.
                 </p>
                 <div className="mt-2 text-xs font-bold text-slate-500 uppercase">Readiness Score: {routingState.alternative.readinessScore}%</div>
              </div>

              <button 
                onClick={handleRecover}
                disabled={isRecovering || isOffline}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRecovering ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Rerouting...</>
                ) : (
                   <><RefreshCcw className="w-4 h-4" /> Reroute Care</>
                )}
              </button>
            </div>
          )}

          {!routingState && referral?.status === 'REROUTED' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-in fade-in">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Updated Destination</div>
              <div className="text-sm text-teal-600 font-medium mb-1">✓ Successfully rerouted.</div>
              <p className="text-sm text-slate-500">Your referral is active at the new facility.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
