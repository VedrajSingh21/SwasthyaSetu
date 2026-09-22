import { useState, useEffect, useCallback } from 'react';
import { facilityApi, type InboundReferral } from '../../lib/api/facility';
import { config, ApiError, NetworkError, TimeoutError } from '../../lib/api';
import { AlertCircle, Check, Stethoscope, Loader2 } from 'lucide-react';

export default function FacilityReferrals() {
  const [referrals, setReferrals] = useState<InboundReferral[]>([]);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    if (!config.demoFacilityId) {
      setError('Facility ID is not configured.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await facilityApi.getFacilityReferrals(config.demoFacilityId);
      setReferrals(data);
      // Reselect if it still exists
      if (selectedReferralId && !data.find(r => r.id === selectedReferralId)) {
        setSelectedReferralId(null);
      }
    } catch (err: any) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof NetworkError || err instanceof TimeoutError) setError('Network error. Please try again.');
      else setError('Failed to load referrals.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedReferralId]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleSelect = (id: string) => {
    if (selectedReferralId === id) return;
    setSelectedReferralId(id);
    setError(null);
  };

  const selectedRef = referrals.find(r => r.id === selectedReferralId);

  const handleStatusUpdate = async (status: 'ACCEPTED' | 'COMPLETED') => {
    if (!selectedRef) return;
    try {
      setIsUpdating(true);
      setError(null);
      await facilityApi.updateReferralStatus(selectedRef.id, status);
      await fetchReferrals();
    } catch (err: any) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to update referral status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && referrals.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* List Column */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800">Incoming Referrals</h2>
        </div>
        
        {error && !selectedRef && (
           <div className="p-4 bg-rose-50 text-rose-700 text-sm border-b border-rose-100 flex items-center gap-2">
             <AlertCircle className="w-4 h-4" /> {error}
           </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {referrals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No active inbound referrals.
            </div>
          ) : (
            referrals.map(ref => {
              const isSelected = selectedReferralId === ref.id;
              let statusColor = "bg-slate-100 text-slate-700";
              if (ref.status === "ACCEPTED") statusColor = "bg-teal-100 text-teal-800";
              if (ref.status === "COMPLETED") statusColor = "bg-emerald-100 text-emerald-800";
              if (ref.status === "REROUTED" || ref.status === "BLOCKED") statusColor = "bg-amber-100 text-amber-800";
              
              return (
                <div 
                  key={ref.id} 
                  onClick={() => handleSelect(ref.id)}
                  className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-500" title={ref.id}>
                      {ref.id.substring(0, 8)}...
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 uppercase rounded-full ${statusColor}`}>
                      {ref.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{ref.patient?.name || 'Unknown Patient'}</div>
                  <div className="text-sm text-slate-600 truncate">{ref.bundle?.title || 'Unknown Bundle'}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Column */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {selectedRef ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-slate-500 mb-1">REFERRAL {selectedRef.id}</div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedRef.patient?.name}</h2>
                  <div className="text-sm text-slate-600 mt-1">Priority: {selectedRef.priority} • {selectedRef.patient?.gender}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Status</div>
                  <div className="font-bold text-slate-900">{selectedRef.status}</div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              
              {/* Review Phase */}
              {selectedRef.status === "PENDING" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm border-b pb-2">Requested Care</h3>
                    <div className="text-sm font-semibold text-slate-700 mb-2">{selectedRef.bundle?.title}</div>
                    {selectedRef.reason && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded mt-2">
                        <strong>Reason:</strong> {selectedRef.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => handleStatusUpdate('ACCEPTED')} 
                      disabled={isUpdating}
                      className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Referral'}
                    </button>
                    {/* Cannot Fulfil is omitted from the mock workflow as Dynamic Routing UI integration is out of scope for Task 6B */}
                  </div>
                </div>
              )}

              {/* Accepted Phase */}
              {selectedRef.status === "ACCEPTED" && (
                <div className="space-y-6">
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700"><Check className="w-4 h-4"/></div>
                    <div>
                      <div className="font-bold text-teal-900">Referral Accepted</div>
                      <div className="text-sm text-teal-700">Patient care is currently in progress at this facility.</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => handleStatusUpdate('COMPLETED')} 
                      disabled={isUpdating}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                    >
                       {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mark Completed'}
                    </button>
                  </div>
                </div>
              )}

              {/* Read Only Terminal States */}
              {(selectedRef.status !== "PENDING" && selectedRef.status !== "ACCEPTED") && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-sm mr-2 bg-slate-200 text-slate-800">
                      {selectedRef.status}
                    </span>
                  </h3>
                  {selectedRef.status === "REROUTED" ? (
                    <p className="text-slate-600">
                      This referral has been dynamically rerouted to an alternative facility. It is no longer active here.
                    </p>
                  ) : selectedRef.status === "BLOCKED" ? (
                    <p className="text-slate-600">
                      This referral is currently blocked due to a care readiness issue.
                    </p>
                  ) : (
                    <p className="text-slate-600">
                      This referral requires no further action or is handled externally.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <Stethoscope className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-slate-600">No Referral Selected</h3>
            <p className="mt-2">Select an incoming referral from the list to review details and take action.</p>
          </div>
        )}
      </div>
    </div>
  );
}
