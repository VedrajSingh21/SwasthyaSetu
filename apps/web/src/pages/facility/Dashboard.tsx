import { mockFacilities, mockCareReadiness } from "../../lib/mockData";
import { Check, AlertTriangle } from "lucide-react";

export default function FacilityDashboard() {
  const facility = mockFacilities[0]; // District Hospital
  const readiness = mockCareReadiness[0]; // DH readiness

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{facility.name}</h1>
        <p className="text-slate-500 mt-1">Operational Readiness Dashboard</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Today's Referrals</div>
          <div className="text-3xl font-bold text-slate-900">24</div>
          <div className="mt-2 text-sm text-slate-600"><span className="text-teal-600 font-medium">18 Accepted</span> • 6 Pending</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Facility Capacity</div>
          <div className="text-3xl font-bold text-slate-900">{readiness.facilityCapacity} <span className="text-lg font-normal text-slate-500">beds/slots</span></div>
          <div className="mt-2 text-sm text-slate-600">Current availability</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Est. Wait Time</div>
          <div className="text-3xl font-bold text-slate-900">{readiness.estimatedWaitTime} <span className="text-lg font-normal text-slate-500">min</span></div>
          <div className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Higher than average
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Care Readiness Status</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-4">Cardiology</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Specialist</span>
                  {readiness.specialistAvailability ? <span className="text-teal-600 font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Available</span> : <span className="text-slate-400">Unavailable</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">ECG</span>
                  {readiness.diagnosticAvailability ? <span className="text-teal-600 font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Available</span> : <span className="text-rose-500 font-medium flex items-center gap-1">Unavailable</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Appointments</span>
                  {readiness.appointmentAvailability ? <span className="text-teal-600 font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Available</span> : <span className="text-slate-400">Unavailable</span>}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className={`text-4xl font-bold mb-2 ${readiness.overallReadinessStatus === 'Care Ready' ? 'text-teal-600' : 'text-amber-500'}`}>
                {readiness.readinessScore}%
              </div>
              <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">Overall Readiness</div>
              <div className={`mt-3 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${readiness.overallReadinessStatus === 'Care Ready' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                {readiness.overallReadinessStatus}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
