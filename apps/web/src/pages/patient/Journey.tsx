import { useState } from 'react';
import { CareJourneyVisual } from '../../components/healthcare/CareJourneyVisual';
import { mockCareJourney, mockFacilities, mockCareReadiness } from '../../lib/mockData';
import { AlertTriangle, RefreshCcw, ArrowRight } from 'lucide-react';
import type { CareJourney } from '@swasthyasetu/types';
import { CareReadinessCard } from '../../components/healthcare/CareReadinessCard';

export default function Journey() {
  const [journeyState, setJourneyState] = useState<'normal' | 'blocked' | 'recovered'>('normal');
  const [isSimulating, setIsSimulating] = useState(false);

  // Facility B
  const initialFacility = mockFacilities[1]; 
  
  // Facility D (alternative)
  const alternativeFacility = mockFacilities[3];
  const alternativeReadiness = mockCareReadiness[3];

  const currentJourney: CareJourney = {
    ...mockCareJourney,
    steps: mockCareJourney.steps.map(step => {
      if (journeyState === 'blocked' && step.id === 'diag') {
        return { ...step, status: 'Blocked', description: 'ECG machine is currently out of service.' };
      }
      if (journeyState === 'recovered') {
        if (step.id === 'appt') return { ...step, description: 'Confirmed at City General Hospital.' };
        if (step.id === 'diag') return { ...step, status: 'Pending', description: 'Scheduled at City General Hospital.' };
      }
      return step;
    })
  };

  const simulateDisruption = async () => {
    setIsSimulating(true);
    // 1. Show blocked state
    setJourneyState('blocked');
    await new Promise(r => setTimeout(r, 2000));
    // UI will handle showing the alternative option once blocked.
    setIsSimulating(false);
  };

  const handleSwitch = () => {
    setJourneyState('recovered');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Care Journey</h1>
          <p className="text-slate-500 mt-2">Track your progress and upcoming appointments.</p>
        </div>
        
        {/* DEMO CONTROLS */}
        {journeyState === 'normal' && (
          <button 
            onClick={simulateDisruption}
            disabled={isSimulating}
            className="flex items-center px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Simulate Care Disruption
          </button>
        )}
        {journeyState === 'recovered' && (
          <button 
            onClick={() => setJourneyState('normal')}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Demo
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {journeyState === 'blocked' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-800">Care Journey Blocked</h4>
                <p className="text-sm text-rose-700 mt-1">
                  Your selected facility ({initialFacility.name}) can no longer complete the full care bundle.
                  The ECG machine is currently unavailable.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg">
                  <div className="w-4 h-4 rounded-full border-2 border-rose-200 border-t-rose-600 animate-spin"></div>
                  Finding another care-ready option...
                </div>
              </div>
            </div>
          )}

          <CareJourneyVisual journey={currentJourney} />
        </div>

        <div>
          {journeyState === 'normal' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Facility</div>
              <h3 className="font-bold text-slate-800">{initialFacility.name}</h3>
              <p className="text-sm text-slate-600 mt-1">All services available.</p>
            </div>
          )}

          {journeyState === 'blocked' && (
            <div className="bg-white border-2 border-teal-500 rounded-xl p-5 shadow-md animate-in fade-in slide-in-from-right-4">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded mb-3 uppercase tracking-wider">
                <RefreshCcw className="w-3 h-3" /> Alternative Found
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{alternativeFacility.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{alternativeFacility.distance} km away</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Specialist</span>
                  <span className="text-teal-600 font-bold">Available</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">ECG</span>
                  <span className="text-teal-600 font-bold">Available</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Appointments</span>
                  <span className="text-teal-600 font-bold">Available</span>
                </div>
              </div>

              <div className="mb-6">
                <CareReadinessCard readiness={alternativeReadiness} hideFacilityName />
              </div>

              <button 
                onClick={handleSwitch}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                Switch to {alternativeFacility.name}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {journeyState === 'recovered' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-in fade-in">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Updated Facility</div>
              <h3 className="font-bold text-slate-800">{alternativeFacility.name}</h3>
              <p className="text-sm text-teal-600 font-medium mt-1">Successfully rerouted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
