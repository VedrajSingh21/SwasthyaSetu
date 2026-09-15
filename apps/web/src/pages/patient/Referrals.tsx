import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockFacilities, mockCareBundles, mockPatients } from '../../lib/mockData';
import { MapPin, Navigation, User, Stethoscope, CheckCircle2 } from 'lucide-react';

export default function Referrals() {
  const location = useLocation();
  const navigate = useNavigate();
  const facilityId = location.state?.facilityId || 'f1'; // fallback to District Hospital
  
  const facility = mockFacilities.find(f => f.id === facilityId)!;
  const bundle = mockCareBundles[0];
  const patient = mockPatients[0];

  const [status, setStatus] = useState<'pending' | 'created' | 'accepted'>('pending');

  const handleConfirm = async () => {
    setStatus('created');
    // Simulate transition
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStatus('accepted');
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate('/patient/journey');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Confirm Referral</h1>
        <p className="text-slate-500 mt-2">Review details before sending to the facility.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'pending' ? (
          <motion.div 
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="font-bold text-slate-800">Referral Details</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Patient</div>
                    <div className="font-semibold text-slate-900">{patient.name} ({patient.id})</div>
                    <div className="text-sm text-slate-600">{patient.age} yrs • {patient.gender} • {patient.district}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Care Requirement</div>
                    <div className="font-semibold text-slate-900">{bundle.title}</div>
                    <div className="text-sm text-slate-600">Priority: <span className="font-semibold text-rose-600">{bundle.priority}</span></div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Destination Facility</div>
                    <div className="font-semibold text-slate-900">{facility.name}</div>
                    <div className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      <Navigation className="w-3 h-3" /> {facility.distance} km away
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/patient/facilities')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Change Facility
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors"
              >
                Confirm Referral
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              {status === 'created' ? (
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-teal-500 animate-spin"></div>
              ) : (
                <CheckCircle2 className="w-16 h-16 text-teal-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {status === 'created' ? 'Sending Referral...' : 'Referral Accepted!'}
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              {status === 'created' 
                ? `Please wait while we confirm availability with ${facility.name}.` 
                : `Your referral to ${facility.name} has been processed. Setting up your care journey.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
