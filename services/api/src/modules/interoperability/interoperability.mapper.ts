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

  static mapToOrganizationResource(facility: any) {
    const SYSTEM_FACILITY_URL = 'https://swasthyasetu.example/identifiers/internal-facility';
    
    // Map internal facility types to something closer to standard healthcare codes, or keep as is.
    const facilityTypeMap: Record<string, string> = {
      'PHC': 'prov', // Healthcare Provider
      'CHC': 'prov',
      'DH': 'prov',
      'SC': 'prov' // Sub-center
    };

    const typeCode = facilityTypeMap[facility.type] || 'prov';

    return {
      resourceType: 'Organization',
      id: facility.id,
      meta: {
        source: 'SwasthyaSetu',
        version: this.VERSION,
        generatedAt: new Date().toISOString(),
      },
      identifier: [
        {
          system: SYSTEM_FACILITY_URL,
          value: facility.id,
          description: 'This identifier is an internal SwasthyaSetu facility identifier and is not a Health Facility Registry (HFR) identifier.',
        }
      ],
      active: facility.active !== undefined ? facility.active : true,
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/organization-type',
              code: typeCode,
              display: facility.type,
            }
          ],
          text: facility.type
        }
      ],
      name: facility.name,
      address: facility.address ? [
        {
          text: facility.address,
          type: 'physical'
        }
      ] : undefined,
      extension: (facility.latitude !== null && facility.longitude !== null && facility.latitude !== undefined && facility.longitude !== undefined) ? [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/geolocation',
          extension: [
            {
              url: 'latitude',
              valueDecimal: facility.latitude
            },
            {
              url: 'longitude',
              valueDecimal: facility.longitude
            }
          ]
        }
      ] : undefined
    };
  }
}
