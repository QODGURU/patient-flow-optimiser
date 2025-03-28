
export type UserRole = "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type PatientStatus = 
  | "pending" 
  | "contacted" 
  | "interested" 
  | "booked" 
  | "cold" 
  | "opt-out";

export type FollowUpChannel = "call" | "sms" | "email";

export type FollowUpResponse = 
  | "yes" 
  | "no" 
  | "maybe" 
  | "call_again" 
  | null;

export type FollowUpDisposition = 
  | "answered" 
  | "no_answer" 
  | "busy" 
  | "failed";

export type PreferredTimeSlot = 
  | "morning" 
  | "afternoon" 
  | "evening";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  email?: string;
  clinicName: string;
  doctorId: string;
  treatment: string;
  price: number;
  needsFollowUp: boolean;
  status: PatientStatus;
  createdAt: string;
  notes?: string;
  
  // Enhanced fields
  leadSource?: "consultation" | "website" | "referral" | "csv_upload";
  lastFollowUpDate?: string;
  followUpCount?: number;
  leadPriority?: "high" | "medium" | "low";
  optOutStatus?: boolean;
  preferredChannel?: FollowUpChannel;
  preferredTimeSlot?: PreferredTimeSlot;
  availableDays?: string[];
  consentTimestamp?: string;
  aiDisclosureAccepted?: boolean;
  coldLeadReason?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  type: FollowUpChannel;
  date: string;
  time: string;
  response: FollowUpResponse;
  notes?: string;
  transcript?: string;
  
  // Enhanced fields
  scheduledTime?: string;
  actualTime?: string;
  sessionId?: string;
  disposition?: FollowUpDisposition;
  scriptVersion?: string;
  callDuration?: number;
  cost?: number;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  clinicName: string;
}

export interface Script {
  id: string;
  name: string;
  treatment: string;
  content: string;
  version: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface TimeSlotSettings {
  startTime: string; // 24-hour format, e.g. "09:00"
  endTime: string; // 24-hour format, e.g. "17:00"
  excludedDays: string[]; // e.g. ["Friday", "Saturday"]
}

export interface LanguageSettings {
  primary: "en" | "ar";
  enableTranslation: boolean;
}
