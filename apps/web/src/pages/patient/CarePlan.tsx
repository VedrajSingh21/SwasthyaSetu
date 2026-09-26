import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { mockCareBundles } from '../../lib/mockData';
import { CareBundleCard } from '../../components/healthcare/CareBundleCard';

export default function CarePlan() {
  const bundle = mockCareBundles[0]; // Cardiology bundle

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Care Requirement</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Based on your assessment, we have identified the following services you need. 
          We use this care requirement to find facilities where all these services are available together.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-8">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 text-sm">Demo Data Indicator</h4>
          <p className="text-xs text-amber-700 mt-1">
            This care bundle is simulated for demonstration purposes. SwasthyaSetu does not provide medical diagnosis.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <CareBundleCard bundle={bundle} className="shadow-md border-slate-200" />
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to find a facility?</h3>
        <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
          We will now search our network for hospitals that can provide all required services and minimize your waiting time.
        </p>
        <Link 
          to="/patient/facilities" 
          state={{ bundleId: bundle.id }}
          className="inline-flex items-center px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors w-full sm:w-auto justify-center"
        >
          Find Care-Ready Facilities
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
