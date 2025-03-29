
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor';
  phone?: string;
  clinic_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type Clinic = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export type Patient = {
  id?: string; // Make ID optional since it's auto-generated on insert
  name: string;
  age?: number | null;
  gender?: string;
  phone: string;
  email?: string | null;
  doctor_id?: string | null;
  clinic_id?: string | null;
  treatment_category?: string | null;
  treatment_type?: string | null;
  price?: number | null;
  follow_up_required?: boolean;
  status?: 'Interested' | 'Not Interested' | 'Pending' | 'Contacted' | 'Booked' | 'Cold';
  created_at?: string;
  next_interaction?: string;
  last_interaction?: string;
  last_interaction_outcome?: 'Yes' | 'No' | 'Maybe' | 'No Answer' | 'Opt-out';
  call_attempts?: number;
  sms_attempts?: number;
  sms_transcript?: string;
  call_transcript?: string;
  preferred_time?: 'Morning' | 'Afternoon' | 'Evening';
  preferred_channel?: 'Call' | 'SMS' | 'Email';
  availability_preferences?: string;
  notes?: string;
  interaction_rating?: 'Positive' | 'Neutral' | 'Negative';
  last_modified?: string;
  last_modified_by?: string;
  script?: string;
  cold_reason?: string;
  // VoIP fields
  voip_call_id?: string | null;
  voip_call_status?: string | null;
  voip_call_timestamp?: string | null;
  voip_call_duration?: number | null;
}

export type FollowUp = {
  id: string;
  patient_id: string;
  type: string;
  date: string;
  time: string;
  notes?: string;
  response?: string;
  created_by?: string;
  created_at?: string;
}

export type Settings = {
  id: string;
  clinic_id?: string;
  outreach_start_time: string;
  outreach_end_time: string;
  excluded_days: string[];
  outreach_interval: number;
  created_at?: string;
  updated_at?: string;
}

export type ApiConfiguration = {
  id: string;
  api_name: string;
  api_key?: string;
  api_secret?: string;
  configuration?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
