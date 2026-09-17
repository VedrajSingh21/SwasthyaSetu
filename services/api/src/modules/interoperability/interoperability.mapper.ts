export class InteroperabilityMapper {
  private static readonly SYSTEM_URL = 'https://swasthyasetu.example/identifiers/internal-patient';
  private static readonly VERSION = '1.0';

  static mapToPatientResource(patient: any) {
    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        source: 'SwasthyaSetu',
        version: this.VERSION,
        generatedAt: new Date().toISOString(),
      },
      identifier: [
        {
          system: this.SYSTEM_URL,
          value: patient.id,
          description: 'This identifier is an internal SwasthyaSetu identifier and is not an ABHA identifier.',
        }
      ],
      name: [
        {
          text: patient.name,
        }
      ],
      gender: patient.gender?.toLowerCase(),
      birthDate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : undefined,
    };
  }

  static mapToCarePlanResource(careBundle: any, requirements: any[]) {
    return {
      resourceType: 'CarePlan',
      id: careBundle.id,
      meta: {
        source: 'SwasthyaSetu',
        version: this.VERSION,
        generatedAt: new Date().toISOString(),
      },
      status: careBundle.status?.toLowerCase(),
      intent: 'plan',
      title: careBundle.title,
      subject: {
        reference: `Patient/${careBundle.patientId}`,
        type: 'Patient'
      },
      activity: requirements.map((req) => ({
        detail: {
          status: req.status?.toLowerCase() || 'in-progress',
          description: req.name,
          category: {
            text: req.requirementType
          },
          extension: [
            {
              url: 'https://swasthyasetu.example/extensions/priority',
              valueString: req.priority
            }
          ]
        }
      }))
    };
  }

  static mapToServiceRequestResource(referral: any) {
    return {
      resourceType: 'ServiceRequest',
      id: referral.id,
      meta: {
        source: 'SwasthyaSetu',
        version: this.VERSION,
        generatedAt: new Date().toISOString(),
      },
      status: referral.status?.toLowerCase(),
      intent: 'order',
      priority: referral.priority?.toLowerCase() || 'routine',
      subject: {
        reference: `Patient/${referral.patientId}`,
        type: 'Patient'
      },
      reasonCode: [
        {
          text: referral.reason || 'Referral'
        }
      ],
      requester: referral.referringFacilityId ? {
        reference: `Organization/${referral.referringFacilityId}`,
        type: 'Organization'
      } : undefined,
      performer: referral.destinationFacilityId ? [
        {
          reference: `Organization/${referral.destinationFacilityId}`,
          type: 'Organization'
        }
      ] : undefined,
      basedOn: [
        {
          reference: `CarePlan/${referral.careBundleId}`,
          type: 'CarePlan'
        }
      ]
    };
  }
}
