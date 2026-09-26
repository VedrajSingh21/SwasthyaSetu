export type UserRole = 'PATIENT' | 'FACILITY_STAFF' | 'ASHA_WORKER' | 'DISTRICT_ADMIN';

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  facilityId?: string;
  patientId?: string;
  districtId?: string;
}

export interface TokenClaims {
  sub: string;
  role: UserRole;
  name: string;
  phone?: string;
  facilityId?: string;
  patientId?: string;
  districtId?: string;
  iat: number;
  exp: number;
}

export interface OtpRecord {
  phone: string;
  otp: string;
  expiresAt: number;
  role: UserRole;
}
