
export type UserRole = "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicName?: string;
  phone?: string;
}

export type PatientStatus = "pending" | "contacted" | "interested" | "booked" | "cold" | "opt-out";

export type FollowUpType = "call" | "message";
export type FollowUpResponse = "yes" | "no" | "maybe" | "call_again" | null;

export interface TimeSlotSettings {
  startTime: string;
  endTime: string;
  excludedDays: string[];
}

export interface LanguageSettings {
  primary: "en" | "ar";
  enableTranslation: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  email?: string;
  doctorId: string;
  clinicName: string;
  treatment: string;
  price: number;
  status: PatientStatus;
  lastContactDate?: string;
  coldReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  type: FollowUpType;
  date: string;
  time: string;
  notes?: string;
  response: FollowUpResponse;
  followUpDate?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinicName: string;
  specialty: string;
  patientCount: number;
  convertedCount: number;
}

export interface TreatmentType {
  id: string;
  name: string;
  category: string;
  defaultScript?: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  type: "call" | "sms" | "email";
  treatmentCategory: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

export interface ImportValidationResult {
  totalRows: number;
  validRows: number;
  errors: string[];
  data?: Patient[];
}
