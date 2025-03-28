
import { Patient, FollowUp, Doctor } from "@/types";

// Sample doctors data
export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Ahmed",
    email: "dr.sarah@clinic.com",
    clinicName: "Gulf Medical Center"
  },
  {
    id: "2",
    name: "Dr. Mohammed Al-Zaabi",
    email: "dr.mohammed@clinic.com",
    clinicName: "Emirates Dental Clinic"
  },
  {
    id: "3",
    name: "Dr. Aisha Khan",
    email: "dr.aisha@clinic.com",
    clinicName: "Dubai Health Institute"
  }
];

// Sample patients data
export const patients: Patient[] = [
  {
    id: "1",
    name: "Ahmed Al-Mansouri",
    age: 42,
    gender: "male",
    phone: "+971 50 123 4567",
    clinicName: "Gulf Medical Center",
    doctorId: "1",
    treatment: "Dental Implant",
    price: 3500,
    needsFollowUp: true,
    status: "contacted",
    createdAt: "2023-06-15T10:30:00Z",
    notes: "Patient expressed interest but wanted to think about the cost."
  },
  {
    id: "2",
    name: "Fatima Rashid",
    age: 35,
    gender: "female",
    phone: "+971 55 987 6543",
    clinicName: "Gulf Medical Center",
    doctorId: "1",
    treatment: "Skin Treatment",
    price: 1200,
    needsFollowUp: true,
    status: "pending",
    createdAt: "2023-06-18T14:45:00Z"
  },
  {
    id: "3",
    name: "Mohammed Al-Qasimi",
    age: 55,
    gender: "male",
    phone: "+971 52 456 7890",
    clinicName: "Emirates Dental Clinic",
    doctorId: "2",
    treatment: "Root Canal",
    price: 1800,
    needsFollowUp: true,
    status: "booked",
    createdAt: "2023-06-10T09:15:00Z",
    notes: "Appointment confirmed for next week."
  },
  {
    id: "4",
    name: "Layla Abdullah",
    age: 29,
    gender: "female",
    phone: "+971 54 321 9876",
    clinicName: "Dubai Health Institute",
    doctorId: "3",
    treatment: "Fertility Consultation",
    price: 2500,
    needsFollowUp: true,
    status: "cold",
    createdAt: "2023-06-05T11:00:00Z",
    notes: "No response after 3 calls."
  },
  {
    id: "5",
    name: "Saeed Al-Najjar",
    age: 48,
    gender: "male",
    phone: "+971 56 789 0123",
    clinicName: "Emirates Dental Clinic",
    doctorId: "2",
    treatment: "Teeth Whitening",
    price: 900,
    needsFollowUp: true,
    status: "interested",
    createdAt: "2023-06-12T16:30:00Z",
    notes: "Asked for more details about the procedure."
  }
];

// Sample follow-ups data
export const followUps: FollowUp[] = [
  {
    id: "1",
    patientId: "1",
    type: "call",
    date: "2023-06-16",
    time: "10:15",
    response: "maybe",
    notes: "Patient was busy, asked to call back."
  },
  {
    id: "2",
    patientId: "1",
    type: "call",
    date: "2023-06-17",
    time: "14:30",
    response: "maybe",
    notes: "Patient wants to discuss with family first."
  },
  {
    id: "3",
    patientId: "2",
    type: "message",
    date: "2023-06-19",
    time: "09:45",
    response: null,
    notes: "No response yet."
  },
  {
    id: "4",
    patientId: "3",
    type: "call",
    date: "2023-06-11",
    time: "11:00",
    response: "yes",
    notes: "Patient confirmed appointment."
  },
  {
    id: "5",
    patientId: "4",
    type: "call",
    date: "2023-06-06",
    time: "13:20",
    response: "no",
    notes: "Patient declined treatment."
  },
  {
    id: "6",
    patientId: "4",
    type: "message",
    date: "2023-06-08",
    time: "15:45",
    response: null,
    notes: "Follow-up message sent, no response."
  },
  {
    id: "7",
    patientId: "5",
    type: "call",
    date: "2023-06-13",
    time: "10:30",
    response: "maybe",
    notes: "Patient requested more information via email."
  }
];
