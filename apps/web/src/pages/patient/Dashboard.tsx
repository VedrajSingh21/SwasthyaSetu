import { 
  mockPatients, 
  mockCareBundles, 
  mockCareJourney,
  mockFacilities,
  mockCareReadiness
} from "../../lib/mockData";
import { CareBundleCard } from "../../components/healthcare/CareBundleCard";
import { CareJourneyVisual } from "../../components/healthcare/CareJourneyVisual";
import { PatientBurdenCard } from "../../components/healthcare/PatientBurdenCard";
import { AlertCircle } from "lucide-react";

export default function PatientDashboard() {
  const patient = mockPatients[0];
  const bundle = mockCareBundles[0];
  const journey = mockCareJourney;
  
  // Using the facility that is not fully ready to show the journey's "blocked" or "active" state
  const recommendedReadiness = mockCareReadiness[1];
  const recommendedFacility = mockFacilities.find(f => f.id === recommendedReadiness.facilityId)!;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Hello, {patient.name}</h1>
        <p className="text-slate-500 mt-2">Here is the status of your current care journey.</p>
      </div>
      
      {/* Alerts */}
      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800">Next Action Required</h4>
          <p className="text-sm text-amber-700 mt-1">
            Your referral to {recommendedFacility.name} has been processed. Please book your appointment.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CareJourneyVisual journey={journey} />
          
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Your Care Requirement</h3>
            <CareBundleCard bundle={bundle} />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Selected Facility</h3>
            <PatientBurdenCard facility={recommendedFacility} readiness={recommendedReadiness} />
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-3">Support</h4>
            <p className="text-sm text-slate-600 mb-4">
              Need help with your referral? Contact your ASHA worker or the PHC directly.
            </p>
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
