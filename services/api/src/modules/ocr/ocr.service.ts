import { Injectable, Logger } from '@nestjs/common';

export interface ProcessSlipInput {
  extractedText?: string;
  imageBase64?: string;
  source?: 'TESSERACT_WASM' | 'MOBILE_CAMERA' | 'MANUAL_UPLOAD';
}

export interface ProcessSlipResult {
  rawText: string;
  cleanedText: string;
  detectedSpecialties: string[];
  suggestedDiagnostics: string[];
  suggestedConsultations: string[];
  urgencyLevel: 'High' | 'Medium' | 'Low';
  structuredSymptoms: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  // Common clinical abbreviations in Indian prescriptions (Rx / Doctor Slips)
  private readonly diagnosticKeywords = [
    { pattern: /\b(ecg|ekg|electrocardiogram)\b/i, name: 'ECG', type: 'Diagnostic' },
    { pattern: /\b(x-?ray|xray|cxr|chest x-?ray)\b/i, name: 'X-Ray Chest', type: 'Diagnostic' },
    { pattern: /\b(cbc|complete blood count|haemoglobin|hb)\b/i, name: 'Basic blood investigation', type: 'Diagnostic' },
    { pattern: /\b(lft|liver function)\b/i, name: 'Liver Function Test', type: 'Diagnostic' },
    { pattern: /\b(kft|rft|kidney function|renal)\b/i, name: 'Renal Function Test', type: 'Diagnostic' },
    { pattern: /\b(echo|echocardiogram|2d echo)\b/i, name: 'Echocardiogram', type: 'Diagnostic' },
    { pattern: /\b(ct scan|mri)\b/i, name: 'Advanced Imaging', type: 'Diagnostic' },
    { pattern: /\b(sugar|rbs|fbs|ppbs|hba1c)\b/i, name: 'Blood Sugar / Glycemic Profile', type: 'Diagnostic' },
  ];

  private readonly consultationKeywords = [
    { pattern: /\b(cardio|cardiologist|heart specialist)\b/i, name: 'Cardiology consultation', specialty: 'Cardiology' },
    { pattern: /\b(ortho|orthopedic|fracture|bone)\b/i, name: 'Orthopedic Consultation', specialty: 'Orthopedics' },
    { pattern: /\b(gynae|obs|gynaecology|obstetrics|pregnant|anc)\b/i, name: 'Obstetrics & Gynaecology', specialty: 'OBGYN' },
    { pattern: /\b(pedia|paediatric|child specialist)\b/i, name: 'Paediatrics Consultation', specialty: 'Paediatrics' },
    { pattern: /\b(physician|general medicine|md med)\b/i, name: 'General Medicine Consultation', specialty: 'General' },
  ];

  async processMedicalSlip(input: ProcessSlipInput): Promise<ProcessSlipResult> {
    const raw = input.extractedText || '';
    const cleaned = raw.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    this.logger.log(`Processing medical slip from source: ${input.source || 'UNKNOWN'}, length: ${cleaned.length}`);

    const suggestedDiagnostics = new Set<string>();
    const suggestedConsultations = new Set<string>();
    const detectedSpecialties = new Set<string>();

    for (const d of this.diagnosticKeywords) {
      if (d.pattern.test(cleaned)) {
        suggestedDiagnostics.add(d.name);
      }
    }

    for (const c of this.consultationKeywords) {
      if (c.pattern.test(cleaned)) {
        suggestedConsultations.add(c.name);
        detectedSpecialties.add(c.specialty);
      }
    }

    // Determine urgency level
    let urgencyLevel: 'High' | 'Medium' | 'Low' = 'Low';
    if (/urgent|emergency|stat|severe|infarct|mi|troponin|acute/i.test(cleaned)) {
      urgencyLevel = 'High';
    } else if (suggestedDiagnostics.size > 1 || suggestedConsultations.size > 0) {
      urgencyLevel = 'Medium';
    }

    // Default to at least General Medicine if nothing specific matched
    if (suggestedConsultations.size === 0) {
      suggestedConsultations.add('General Consultation');
    }

    const structuredSymptoms = `Prescription indicates review for ${Array.from(detectedSpecialties).join(', ') || 'clinical condition'}. Recommended tests: ${Array.from(suggestedDiagnostics).join(', ') || 'routine evaluation'}. Notes: ${cleaned.slice(0, 150)}`;

    return {
      rawText: raw,
      cleanedText: cleaned,
      detectedSpecialties: Array.from(detectedSpecialties),
      suggestedDiagnostics: Array.from(suggestedDiagnostics),
      suggestedConsultations: Array.from(suggestedConsultations),
      urgencyLevel,
      structuredSymptoms,
    };
  }
}
