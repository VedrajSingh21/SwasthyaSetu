import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Upload, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { mockCareBundles } from '../../lib/mockData';
import type { CareRequirement } from '@swasthyasetu/types';

const steps = [
  { id: 'problem', title: 'What problem are you experiencing?', type: 'text', placeholder: 'e.g., Chest pain, difficulty breathing...' },
  { id: 'duration', title: 'How long has it been happening?', type: 'radio', options: ['Today', 'A few days', 'A week or more', 'Several months'] },
  { id: 'symptoms', title: 'Any important symptoms?', type: 'text', placeholder: 'e.g., Fever, dizziness, swelling...' },
  { id: 'history', title: 'Existing conditions / relevant history', type: 'text', placeholder: 'e.g., Diabetes, Hypertension...' },
  { id: 'upload', title: 'Upload existing report/prescription (Optional)', type: 'file' },
  { id: 'review', title: 'Review your details' }
];

interface ExtractionResult {
  title: string;
  requirements: CareRequirement[];
  priority: "High" | "Medium" | "Low";
  reason: string;
}

function extractCareRequirements(data: Record<string, string>): ExtractionResult {
  const combinedText = Object.values(data).join(' ').toLowerCase();

  if (
    combinedText.includes('chest pain') ||
    combinedText.includes('chest discomfort') ||
    combinedText.includes('chest pressure') ||
    combinedText.includes('breathlessness') ||
    combinedText.includes('shortness of breath')
  ) {
    return {
      title: "Cardiology Evaluation",
      priority: "High",
      reason: "The reported symptoms indicate that specialist assessment and the listed investigations may be required for further evaluation.",
      requirements: [
        { id: "cr1", type: "Consultation", name: "Cardiologist Consultation", specialty: "Cardiology" },
        { id: "cr2", type: "Diagnostic", name: "ECG", specialty: "Cardiology" },
        { id: "cr3", type: "Diagnostic", name: "Basic blood investigation", specialty: "General" },
        { id: "cr4", type: "Procedure", name: "Follow-up required", specialty: "General" },
      ]
    };
  }

  if (
    combinedText.includes('fever') ||
    combinedText.includes('high temperature') ||
    combinedText.includes('chills')
  ) {
    return {
      title: "Fever Evaluation",
      priority: "Medium",
      reason: "The reported symptoms indicate that a general physician assessment and basic blood investigations may be required.",
      requirements: [
        { id: "cr1", type: "Consultation", name: "General physician consultation", specialty: "General" },
        { id: "cr2", type: "Diagnostic", name: "Basic blood investigation", specialty: "General" },
        { id: "cr3", type: "Procedure", name: "Follow-up required", specialty: "General" },
      ]
    };
  }

  if (
    combinedText.includes('broken arm') ||
    combinedText.includes('arm injury') ||
    combinedText.includes('leg injury') ||
    combinedText.includes('fracture') ||
    combinedText.includes('severe injury')
  ) {
    return {
      title: "Orthopedic Evaluation",
      priority: "High",
      reason: "The reported injury indicates that an orthopedic assessment and imaging may be required.",
      requirements: [
        { id: "cr1", type: "Consultation", name: "Orthopedic consultation", specialty: "Orthopedics" },
        { id: "cr2", type: "Diagnostic", name: "X-ray / required imaging", specialty: "Orthopedics" },
        { id: "cr3", type: "Procedure", name: "Follow-up required", specialty: "General" },
      ]
    };
  }

  return {
    title: "General Evaluation",
    priority: "Medium",
    reason: "The reported symptoms indicate that a clinical assessment may be required.",
    requirements: [
      { id: "cr1", type: "Consultation", name: "General physician consultation", specialty: "General" },
      { id: "cr2", type: "Diagnostic", name: "Clinical assessment", specialty: "General" },
      { id: "cr3", type: "Procedure", name: "Follow-up required", specialty: "General" },
    ]
  };
}

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [aiResult, setAiResult] = useState<ExtractionResult | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Extract requirements from form data
    const result = extractCareRequirements(formData);
    setAiResult(result);

    // Update global mock data so the CarePlan page renders it correctly
    mockCareBundles[0].title = result.title;
    mockCareBundles[0].priority = result.priority;
    mockCareBundles[0].requirements = result.requirements;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowAiResult(true);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Patient Assessment</h1>
        <p className="text-slate-500 text-sm">Help us understand your needs so we can orchestrate your care.</p>
        
        {/* Progress bar */}
        {!showAiResult && (
          <>
            <div className="mt-6 flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 flex-1 rounded-full ${idx <= currentStep ? 'bg-teal-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">
              Step {currentStep + 1} of {steps.length}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col relative">
        <div className="flex-1 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.div 
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full pt-12"
              >
                <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-slate-800">Understanding the information provided...</h3>
                <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">
                  Our system is analyzing your assessment to determine the best care requirements for you.
                </p>
              </motion.div>
            ) : showAiResult ? (
              <motion.div 
                key="aiResult"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">AI-Assisted Assessment</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 tracking-wide uppercase border border-slate-200">
                          Demo Simulation
                        </span>
                        <span className="text-xs text-slate-400">Simulated AI Output</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Care Requirements Identified</h3>
                    <ul className="space-y-3">
                      {aiResult?.requirements.map((req) => (
                        <li key={req.id} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-700">{req.name}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">Priority</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                        aiResult?.priority === 'High' 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {aiResult?.priority}
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-50">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-2">Why these requirements?</h3>
                    <p className="text-indigo-800 text-sm leading-relaxed">
                      {aiResult?.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-6">{currentStepData.title}</h2>
                
                {currentStepData.type === 'text' && (
                  <textarea 
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none h-32 text-slate-700"
                    placeholder={currentStepData.placeholder}
                    value={formData[currentStepData.id] || ''}
                    onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                  />
                )}

                {currentStepData.type === 'radio' && (
                  <div className="space-y-3">
                    {currentStepData.options?.map((opt) => (
                      <label key={opt} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData[currentStepData.id] === opt ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                          type="radio" 
                          name={currentStepData.id} 
                          value={opt}
                          checked={formData[currentStepData.id] === opt}
                          onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                          className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                        <span className="ml-3 font-medium text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentStepData.type === 'file' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="font-medium text-slate-700">Tap to upload file</p>
                    <p className="text-sm text-slate-500 mt-1">Images, PDFs supported</p>
                  </div>
                )}

                {currentStepData.id === 'review' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 mb-6">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 text-sm">Demo Data Disclaimer</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          This assessment is for demonstration purposes. It does not provide medical diagnosis.
                        </p>
                      </div>
                    </div>
                    
                    {steps.slice(0, -2).map((step) => (
                      <div key={step.id} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="text-sm font-medium text-slate-500">{step.title}</div>
                        <div className="font-medium text-slate-800 mt-1">{formData[step.id] || <span className="text-slate-400 italic">Not provided</span>}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!isSubmitting && !showAiResult && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
            <button 
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </button>
            <button 
              onClick={handleNext}
              className="flex items-center px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
              {currentStep === steps.length - 1 ? <CheckCircle2 className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5 ml-1" />}
            </button>
          </div>
        )}

        {!isSubmitting && showAiResult && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end mt-auto">
             <button 
              onClick={() => navigate('/patient/care-plan')}
              className="flex items-center px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
            >
              Continue to Care Bundle
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

