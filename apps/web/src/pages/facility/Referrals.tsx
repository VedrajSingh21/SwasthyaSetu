import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockReferrals, mockPatients, mockCareBundles, mockFacilities, mockCareReadiness } from '../../lib/mockData';
import { AlertCircle, Check, Calendar, Clock, MapPin, Stethoscope } from 'lucide-react';

export default function FacilityReferrals() {
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [referralStatus, setReferralStatus] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showAlternative, setShowAlternative] = useState(false);
  
  // Care completion state
  const [completedServices, setCompletedServices] = useState<Record<string, string[]>>({});

  const pendingReferrals = mockReferrals.filter(r => 
    r.status === "Pending Review" || referralStatus[r.id]
  );

  const handleSelect = (id: string) => {
    if (selectedReferralId === id) return;
    setSelectedReferralId(id);
    setShowAlternative(false);
    setRejectReason('');
  };

  const selectedRef = pendingReferrals.find(r => r.id === selectedReferralId);
  const patient = selectedRef ? mockPatients.find(p => p.id === selectedRef.patientId) : null;
  const bundle = selectedRef ? mockCareBundles.find(b => b.id === selectedRef.careBundleId) : null;
  const currentStatus = selectedRef ? (referralStatus[selectedRef.id] || selectedRef.status) : null;
  const readiness = mockCareReadiness[0]; // Current facility readiness

  const alternativeFacility = mockFacilities[2]; // Specialty hospital
  const alternativeReadiness = mockCareReadiness[1]; // Specialty hospital readiness

  const currentCompleted = selectedRef ? (completedServices[selectedRef.id] || []) : [];

  const handleAccept = () => {
    if (selectedRef) setReferralStatus({ ...referralStatus, [selectedRef.id]: 'Accepted' });
  };

  const handleSchedule = () => {
    if (selectedRef) setReferralStatus({ ...referralStatus, [selectedRef.id]: 'Appointment Confirmed' });
  };

  const handleReject = () => {
    if (!rejectReason) return;
    setShowAlternative(true);
  };

  const handleRedirect = () => {
    if (selectedRef) setReferralStatus({ ...referralStatus, [selectedRef.id]: 'REROUTED — ALTERNATIVE FOUND' });
  };

  const handleToggleService = (reqId: string) => {
    if (!selectedRef) return;
    const current = completedServices[selectedRef.id] || [];
    const updated = current.includes(reqId) 
      ? current.filter(id => id !== reqId)
      : [...current, reqId];
    
    setCompletedServices({ ...completedServices, [selectedRef.id]: updated });
    
    if (bundle && updated.length === bundle.requirements.length) {
      setReferralStatus({ ...referralStatus, [selectedRef.id]: 'CARE COMPLETED' });
    } else {
      setReferralStatus({ ...referralStatus, [selectedRef.id]: 'In Care' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* List Column */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800">Incoming Referrals</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {pendingReferrals.map(ref => {
            const p = mockPatients.find(p => p.id === ref.patientId);
            const b = mockCareBundles.find(b => b.id === ref.careBundleId);
            const status = referralStatus[ref.id] || ref.status;
            const isSelected = selectedReferralId === ref.id;
            
            let statusColor = "bg-slate-100 text-slate-700";
            if (status === "Accepted" || status === "Appointment Confirmed" || status === "In Care") statusColor = "bg-teal-100 text-teal-800";
            if (status === "CARE COMPLETED") statusColor = "bg-emerald-100 text-emerald-800";
            if (status === "REROUTED — ALTERNATIVE FOUND") statusColor = "bg-blue-100 text-blue-800";
            
            return (
              <div 
                key={ref.id} 
                onClick={() => handleSelect(ref.id)}
                className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">{ref.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase rounded-full ${statusColor}`}>
                    {status}
                  </span>
                </div>
                <div className="font-bold text-slate-900">{p?.name}</div>
                <div className="text-sm text-slate-600 truncate">{b?.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Column */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {selectedRef && patient && bundle ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-slate-500 mb-1">REFERRAL {selectedRef.id}</div>
                  <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                  <div className="text-sm text-slate-600 mt-1">{patient.age} yrs • {patient.gender} • From Kothrud PHC</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Status</div>
                  <div className="font-bold text-slate-900">{currentStatus}</div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              
              {/* Review Phase */}
              {(currentStatus === "Pending Review" || (showAlternative && currentStatus !== "REROUTED — ALTERNATIVE FOUND")) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm border-b pb-2">Care Requirement vs Readiness</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="text-sm font-semibold text-slate-500 mb-3">{bundle.title}</div>
                        <ul className="space-y-2">
                          {bundle.requirements.map(req => (
                            <li key={req.id} className="flex items-center gap-2 text-sm text-slate-700">
                              <Check className="w-4 h-4 text-slate-400" /> {req.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-500 mb-3">Facility Availability</div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between items-center">
                            <span className="text-slate-700">Cardiologist</span>
                            {readiness.specialistAvailability ? <span className="text-teal-600 font-medium">Available</span> : <span className="text-rose-500 font-medium">Unavailable</span>}
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-slate-700">ECG</span>
                            {readiness.diagnosticAvailability ? <span className="text-teal-600 font-medium">Available</span> : <span className="text-rose-500 font-medium">Unavailable</span>}
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-slate-700">Blood Test</span>
                            <span className="text-teal-600 font-medium">Available</span>
                          </li>
                        </ul>
                        
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                          <div className="text-rose-800 font-bold text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> CARE BUNDLE: NOT FULLY READY
                          </div>
                          <div className="text-rose-600 text-xs mt-1">ECG diagnostic currently unavailable</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!showAlternative ? (
                    <div className="flex gap-4 pt-4">
                      <button onClick={handleAccept} className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg shadow-sm hover:bg-teal-700 transition-colors">
                        Accept Referral
                      </button>
                      <div className="flex items-center gap-2">
                        <select 
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        >
                          <option value="">Select reason to reject...</option>
                          <option value="diagnostic">Diagnostic unavailable (ECG)</option>
                          <option value="specialist">Specialist unavailable</option>
                          <option value="capacity">No appointment capacity</option>
                        </select>
                        <button 
                          onClick={handleReject} 
                          disabled={!rejectReason}
                          className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          Cannot Fulfil
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Orchestration: Finding Alternative</div>
                      <p className="text-slate-700 mb-4">Reason: <strong>ECG service currently unavailable</strong></p>
                      
                      <div className="bg-white p-5 rounded-lg border border-teal-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-xs font-bold text-teal-600 uppercase mb-1">Alternative Care-Ready Facility</div>
                            <h4 className="text-lg font-bold text-slate-900">{alternativeFacility.name}</h4>
                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                              <MapPin className="w-3.5 h-3.5" /> {alternativeFacility.distance} km away
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-teal-600">{alternativeReadiness.readinessScore}%</div>
                            <div className="text-xs font-medium text-slate-500 uppercase">Readiness</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-slate-500 block mb-1">Required Services</span>
                            <span className="text-teal-700 font-medium">✓ Cardiologist</span><br/>
                            <span className="text-teal-700 font-medium">✓ ECG</span><br/>
                            <span className="text-teal-700 font-medium">✓ Blood Test</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-1">Metrics</span>
                            <span className="text-slate-700 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> ~{alternativeReadiness.estimatedWaitTime} min wait</span>
                            <span className="text-slate-700 font-medium mt-1 block">Patient Burden: Low</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded mb-4">
                          <strong>Why recommended:</strong> All required services are currently available with an appointment slot.
                        </div>

                        <button onClick={handleRedirect} className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                          Redirect Referral
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Rerouted State */}
              {currentStatus === "REROUTED — ALTERNATIVE FOUND" && (
                <div className="p-8 text-center bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Referral Redirected</h3>
                  <p className="text-blue-700">Patient has been successfully routed to {alternativeFacility.name}. The care journey continues seamlessly.</p>
                </div>
              )}

              {/* Accepted / Scheduling Phase */}
              {currentStatus === "Accepted" && (
                <div className="space-y-6">
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700"><Check className="w-4 h-4"/></div>
                    <div>
                      <div className="font-bold text-teal-900">Referral Accepted</div>
                      <div className="text-sm text-teal-700">Please schedule an appointment to proceed.</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm border-b pb-2">Schedule Appointment (Demo)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button onClick={handleSchedule} className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 text-center transition-all">
                        <div className="font-bold text-slate-900">Today</div>
                        <div className="text-sm text-slate-500">10:30 AM</div>
                      </button>
                      <button onClick={handleSchedule} className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 text-center transition-all">
                        <div className="font-bold text-slate-900">Today</div>
                        <div className="text-sm text-slate-500">2:00 PM</div>
                      </button>
                      <button onClick={handleSchedule} className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 text-center transition-all">
                        <div className="font-bold text-slate-900">Tomorrow</div>
                        <div className="text-sm text-slate-500">11:00 AM</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* In Care / Completion Phase */}
              {(currentStatus === "Appointment Confirmed" || currentStatus === "In Care" || currentStatus === "CARE COMPLETED") && (
                <div className="space-y-6">
                  {currentStatus === "Appointment Confirmed" && (
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700"><Calendar className="w-4 h-4"/></div>
                      <div>
                        <div className="font-bold text-teal-900">Appointment Confirmed</div>
                        <div className="text-sm text-teal-700">Today at 10:30 AM</div>
                      </div>
                    </div>
                  )}

                  {currentStatus === "CARE COMPLETED" && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700"><Check className="w-4 h-4"/></div>
                      <div>
                        <div className="font-bold text-emerald-900">CARE COMPLETED</div>
                        <div className="text-sm text-emerald-700">Follow-up is pending. Patient journey updated.</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-end mb-4 border-b pb-2">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Care Bundle Execution</h3>
                      <span className="text-sm font-medium text-slate-500">{currentCompleted.length} / {bundle.requirements.length} completed</span>
                    </div>
                    
                    <div className="space-y-3">
                      {bundle.requirements.map(req => {
                        const isDone = currentCompleted.includes(req.id);
                        return (
                          <div 
                            key={req.id}
                            onClick={() => currentStatus !== "CARE COMPLETED" && handleToggleService(req.id)}
                            className={`p-4 rounded-lg border flex justify-between items-center ${isDone ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 cursor-pointer hover:border-slate-300'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded border flex items-center justify-center ${isDone ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 text-transparent'}`}>
                                <Check className="w-4 h-4" />
                              </div>
                              <span className={`font-medium ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{req.name}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 uppercase rounded ${isDone ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                              {isDone ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <Stethoscope className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-slate-600">No Referral Selected</h3>
            <p className="mt-2">Select an incoming referral from the list to review care bundle requirements and readiness.</p>
          </div>
        )}
      </div>
    </div>
  );
}
