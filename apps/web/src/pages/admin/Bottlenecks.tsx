import { useState } from "react";
import { mockDistrictBottlenecks } from "../../lib/mockData";
import { AlertTriangle, ArrowRight, Activity, Zap, CheckCircle2, XCircle } from "lucide-react";

export default function AdminBottlenecks() {
  const [simulateEcgBottleneck, setSimulateEcgBottleneck] = useState(false);
  const [selectedBottleneckId, setSelectedBottleneckId] = useState<string | null>(null);

  // Dynamic intelligence logic for demo
  const bottlenecks = mockDistrictBottlenecks.map(b => {
    if (b.id === "db2" && !simulateEcgBottleneck) {
      return null; // Hide ECG bottleneck if we aren't simulating it yet
    }
    return b;
  }).filter(Boolean);

  const selectedBottleneck = bottlenecks.find(b => b?.id === selectedBottleneckId);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">District Bottleneck Intelligence</h1>
          <p className="text-slate-500 mt-1">Identify, explain, and act on care network blockers.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg flex items-center gap-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-wider">DEMO SIMULATION</div>
            <div className="text-xs text-indigo-600 mt-0.5">Toggle local state to observe intelligence engine</div>
          </div>
          <button
            onClick={() => setSimulateEcgBottleneck(!simulateEcgBottleneck)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${simulateEcgBottleneck ? 'bg-rose-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${simulateEcgBottleneck ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-semibold text-slate-700 w-48">
            {simulateEcgBottleneck ? "ECG Bottleneck Active" : "Simulate ECG Bottleneck"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Detected Bottlenecks</h2>
          {bottlenecks.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <div className="font-semibold text-slate-700">Network Optimal</div>
              <div className="text-sm mt-1">No active bottlenecks detected.</div>
            </div>
          ) : (
            bottlenecks.map(b => b && (
              <button
                key={b.id}
                onClick={() => setSelectedBottleneckId(b.id)}
                className={`w-full text-left bg-white rounded-xl border p-5 transition-all
                  ${selectedBottleneckId === b.id 
                    ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                    : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${b.currentState === 'BLOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    {b.currentState}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Impact: {b.impact}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{b.issue}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{b.primaryBottleneck}</p>
                <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
                  <span>{b.impactedReferrals} referrals {b.currentState.toLowerCase()}</span>
                  <span className="font-medium text-indigo-600 flex items-center">Analyze <ArrowRight className="w-3 h-3 ml-1"/></span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Detail Panel */}
        <div className="lg:col-span-2">
          {!selectedBottleneck ? (
            <div className="h-full min-h-100 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400">
              <Activity className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium">Select a bottleneck to view intelligence report</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-8 py-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md tracking-wider ${selectedBottleneck.currentState === 'BLOCKED' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    {selectedBottleneck.currentState}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">Intelligence Report</span>
                </div>
                <h2 className="text-2xl font-bold">{selectedBottleneck.issue}</h2>
              </div>

              <div className="p-8 space-y-12">
                {/* DETECT, EXPLAIN, ACT Flow */}
                <div className="relative border-l-2 border-indigo-100 ml-4 space-y-10 pb-4">
                  
                  {/* DETECT */}
                  <div className="relative pl-8">
                    <div className="absolute -left-2.75 top-1 bg-white p-1 rounded-full border-2 border-indigo-600">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    </div>
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">1. Detect</h3>
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">What is blocked?</div>
                          <div className="font-semibold text-slate-900">{selectedBottleneck.affectedServices.join(', ')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Impact</div>
                          <div className="font-semibold text-rose-600">{selectedBottleneck.impactedReferrals} referrals</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Where?</div>
                          <div className="font-semibold text-slate-900">{selectedBottleneck.affectedFacilities.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXPLAIN */}
                  <div className="relative pl-8">
                    <div className="absolute -left-2.75 top-1 bg-white p-1 rounded-full border-2 border-indigo-600">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    </div>
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">2. Explain</h3>
                    <div className="bg-rose-50/50 rounded-lg p-5 border border-rose-100">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-rose-600/80 uppercase tracking-wider font-bold mb-1">Root Reason</div>
                          <div className="text-lg font-bold text-rose-900">{selectedBottleneck.primaryBottleneck}</div>
                          <p className="text-sm text-rose-800 mt-2">
                            The targeted facilities currently lack the necessary capacity to fulfill the required Care Bundles for incoming referrals, causing them to stall in the 'Pending' state.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACT */}
                  <div className="relative pl-8">
                    <div className="absolute -left-2.75 top-1 bg-white p-1 rounded-full border-2 border-indigo-600">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    </div>
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">3. Act</h3>
                    <div className="bg-indigo-600 rounded-lg p-5 text-white shadow-md">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-indigo-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-indigo-200 uppercase tracking-wider font-bold mb-1">Recommended System Action</div>
                          <div className="text-lg font-bold">{selectedBottleneck.recommendedAction}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Routing Impact */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Care Routing Impact</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-3">Before Action</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <span className="font-medium text-slate-800">Patient</span> <ArrowRight className="w-3 h-3" /> Facility B
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <XCircle className="w-4 h-4 text-rose-500" /> {selectedBottleneck.primaryBottleneck}
                      </div>
                      <div className="text-sm font-bold text-rose-600">→ Referral Blocked</div>
                    </div>

                    <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                      <div className="text-xs font-bold text-indigo-400 uppercase mb-3">After Dynamic Routing</div>
                      <div className="flex items-center gap-2 text-sm text-indigo-900 mb-2">
                        <span className="font-medium">Patient</span> <ArrowRight className="w-3 h-3 text-indigo-400" /> Facility D
                      </div>
                      <div className="flex items-center gap-2 text-sm text-indigo-900 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-500" /> Capacity Available
                      </div>
                      <div className="text-sm font-bold text-teal-600">→ CARE READY</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
