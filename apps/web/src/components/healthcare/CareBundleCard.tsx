import type { CareBundle, CareRequirement } from "@swasthyasetu/types";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CareBundleCardProps {
  bundle: CareBundle;
  className?: string;
}

export function CareBundleCard({ bundle, className = "" }: CareBundleCardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Care Bundle</div>
          <h3 className="text-lg font-bold text-slate-800">{bundle.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {bundle.priority === "High" && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              High Priority
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Required Services</h4>
        <ul className="space-y-3">
          {bundle.requirements.map((req: CareRequirement) => (
            <li key={req.id} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-800">{req.name}</div>
                <div className="text-xs text-slate-500">{req.type} &bull; {req.specialty}</div>
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-800">Follow-up</div>
              <div className="text-xs text-slate-500">Post-evaluation</div>
            </div>
          </li>
        </ul>
        
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Estimated visits: <span className="font-semibold text-slate-800">{bundle.estimatedVisits || 1}</span>
          </div>
          <Link 
            to="/patient/facilities" 
            state={{ bundleId: bundle.id }} 
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center"
          >
            Find Facilities &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
