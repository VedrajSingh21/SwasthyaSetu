import { useState } from 'react';
import { Calendar, MapPin, AlertCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import { mockFacilities } from '../../lib/mockData';

export default function FollowUp() {
  const [status, setStatus] = useState<'upcoming' | 'missed' | 'recovered'>('upcoming');
  
  // High burden facility (District Hospital)
  const initialFacility = mockFacilities[0];
  
  // Lower burden facility (PHC)
  const recoveredFacility = mockFacilities[4]; 

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Follow-up Care</h1>
          <p className="text-slate-500 mt-2">Manage your post-treatment appointments.</p>
        </div>

        {/* DEMO CONTROLS */}
        {status === 'upcoming' && (
          <button 
            onClick={() => setStatus('missed')}
            className="self-start sm:self-auto flex items-center px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm font-bold transition-colors"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Simulate Missed Visit
          </button>
        )}
        {status === 'recovered' && (
          <button 
            onClick={() => setStatus('upcoming')}
            className="self-start sm:self-auto flex items-center px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Demo
          </button>
        )}
      </div>

      <div className="space-y-6">
        {status === 'missed' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Follow-up Missed</h3>
                <p className="text-amber-700 mt-1">
                  You did not complete your scheduled cardiology review at {initialFacility.name}.
                </p>
                <div className="mt-4 p-4 bg-white rounded-lg border border-amber-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">System Action: Finding Lower-Burden Option</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    We noticed {initialFacility.name} is {initialFacility.distance} km away. We have found a closer facility capable of performing this specific follow-up check.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <div className="font-bold text-slate-900">{recoveredFacility.name}</div>
                      <div className="text-sm text-slate-500">Only {recoveredFacility.distance} km away</div>
                    </div>
                    <button 
                      onClick={() => setStatus('recovered')}
                      className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      Reschedule Here
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-2xl shadow-sm border ${status === 'missed' ? 'border-rose-200 opacity-50 grayscale' : 'border-slate-200'} overflow-hidden transition-all duration-500`}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${status === 'missed' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
            <h2 className="font-bold text-slate-800">Cardiology Review</h2>
            {status === 'upcoming' && <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">Upcoming</span>}
            {status === 'missed' && <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wider">Missed</span>}
            {status === 'recovered' && <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider">Rescheduled</span>}
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Date & Time</div>
                <div className="font-semibold text-slate-900">
                  {status === 'recovered' ? 'Oct 28, 2026' : 'Oct 24, 2026'}
                </div>
                <div className="text-sm text-slate-600">10:00 AM</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Location</div>
                <div className="font-semibold text-slate-900">
                  {status === 'recovered' ? recoveredFacility.name : initialFacility.name}
                </div>
                <div className="text-sm text-slate-600">
                  {status === 'recovered' ? `${recoveredFacility.distance} km away` : `${initialFacility.distance} km away`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2">Why this follow-up matters</h3>
          <p className="text-sm text-slate-600">
            A cardiology review ensures your treatment is working correctly and allows the doctor to adjust any medication. Skipping this can lead to complications. SwasthyaSetu tracks this to ensure your care journey is fully completed.
          </p>
        </div>
      </div>
    </div>
  );
}
