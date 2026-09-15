import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import type { CareJourney } from "@swasthyasetu/types";

interface CareJourneyVisualProps {
  journey: CareJourney;
  className?: string;
}

export function CareJourneyVisual({ journey, className = "" }: CareJourneyVisualProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-bold text-slate-800 mb-6">Your Care Journey</h3>
      <div className="relative">
        <div className="absolute left-3.75 top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
        <div className="space-y-6 relative z-10">
          {journey.steps.map((step) => {
            const isCompleted = step.status === "Completed";
            const isActive = step.status === "Active";
            const isBlocked = step.status === "Blocked";
            
            return (
              <div key={step.id} className="flex gap-4">
                <div className="mt-0.5 bg-white">
                  {isCompleted && <CheckCircle2 className="w-8 h-8 text-teal-500 fill-teal-50" />}
                  {isActive && <div className="w-8 h-8 rounded-full border-2 border-teal-500 flex items-center justify-center bg-teal-50"><div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div></div>}
                  {isBlocked && <AlertCircle className="w-8 h-8 text-rose-500 fill-rose-50" />}
                  {!isCompleted && !isActive && !isBlocked && <Circle className="w-8 h-8 text-slate-300" />}
                </div>
                <div>
                  <h4 className={`text-base font-semibold ${isActive ? 'text-teal-700' : isCompleted ? 'text-slate-700' : isBlocked ? 'text-rose-700' : 'text-slate-400'}`}>
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className={`text-sm mt-1 ${isActive ? 'text-teal-600' : isBlocked ? 'text-rose-600' : 'text-slate-500'}`}>
                      {step.description}
                    </p>
                  )}
                  {isBlocked && (
                    <div className="mt-2 text-sm text-amber-600 flex items-center gap-1 font-medium bg-amber-50 px-3 py-1.5 rounded-md">
                      <Clock className="w-4 h-4" /> Finding an alternative...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
