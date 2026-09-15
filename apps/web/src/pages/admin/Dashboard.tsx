import { mockDistrictBottlenecks } from "../../lib/mockData";
import { AlertTriangle, Activity, Building2, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const bottlenecks = mockDistrictBottlenecks;

  const facilityNetwork = [
    { name: "District Hospital Pune", type: "DH", status: "CARE READY", bottlenecks: 0, pending: 4 },
    { name: "Rural Hospital B", type: "CHC", status: "BLOCKED", bottlenecks: 2, pending: 14, blockedService: "ECG unavailable" },
    { name: "Kothrud PHC", type: "PHC", status: "AT RISK", bottlenecks: 1, pending: 8, blockedService: "Cardiology capacity low" },
    { name: "Facility D", type: "Specialty", status: "CARE READY", bottlenecks: 0, pending: 2 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pune District</h1>
          <p className="text-slate-500 mt-1">District Care Bottleneck Intelligence</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
          DEMO SIMULATION
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Active Referrals</div>
          <div className="text-2xl font-bold text-slate-900">248</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Completed Journeys</div>
          <div className="text-2xl font-bold text-slate-900">1,024</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Delayed Referrals</div>
          <div className="text-2xl font-bold text-amber-600">38</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-200 bg-rose-50/30">
          <div className="text-rose-600 text-sm font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Blocked Requirements</div>
          <div className="text-2xl font-bold text-rose-700">14</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Missed Follow-ups</div>
          <div className="text-2xl font-bold text-slate-900">12</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Bottlenecks Intelligence */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Active Care Bottlenecks
              </h2>
              <Link to="/admin/bottlenecks" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View Detailed Analysis &rarr;</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {bottlenecks.map(b => (
                <div key={b.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${b.currentState === 'BLOCKED' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${b.currentState === 'BLOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        {b.currentState}
                      </span>
                      <h3 className="font-bold text-slate-900">{b.issue}</h3>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      <span className="font-medium text-slate-800">{b.primaryBottleneck}</span> affects <span className="font-medium text-slate-800">{b.affectedPercentage}%</span> of referrals.
                    </div>
                    <div className="text-xs text-slate-500">
                      Affected Facilities: {b.affectedFacilities.join(', ')}
                    </div>
                  </div>
                  <Link to="/admin/bottlenecks" className="shrink-0 bg-white border border-slate-200 text-slate-700 font-medium py-1.5 px-3 rounded-md text-sm hover:bg-slate-50 transition-colors">
                    Investigate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facility Network View */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Facility Network Status
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {facilityNetwork.map((f, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-xs text-slate-500">{f.type} &bull; {f.pending} pending referrals</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1
                      ${f.status === 'CARE READY' ? 'bg-teal-50 text-teal-700' : 
                        f.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}
                    >
                      {f.status === 'CARE READY' && <CheckCircle2 className="w-3 h-3" />}
                      {f.status === 'BLOCKED' && <XCircle className="w-3 h-3" />}
                      {f.status === 'AT RISK' && <AlertTriangle className="w-3 h-3" />}
                      {f.status}
                    </div>
                  </div>
                  {f.blockedService && (
                    <div className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded inline-block mt-1">
                      {f.blockedService}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
