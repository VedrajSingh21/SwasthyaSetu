import { mockDistrictBottlenecks } from "../../lib/mockData";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
  const bottlenecks = mockDistrictBottlenecks;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pune District</h1>
        <p className="text-slate-500 mt-1">District Care Bottleneck Intelligence</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Total Referrals</div>
          <div className="text-2xl font-bold text-slate-900">1,248</div>
          <div className="text-xs text-teal-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> 12% vs last month</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Care Ready Route</div>
          <div className="text-2xl font-bold text-slate-900">76%</div>
          <div className="text-xs text-slate-500 mt-1">Of all accepted referrals</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Avg Patient Burden</div>
          <div className="text-2xl font-bold text-slate-900">1.4 <span className="text-sm font-normal text-slate-500">trips</span></div>
          <div className="text-xs text-teal-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1 rotate-180" /> Improved</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-200 bg-rose-50/30">
          <div className="text-rose-600 text-sm font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Active Bottlenecks</div>
          <div className="text-2xl font-bold text-rose-700">{bottlenecks.length}</div>
          <div className="text-xs text-rose-600 mt-1">Require intervention</div>
        </div>
      </div>

      {/* Bottlenecks Intelligence */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Detected Care Bottlenecks
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Analyzed</span>
        </div>
        <div className="divide-y divide-slate-100">
          {bottlenecks.map(b => (
            <div key={b.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-md">Delayed Care</span>
                    <h3 className="text-lg font-bold text-slate-900">{b.issue}</h3>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-500">Affected Volume</span>
                      <span className="font-semibold text-slate-800">{b.affectedPercentage}% of referrals</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500">Primary Root Cause</span>
                      <span className="font-semibold text-slate-800">{b.primaryBottleneck}</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-72 shrink-0 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2">Recommended Action</div>
                  <p className="text-sm text-indigo-900 font-medium">
                    {b.recommendedAction}
                  </p>
                  <button className="mt-4 w-full bg-white border border-indigo-200 text-indigo-700 font-semibold py-2 rounded-md text-sm hover:bg-indigo-50 transition-colors">
                    Draft Directive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
