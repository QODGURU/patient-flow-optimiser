
export type UserRole = "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  clinicName: string;
  doctorId: string;
  treatment: string;
  price: number;
  needsFollowUp: boolean;
  status: "pending" | "contacted" | "interested" | "booked" | "cold";
  createdAt: string;
  notes?: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  type: "call" | "message";
  date: string;
  time: string;
  response: "yes" | "no" | "maybe" | "call_again" | null;
  notes?: string;
  transcript?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  clinicName: string;
}
