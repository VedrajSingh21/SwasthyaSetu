import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, AlertCircle, ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { getBundleCareReadiness } from '../../lib/api/careReadiness';
import type { FacilityReadinessResponse } from '../../lib/api/careReadiness';
import { CareReadinessCard } from '../../components/healthcare/CareReadinessCard';
import { PatientBurdenCard } from '../../components/healthcare/PatientBurdenCard';

export default function Facilities() {
  const navigate = useNavigate();
  const location = useLocation();
  const bundleId = location.state?.bundleId;
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<FacilityReadinessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFacilities() {
      if (!bundleId) {
        setError('No Care Bundle found. Please complete an assessment first.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getBundleCareReadiness(bundleId);
        // The backend sorts them by CARE_READY and readinessScore. We can use it directly.
        setFacilities(data.facilities);
      } catch (err: any) {
        setError(err.message || 'Failed to load facilities. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadFacilities();
  }, [bundleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
        <span className="text-slate-600">Finding the best facilities for your care...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 inline-block max-w-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-rose-900 mb-2">Cannot Load Facilities</h2>
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
          <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Suitable Facilities Found</h2>
          <p className="text-slate-500">We could not find any active facilities currently available for your specific care requirements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Care-Ready Facilities</h1>
          <p className="text-slate-500 mt-1">We found these options for your care requirement.</p>
        </div>
      </div>
      
      {selectedFacilityId && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-teal-800 text-sm">Facility Selected</h4>
              <p className="text-xs text-teal-700 mt-0.5">
                You have selected {facilities.find(f => f.facilityId === selectedFacilityId)?.facilityName}. (Referral workflow is pending Task 5)
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/patient/dashboard')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium text-sm transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      <div className="space-y-6">
        {facilities.map((readiness, index) => {
          // A facility is only recommended if it is completely CARE_READY
          const isRecommended = readiness.status === 'CARE_READY' && index === 0;
          const isExpanded = expandedId === readiness.facilityId;
          const isSelectable = readiness.status === 'CARE_READY';
          const isSelected = selectedFacilityId === readiness.facilityId;

          // Note: In a real app we'd fetch the facility object properly, but for the PatientBurdenCard we'll pass a mock-like structure with the real ID and Name.
          const fakeFacilityForBurdenCard = {
            id: readiness.facilityId,
            name: readiness.facilityName,
            type: 'Healthcare Center',
            district: 'Local District',
            distanceKm: 5.2, // Mock distance since location is out of scope
            estimatedTravelMinutes: 15,
            active: true
          };

          return (
            <div 
              key={readiness.facilityId} 
              className={`bg-white rounded-2xl overflow-hidden transition-shadow ${isRecommended ? 'border-2 border-teal-500 shadow-md ring-4 ring-teal-500/10' : 'border border-slate-200 shadow-sm'} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
            >
              {isRecommended && (
                <div className="bg-teal-500 text-white py-1.5 px-4 text-sm font-bold flex items-center justify-center gap-2">
                  <span className="uppercase tracking-wider">✓ Recommended Match</span>
                </div>
              )}
              {!isSelectable && (
                <div className="bg-rose-100 text-rose-800 py-1.5 px-4 text-sm font-bold flex items-center justify-center gap-2">
                  <span className="uppercase tracking-wider">✕ Not Care Ready</span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{readiness.facilityName}</h2>
                    <p className="text-slate-500 text-sm">{fakeFacilityForBurdenCard.type} • {fakeFacilityForBurdenCard.district}</p>
                    
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      {/* Note: We map the real readiness status to the format CareReadinessCard expects */}
                      <CareReadinessCard 
                        readiness={{
                          id: 'temp',
                          facilityId: readiness.facilityId,
                          readinessScore: readiness.readinessScore,
                          specialistAvailability: !readiness.requirements.some(r => r.status !== 'AVAILABLE'),
                          diagnosticAvailability: !readiness.requirements.some(r => r.status !== 'AVAILABLE'),
                          appointmentAvailability: !readiness.requirements.some(r => r.status !== 'AVAILABLE'),
                          lastUpdated: new Date().toISOString()
                        } as any} 
                        hideFacilityName 
                      />
                      <PatientBurdenCard facility={fakeFacilityForBurdenCard as any} readiness={null as any} />
                    </div>
                  </div>
                  
                  <div className="md:w-48 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : readiness.facilityId)}
                      className="text-sm font-semibold text-indigo-600 flex items-center justify-center gap-1 py-2 hover:bg-indigo-50 rounded-lg transition-colors w-full"
                    >
                      {isExpanded ? 'Hide Details' : 'Why this facility?'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isSelectable ? (
                      <button 
                        onClick={() => setSelectedFacilityId(readiness.facilityId)}
                        disabled={isSelected}
                        className={`mt-4 w-full font-semibold py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 ${isSelected ? 'bg-indigo-600 text-white cursor-default' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                        {!isSelected && <ArrowRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="mt-4 w-full bg-slate-100 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 px-6 pb-6">
                    <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Care Requirement Match</h3>
                    <div className="space-y-3">
                      {readiness.requirements.map(req => (
                        <div key={req.serviceId} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div className="text-sm font-medium text-slate-700">{req.serviceName}</div>
                          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${req.status === 'AVAILABLE' ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                            {req.status === 'AVAILABLE' ? '✓ Available' : '✕ ' + req.status.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                    {readiness.blockingReasons.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-rose-800 mb-2">Blocking Reasons</h4>
                        <ul className="space-y-2">
                          {readiness.blockingReasons.map((reason, idx) => (
                            <li key={idx} className="text-xs text-rose-600 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              {reason.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
