import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, AlertCircle, ArrowRight } from 'lucide-react';
import { mockFacilities, mockCareReadiness } from '../../lib/mockData';
import { CareReadinessCard } from '../../components/healthcare/CareReadinessCard';
import { PatientBurdenCard } from '../../components/healthcare/PatientBurdenCard';

export default function Facilities() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // We have mockCareReadiness mapped to mockFacilities.
  // We want to sort them so the recommended one (Care Ready) is first.
  const facilitiesData = mockFacilities.map(f => {
    const readiness = mockCareReadiness.find(r => r.facilityId === f.id);
    return { facility: f, readiness };
  }).filter(data => data.readiness !== undefined)
    .sort((a, b) => b.readiness!.readinessScore - a.readiness!.readinessScore);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Care-Ready Facilities</h1>
          <p className="text-slate-500 mt-1">We found these options for your care requirement.</p>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-8">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 text-sm">Demo Data Indicator</h4>
          <p className="text-xs text-amber-700 mt-1">
            Availability, distances, and readiness scores are simulated.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {facilitiesData.map((data, index) => {
          const { facility, readiness } = data;
          const isRecommended = index === 0;
          const isExpanded = expandedId === facility.id;

          return (
            <div 
              key={facility.id} 
              className={`bg-white rounded-2xl overflow-hidden transition-shadow ${isRecommended ? 'border-2 border-teal-500 shadow-md ring-4 ring-teal-500/10' : 'border border-slate-200 shadow-sm'}`}
            >
              {isRecommended && (
                <div className="bg-teal-500 text-white py-1.5 px-4 text-sm font-bold flex items-center justify-center gap-2">
                  <span className="uppercase tracking-wider">✓ Recommended Match</span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{facility.name}</h2>
                    <p className="text-slate-500 text-sm">{facility.type} • {facility.district}</p>
                    
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      <CareReadinessCard readiness={readiness!} hideFacilityName />
                      <PatientBurdenCard facility={facility} readiness={readiness!} />
                    </div>
                  </div>
                  
                  <div className="md:w-48 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : facility.id)}
                      className="text-sm font-semibold text-indigo-600 flex items-center justify-center gap-1 py-2 hover:bg-indigo-50 rounded-lg transition-colors w-full"
                    >
                      {isExpanded ? 'Hide Details' : 'Why this facility?'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <button 
                      onClick={() => navigate('/patient/referrals', { state: { facilityId: facility.id } })}
                      className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      Select
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 px-6 pb-6">
                    <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Care Requirement Match</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium mb-1">Specialist</div>
                        <div className={`font-semibold ${readiness!.specialistAvailability ? 'text-teal-700' : 'text-slate-400'}`}>
                          {readiness!.specialistAvailability ? '✓ Available' : '✕ Unavailable'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium mb-1">Diagnostics (ECG)</div>
                        <div className={`font-semibold ${readiness!.diagnosticAvailability ? 'text-teal-700' : 'text-rose-600'}`}>
                          {readiness!.diagnosticAvailability ? '✓ Available' : '✕ Unavailable'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium mb-1">Appointments</div>
                        <div className={`font-semibold ${readiness!.appointmentAvailability ? 'text-teal-700' : 'text-slate-400'}`}>
                          {readiness!.appointmentAvailability ? '✓ Available' : '✕ Unavailable'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium mb-1">Recommendation</div>
                        <div className={`font-semibold ${isRecommended ? 'text-teal-700' : 'text-amber-600'}`}>
                          {isRecommended ? 'Optimal Match' : 'Sub-optimal'}
                        </div>
                      </div>
                    </div>
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
