
export interface MergedFollowUp {
  id: string;
  patientName: string;
  clinicName: string;
  doctorId?: string;
  type: string;
  date: string;
  time: string;
  notes?: string;
  response?: string | null;
  // Support both naming conventions
  patient_id?: string;
  patientId?: string;
  created_by?: string;
  created_at?: string;
  followUpDate?: string;
}
