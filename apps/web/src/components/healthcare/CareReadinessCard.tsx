import type { CareReadiness, Facility } from "@swasthyasetu/types";
import { Check, X, MapPin, Clock } from "lucide-react";

interface CareReadinessCardProps {
  facility?: Facility; // Made optional if we hide the name and don't need distance/wait
  readiness: CareReadiness;
  className?: string;
  isRecommended?: boolean;
  hideFacilityName?: boolean;
}

export function CareReadinessCard({ facility, readiness, className = "", isRecommended = false, hideFacilityName = false }: CareReadinessCardProps) {
  const isReady = readiness.overallReadinessStatus === "CARE READY";
  
  return (
    <div className={`relative bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${isRecommended ? 'border-teal-500 shadow-teal-100 shadow-md ring-1 ring-teal-500' : 'border-slate-200'} ${className}`}>
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          Recommended
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            {!hideFacilityName && facility && (
              <>
                <h3 className="text-lg font-bold text-slate-800">{facility.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {facility.distance} km</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{readiness.estimatedWaitTime} min</span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-2xl font-bold ${isReady ? 'text-teal-600' : 'text-amber-500'}`}>
              {readiness.readinessScore}%
            </div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Readiness</div>
          </div>
        </div>

        <div className="space-y-2 mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Cardiologist</span>
            {readiness.specialistAvailability ? 
              <span className="flex items-center gap-1 text-teal-700 font-medium"><Check className="w-4 h-4" /> Available</span> : 
              <span className="flex items-center gap-1 text-slate-400"><X className="w-4 h-4" /> Unavailable</span>
            }
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">ECG</span>
            {readiness.diagnosticAvailability ? 
              <span className="flex items-center gap-1 text-teal-700 font-medium"><Check className="w-4 h-4" /> Available</span> : 
              <span className="flex items-center gap-1 text-slate-400"><X className="w-4 h-4" /> Unavailable</span>
            }
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Appointment</span>
            {readiness.appointmentAvailability ? 
              <span className="flex items-center gap-1 text-teal-700 font-medium"><Check className="w-4 h-4" /> Available</span> : 
              <span className="flex items-center gap-1 text-slate-400"><X className="w-4 h-4" /> Unavailable</span>
            }
          </div>
        </div>
        
        <div className={`mt-5 p-3 rounded-lg flex items-center justify-center font-medium text-sm ${isReady ? 'bg-teal-50 text-teal-800' : 'bg-slate-50 text-slate-700'}`}>
          {readiness.overallReadinessStatus}
        </div>
      </div>
    </div>
  );
}
