import { Injectable, Logger } from '@nestjs/common';

export interface VoiceProcessInput {
  transcript: string;
  sourceLanguage?: string; // 'hi', 'mr', 'ta', 'te', 'bn', 'en'
}

export interface VoiceProcessResult {
  originalText: string;
  detectedLanguage: string;
  translatedEnglish: string;
  extractedClinicalTerms: {
    chiefComplaint: string;
    symptoms: string[];
    duration?: string;
    severityHint?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

@Injectable()
export class BhashiniService {
  private readonly logger = new Logger(BhashiniService.name);
  private readonly bhashiniApiKey: string | undefined;
  private readonly bhashiniUserId: string | undefined;

  constructor() {
    this.bhashiniApiKey = process.env.BHASHINI_API_KEY;
    this.bhashiniUserId = process.env.BHASHINI_USER_ID;
  }

  // Common Indic Medical Terminology Lexicon for Bharat / Rural Care
  private readonly indicativeLexicon: Record<string, { en: string; category: string; severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' }> = {
    // Hindi / Urdu / Hinglish
    'chhati me dard': { en: 'chest pain', category: 'cardiac', severity: 'CRITICAL' },
    'chhati dard': { en: 'chest pain', category: 'cardiac', severity: 'CRITICAL' },
    'seene me dard': { en: 'severe chest pain', category: 'cardiac', severity: 'CRITICAL' },
    'dil me dard': { en: 'chest discomfort', category: 'cardiac', severity: 'HIGH' },
    'saans lene me takleef': { en: 'dyspnea / difficulty breathing', category: 'respiratory', severity: 'HIGH' },
    'saans phoolna': { en: 'shortness of breath', category: 'respiratory', severity: 'HIGH' },
    'chakkar': { en: 'dizziness / vertigo', category: 'neurological', severity: 'MEDIUM' },
    'behoshi': { en: 'syncope / loss of consciousness', category: 'neurological', severity: 'CRITICAL' },
    'tez bukhar': { en: 'high fever', category: 'infectious', severity: 'HIGH' },
    'bukhar': { en: 'fever', category: 'infectious', severity: 'MEDIUM' },
    'khansi': { en: 'cough', category: 'respiratory', severity: 'LOW' },
    'ulti': { en: 'vomiting', category: 'gastrointestinal', severity: 'MEDIUM' },
    'dast': { en: 'diarrhea', category: 'gastrointestinal', severity: 'MEDIUM' },
    'haddi tutna': { en: 'fracture / bone trauma', category: 'orthopedic', severity: 'HIGH' },
    'paanv me sujan': { en: 'pedal edema / swelling', category: 'cardiac/renal', severity: 'MEDIUM' },

    // Marathi
    'chhatit dukhane': { en: 'chest pain', category: 'cardiac', severity: 'CRITICAL' },
    'shwas ghyayla tras': { en: 'dyspnea / shortness of breath', category: 'respiratory', severity: 'HIGH' },
    'taap': { en: 'fever', category: 'infectious', severity: 'MEDIUM' },
    'khokla': { en: 'cough', category: 'respiratory', severity: 'LOW' },
    'chakkar yene': { en: 'dizziness', category: 'neurological', severity: 'MEDIUM' },
    'potat dukhane': { en: 'abdominal pain', category: 'gastrointestinal', severity: 'MEDIUM' },

    // Devanagari Script Matches
    'सीने में दर्द': { en: 'chest pain', category: 'cardiac', severity: 'CRITICAL' },
    'छाती में दर्द': { en: 'chest pain', category: 'cardiac', severity: 'CRITICAL' },
    'सांस लेने में तकलीफ': { en: 'shortness of breath', category: 'respiratory', severity: 'HIGH' },
    'बुखार': { en: 'fever', category: 'infectious', severity: 'MEDIUM' },
    'चक्कर': { en: 'dizziness', category: 'neurological', severity: 'MEDIUM' },
    'उल्टी': { en: 'vomiting', category: 'gastrointestinal', severity: 'MEDIUM' },
    'खांसी': { en: 'cough', category: 'respiratory', severity: 'LOW' },
    'पेट में दर्द': { en: 'abdominal pain', category: 'gastrointestinal', severity: 'MEDIUM' },
    'हड्डी में दर्द': { en: 'bone/orthopedic pain', category: 'orthopedic', severity: 'MEDIUM' },
  };

  async processVoiceTranscript(input: VoiceProcessInput): Promise<VoiceProcessResult> {
    const raw = input.transcript.trim();
    const lower = raw.toLowerCase();
    const detectedLanguage = input.sourceLanguage || (/[ऀ-ॿ]/.test(raw) ? 'hi' : 'en-IN');

    // 1. If Bhashini API keys are present, call official National Language Translation Mission pipeline
    if (this.bhashiniApiKey && this.bhashiniUserId) {
      try {
        const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/translation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.bhashiniApiKey,
            'userID': this.bhashiniUserId,
          },
          body: JSON.stringify({
            pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: detectedLanguage, targetLanguage: 'en' } } }],
            inputData: { input: [{ source: raw }] }
          })
        });
        const data = await response.json();
        const translated = data?.pipelineResponse?.[0]?.output?.[0]?.target;
        if (translated) {
          return this.extractClinicalEntities(raw, detectedLanguage, translated);
        }
      } catch (err: any) {
        this.logger.warn(`Bhashini API call fallback: ${err.message}`);
      }
    }

    // 2. High-performance offline / deterministic Indic-medical translation
    let translated = raw;
    const matchedSymptoms: string[] = [];
    let highestSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

    for (const [key, mapping] of Object.entries(this.indicativeLexicon)) {
      if (lower.includes(key)) {
        matchedSymptoms.push(mapping.en);
        if (mapping.severity === 'CRITICAL') highestSeverity = 'CRITICAL';
        else if (mapping.severity === 'HIGH' && highestSeverity !== 'CRITICAL') highestSeverity = 'HIGH';
        else if (mapping.severity === 'MEDIUM' && highestSeverity === 'LOW') highestSeverity = 'MEDIUM';
      }
    }

    // Extract duration hints
    let duration: string | undefined;
    if (lower.includes('aaj') || lower.includes('today')) duration = 'Today';
    else if (lower.includes('din') || lower.includes('days')) duration = 'A few days';
    else if (lower.includes('hafte') || lower.includes('week')) duration = 'A week or more';
    else if (lower.includes('mahine') || lower.includes('month')) duration = 'Several months';

    if (matchedSymptoms.length > 0) {
      translated = `Patient reports ${matchedSymptoms.join(', ')} for ${duration || 'unspecified duration'}.`;
    }

    return {
      originalText: raw,
      detectedLanguage,
      translatedEnglish: translated,
      extractedClinicalTerms: {
        chiefComplaint: matchedSymptoms[0] || raw,
        symptoms: matchedSymptoms.length > 0 ? matchedSymptoms : [raw],
        duration,
        severityHint: highestSeverity,
      }
    };
  }

  private extractClinicalEntities(raw: string, lang: string, translated: string): VoiceProcessResult {
    return {
      originalText: raw,
      detectedLanguage: lang,
      translatedEnglish: translated,
      extractedClinicalTerms: {
        chiefComplaint: translated.split('.')[0],
        symptoms: [translated],
        severityHint: translated.toLowerCase().includes('chest') ? 'CRITICAL' : 'MEDIUM',
      }
    };
  }
}
