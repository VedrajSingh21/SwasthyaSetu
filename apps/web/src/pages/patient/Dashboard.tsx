import { useState, useEffect } from 'react';
import { CareBundleCard } from "../../components/healthcare/CareBundleCard";
import { CareJourneyVisual } from "../../components/healthcare/CareJourneyVisual";
import { PatientBurdenCard } from "../../components/healthcare/PatientBurdenCard";
import { AlertCircle, Loader2 } from "lucide-react";
import { getPatient, getPatientCareBundles, getPatientJourneys, getPatientReferrals } from '../../lib/api/patient';
import { config } from '../../lib/api';
import type { Patient, CareBundle, CareJourney, Referral } from '@swasthyasetu/types';
import { mockFacilities, mockCareReadiness } from '../../lib/mockData';

export default function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [bundle, setBundle] = useState<CareBundle | null>(null);
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!config.demoPatientId) {
        setError("VITE_DEMO_PATIENT_ID is not configured in the environment.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [patientData, bundlesData, journeysData, referralsData] = await Promise.all([
          getPatient(config.demoPatientId),
          getPatientCareBundles(config.demoPatientId),
          getPatientJourneys(config.demoPatientId),
          getPatientReferrals(config.demoPatientId)
        ]);

        setPatient(patientData);
        setBundle(bundlesData.length > 0 ? bundlesData[0] : null);
        setJourney(journeysData.length > 0 ? journeysData[0] : null);
        setReferrals(referralsData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-red-600 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto mt-8 text-center p-8 border rounded-lg bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-700">Patient record not found</h2>
      </div>
    );
  }

  // Still using mock data for facilities/readiness as instructed (Facility Workflow is later)
  const recommendedReadiness = mockCareReadiness[1];
  const recommendedFacility = mockFacilities.find(f => f.id === recommendedReadiness.facilityId)!;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Hello, {patient.name}</h1>
        <p className="text-slate-500 mt-2">Here is the status of your current care journey.</p>
      </div>
      
      {/* Alerts - Only show if there's an active referral for demo */}
      {referrals.length > 0 && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800">Next Action Required</h4>
            <p className="text-sm text-amber-700 mt-1">
              Your referral has been processed. Please review your status.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {journey ? (
            <CareJourneyVisual journey={journey} />
          ) : (
            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500">
              No active care journey found.
            </div>
          )}
          
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Your Care Requirement</h3>
            {bundle ? (
              <CareBundleCard bundle={bundle} />
            ) : (
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500">
                No care bundle generated yet. Please complete an assessment.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Selected Facility</h3>
            {/* The Facility component still uses mock facilities for now since facility endpoints are Task 6 */}
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
