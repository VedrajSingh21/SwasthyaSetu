import { mockFacilities, mockCareReadiness, mockReferrals } from "../../lib/mockData";
import { AlertCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function FacilityDashboard() {
  const facility = mockFacilities[0]; // District Hospital
  const readiness = mockCareReadiness[0]; // DH readiness
  
  const pendingCount = mockReferrals.filter(r => r.status === "Pending Review").length;
  const acceptedCount = mockReferrals.filter(r => r.status === "Accepted").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{facility.name}</h1>
        <p className="text-slate-500 mt-1">Operational Readiness Dashboard</p>
      </div>

      {/* Top Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Referrals</div>
          <div className="text-4xl font-bold text-amber-500">{pendingCount}</div>
          <Link to="/facility/referrals" className="text-sm text-teal-600 font-medium mt-4 hover:underline">Needs action →</Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Accepted Referrals</div>
          <div className="text-4xl font-bold text-teal-600">{acceptedCount}</div>
          <Link to="/facility/referrals" className="text-sm text-teal-600 font-medium mt-4 hover:underline">View all →</Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Today's Appointments</div>
          <div className="text-4xl font-bold text-slate-900">12</div>
          <div className="text-sm text-slate-600 mt-4 flex items-center gap-1"><Calendar className="w-4 h-4"/> 4 slots remaining</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Unavailable Services</div>
          <div className="text-4xl font-bold text-rose-500">1</div>
          <Link to="/facility/capacity" className="text-sm text-rose-600 font-medium mt-4 hover:underline">ECG Machine Blocked →</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Action Required: Pending Referrals</h2>
              <Link to="/facility/referrals" className="text-sm text-teal-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {mockReferrals.filter(r => r.status === "Pending Review").map(ref => (
                <div key={ref.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded uppercase">Priority: {ref.priority}</span>
                        <span className="text-sm text-slate-500">{ref.id}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg">Cardiology Evaluation</h3>
                      <p className="text-sm text-slate-600 mt-1">From: Kothrud PHC</p>
                    </div>
                    <Link to="/facility/referrals" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                      Review Bundle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Care Readiness Summary</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className={`text-5xl font-bold mb-2 ${readiness.overallReadinessStatus === 'CARE READY' ? 'text-teal-600' : 'text-amber-500'}`}>
                  {readiness.readinessScore}%
                </div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-4">Simulated Score</div>
                <div className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${readiness.overallReadinessStatus === 'CARE READY' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                  {readiness.overallReadinessStatus}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Cardiology Department</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Specialist</span>
                  {readiness.specialistAvailability ? <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">READY</span> : <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">UNAVAILABLE</span>}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">ECG</span>
                  {readiness.diagnosticAvailability ? <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">READY</span> : <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1"><AlertCircle className="w-3 h-3"/> BLOCKED</span>}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Appointments</span>
                  {readiness.appointmentAvailability ? <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">READY</span> : <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">FULL</span>}
                </div>
              </div>
              
              <div className="mt-6">
                <Link to="/facility/capacity" className="block w-full py-2 text-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Manage Capacity (Demo)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
