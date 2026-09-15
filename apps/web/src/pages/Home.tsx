import { Link } from "react-router-dom"
import { ArrowRight, ArrowDown } from "lucide-react"
import { CareBundleCard } from "../components/healthcare/CareBundleCard"
import { CareReadinessCard } from "../components/healthcare/CareReadinessCard"
import { mockCareBundles, mockCareReadiness, mockFacilities } from "../lib/mockData"

export default function Home() {
  const cardiologyBundle = mockCareBundles[0];
  const notReadyReadiness = mockCareReadiness[0];
  const notReadyFacility = mockFacilities.find(f => f.id === notReadyReadiness.facilityId)!;
  const readyReadiness = mockCareReadiness[1];
  const readyFacility = mockFacilities.find(f => f.id === readyReadiness.facilityId)!;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          Don't just refer the patient. <br className="hidden md:block" />
          <span className="text-teal-600">Make sure the care is ready.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          SwasthyaSetu connects the patient's care journey across public healthcare facilities—checking care availability, reducing unnecessary travel, adapting referrals, and following through until care is completed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-full font-semibold text-lg hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2">
            Start as Patient <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-300 rounded-full font-semibold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center">
            Healthcare Worker
          </Link>
        </div>
      </section>

      {/* The USP / Journey Explanation Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Care Orchestration Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Instead of generic referrals, we identify exactly what the patient needs and find the facility that is truly ready to provide it.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            
            {/* Step 1: Patient Needs */}
            <div className="flex-1 w-full max-w-md shrink-0">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mb-3">1</div>
                <h3 className="text-xl font-bold text-slate-800">Identify Care Requirement</h3>
              </div>
              <CareBundleCard bundle={cardiologyBundle} className="shadow-md" />
            </div>

            <div className="hidden lg:flex text-slate-300">
              <ArrowRight className="w-12 h-12" />
            </div>
            <div className="lg:hidden text-slate-300 py-4">
              <ArrowDown className="w-10 h-10" />
            </div>

            {/* Step 2: Care Readiness */}
            <div className="flex-1 w-full max-w-2xl shrink-0">
               <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mb-3">2</div>
                <h3 className="text-xl font-bold text-slate-800">Check Care Readiness</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 relative">
                {/* Visual Connector line between the two cards */}
                <div className="hidden sm:block absolute top-1/2 left-1/2 w-8 border-t-2 border-dashed border-slate-300 -translate-y-1/2 -translate-x-1/2 z-0"></div>
                
                <CareReadinessCard 
                  facility={notReadyFacility} 
                  readiness={notReadyReadiness} 
                  className="z-10 opacity-70 scale-95" 
                />
                
                <CareReadinessCard 
                  facility={readyFacility} 
                  readiness={readyReadiness} 
                  isRecommended={true} 
                  className="z-10 shadow-xl" 
                />
              </div>
            </div>

          </div>

          <div className="mt-20 flex flex-wrap justify-center items-center gap-3 text-sm font-semibold text-slate-500 uppercase tracking-widest">
            <span>Find</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span>Assess</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className="text-teal-600">Care Requirement</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className="text-teal-600">Care Readiness</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span>Route</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span>Treat</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span>Follow-up</span>
          </div>
        </div>
      </section>
    </div>
  )
}
