import { MapPin, Navigation, Clock } from "lucide-react";
import type { Facility, CareReadiness } from "@swasthyasetu/types";

interface PatientBurdenCardProps {
  facility: Facility;
  readiness: CareReadiness;
  className?: string;
}

export function PatientBurdenCard({ facility, readiness, className = "" }: PatientBurdenCardProps) {
  // A simplistic burden calculation for demo purposes
  const isHighBurden = facility.distance > 20 || readiness.estimatedWaitTime > 60;
  const burdenText = isHighBurden ? "High" : "Low";
  
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
      <div className={`px-5 py-3 border-b ${isHighBurden ? 'bg-amber-50 border-amber-100' : 'bg-teal-50 border-teal-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Navigation className={`w-4 h-4 ${isHighBurden ? 'text-amber-600' : 'text-teal-600'}`} />
          <span className={`text-sm font-semibold uppercase tracking-wider ${isHighBurden ? 'text-amber-800' : 'text-teal-800'}`}>
            Patient Burden
          </span>
        </div>
        <span className={`font-bold ${isHighBurden ? 'text-amber-700' : 'text-teal-700'}`}>
          {burdenText}
        </span>
      </div>
      
      <div className="p-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">Travel</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <MapPin className="w-4 h-4 text-slate-400" />
            {facility.distance} km
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">Est. Wait</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Clock className="w-4 h-4 text-slate-400" />
            {readiness.estimatedWaitTime} min
          </div>
        </div>
        <div className="col-span-2 pt-3 border-t border-slate-100 mt-1 text-sm text-slate-600">
          Selected facility: <span className="font-semibold text-slate-800">{facility.name}</span>
        </div>
      </div>
    </div>
  );
}
