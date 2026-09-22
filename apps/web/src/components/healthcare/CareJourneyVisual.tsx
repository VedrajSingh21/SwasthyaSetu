import { CheckCircle2, Circle } from "lucide-react";
import type { CareJourney, CareRequirement, CareJourneyEvent } from "@swasthyasetu/types";

interface CareJourneyVisualProps {
  journey: CareJourney;
  className?: string;
}

const STAGE_ORDER = [
  'ASSESSMENT',
  'REFERRAL',
  'APPOINTMENT',
  'ARRIVED',
  'CONSULTATION',
  'DIAGNOSTICS',
  'TREATMENT',
  'FOLLOW_UP'
];

const STAGE_LABELS: Record<string, string> = {
  'ASSESSMENT': 'Assessment',
  'REFERRAL': 'Referral Created',
  'APPOINTMENT': 'Appointment',
  'ARRIVED': 'Arrived at facility',
  'CONSULTATION': 'Consultation',
  'DIAGNOSTICS': 'Tests & Diagnostics',
  'TREATMENT': 'Treatment',
  'FOLLOW_UP': 'Follow-up',
  'CARE_COMPLETED': 'Care Completed'
};

export function CareJourneyVisual({ journey, className = "" }: CareJourneyVisualProps) {
  if (!journey) return null;

  const requirements = journey.requirements || [];
  const events = journey.events || [];
  const hasDiagnostics = requirements.some((r: CareRequirement) => r.type === 'Diagnostic' || (r as any).requirementType === 'Diagnostic');

  const expectedStages = STAGE_ORDER.filter(s => {
    if (s === 'ASSESSMENT' || s === 'APPOINTMENT') return false; // Hide internal/unused stages for patient
    if (s === 'DIAGNOSTICS' && !hasDiagnostics) return false;
    return true;
  });

  const currentIndex = STAGE_ORDER.indexOf(journey.currentStage || 'REFERRAL');

  const steps = expectedStages.map(stage => {
    const stageIndex = STAGE_ORDER.indexOf(stage);
    
    let status = 'Upcoming';
    if (journey.status === 'COMPLETED') {
      status = 'Completed';
    } else if (stageIndex < currentIndex) {
      status = 'Completed';
    } else if (stageIndex === currentIndex) {
      status = 'Active';
    }

    const event = events.find((e: CareJourneyEvent) => e.stage === stage);
    let description: string | null = null;
    if (event) {
      const date = new Date(event.createdAt);
      description = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return {
      id: stage,
      title: STAGE_LABELS[stage],
      status,
      description
    };
  });

  // Always append Care Completed
  steps.push({
    id: 'CARE_COMPLETED',
    title: 'Care Completed',
    status: journey.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
    description: journey.status === 'COMPLETED' ? 'All required care is finished' : null
  });

  const completedReqs = requirements.filter((r: CareRequirement) => r.status === 'COMPLETED' || (r as any).status === 'COMPLETED').length;
  const totalReqs = requirements.length;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-bold text-slate-800 mb-6">Your Care Journey</h3>
      
      {requirements.length > 0 && (
        <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Your Care Plan</h4>
          <div className="space-y-3 mb-4">
            {requirements.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3">
                {req.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <span className={`text-sm font-medium ${req.status === 'COMPLETED' ? 'text-slate-800' : 'text-slate-500'}`}>
                  {req.name}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs font-bold text-teal-700 bg-teal-50 inline-block px-2 py-1 rounded">
            {completedReqs} of {totalReqs} requirements completed
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-3.75 top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
        <div className="space-y-6 relative z-10">
          {steps.map((step) => {
            const isCompleted = step.status === "Completed";
            const isActive = step.status === "Active";
            
            return (
              <div key={step.id} className="flex gap-4">
                <div className="mt-0.5 bg-white relative z-10">
                  {isCompleted && <CheckCircle2 className="w-8 h-8 text-teal-500 fill-teal-50" />}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full border-2 border-teal-500 flex items-center justify-center bg-teal-50">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                    </div>
                  )}
                  {!isCompleted && !isActive && <Circle className="w-8 h-8 text-slate-300" />}
                </div>
                <div className="pt-1">
                  <h4 className={`text-base font-semibold ${isActive ? 'text-teal-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className={`text-sm mt-1 ${isActive ? 'text-teal-600' : 'text-slate-500'}`}>
                      {step.description}
                    </p>
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
