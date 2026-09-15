import { useState } from 'react';
import { mockFacilities, mockCareReadiness } from '../../lib/mockData';
import { Settings, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function FacilityCapacity() {
  const facility = mockFacilities[0];
  const initialReadiness = mockCareReadiness[0];

  const [specialist, setSpecialist] = useState(initialReadiness.specialistAvailability);
  const [ecg, setEcg] = useState(initialReadiness.diagnosticAvailability);
  const [bloodTest, setBloodTest] = useState(true);
  const [appointment, setAppointment] = useState(initialReadiness.appointmentAvailability);
  
  // Derived state based on requirements
  // Requirement: Specialist, ECG, Blood Test, Appointment
  const isReady = specialist && ecg && bloodTest && appointment;
  const score = isReady ? 92 : 61; // Demo scores

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{facility.name} - Capacity Management</h1>
        <p className="text-slate-500 mt-1">Operational capacity and service availability control.</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
        <Settings className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-indigo-900">DEMO SIMULATION</div>
          <p className="text-sm text-indigo-700 mt-1">
            Toggle the switches below to simulate real-time changes in facility capacity. These changes conceptually update your overall Care Readiness score and affect intelligent routing for incoming referrals.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">Specialist Availability</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Cardiology</div>
                  <div className="text-sm text-slate-500">Dr. Sharma, Dr. Gupta</div>
                </div>
                <button 
                  onClick={() => setSpecialist(!specialist)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${specialist ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${specialist ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">Diagnostic Availability</h2>
            </div>
            <div className="p-6 divide-y divide-slate-100">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <div className="font-semibold text-slate-900">ECG</div>
                  <div className="text-sm text-slate-500">Machine Status</div>
                </div>
                <button 
                  onClick={() => setEcg(!ecg)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ecg ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ecg ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="font-semibold text-slate-900">Blood Test - Lipid Profile</div>
                  <div className="text-sm text-slate-500">Pathology Lab</div>
                </div>
                <button 
                  onClick={() => setBloodTest(!bloodTest)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${bloodTest ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bloodTest ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">Appointment Capacity</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">General OPD / Consultations</div>
                  <div className="text-sm text-slate-500">Accepting new appointments</div>
                </div>
                <button 
                  onClick={() => setAppointment(!appointment)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appointment ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appointment ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Output Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm sticky top-6">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Live Output State</div>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-2">
                {score}%
              </div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Simulated Score</div>
              
              <div className={`inline-flex px-4 py-1.5 text-sm font-bold rounded-full items-center gap-2 ${isReady ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isReady ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4" />}
                {isReady ? "CARE READY" : "NOT CARE-READY"}
              </div>
            </div>

            {!isReady && (
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <div className="text-rose-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4"/> Blockers identified
                </div>
                <ul className="text-sm text-slate-300 space-y-1 ml-6 list-disc">
                  {!specialist && <li>Specialist unavailable</li>}
                  {!ecg && <li>ECG machine unavailable</li>}
                  {!bloodTest && <li>Blood tests unavailable</li>}
                  {!appointment && <li>No appointment slots open</li>}
                </ul>
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-slate-700">
              <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">Required Services Match</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Cardiologist</span>
                {specialist ? <span className="text-teal-400">✓</span> : <span className="text-rose-400">✕</span>}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">ECG</span>
                {ecg ? <span className="text-teal-400">✓</span> : <span className="text-rose-400">✕</span>}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Blood Test</span>
                {bloodTest ? <span className="text-teal-400">✓</span> : <span className="text-rose-400">✕</span>}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Appointment</span>
                {appointment ? <span className="text-teal-400">✓</span> : <span className="text-rose-400">✕</span>}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
