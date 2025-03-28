
import { z } from "zod";

// Validation schema for patient form
export const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().nullable().optional(),
  gender: z.string().optional(),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\+971\d{9}$/, "Phone must be in +971 format with 9 digits"),
  email: z.string().email("Invalid email").optional().nullable(),
  treatment_category: z.string().optional().nullable(),
  treatment_type: z.string().optional().nullable(),
  price: z.coerce.number().nullable().optional(),
  doctor_id: z.string().optional().nullable(),
  clinic_id: z.string().optional().nullable(),
  clinic_name: z.string().optional().nullable(),
  follow_up_required: z.boolean().default(true),
  preferred_time: z.string().optional().nullable(),
  preferred_channel: z.string().optional().nullable(),
  availability_preferences: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  script: z.string().optional().nullable(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

// Default values for the patient form
export const defaultPatientValues: PatientFormValues = {
  name: "",
  age: null,
  gender: "male",
  phone: "+971",
  email: "",
  treatment_category: "",
  treatment_type: "",
  price: null,
  doctor_id: "",
  clinic_id: "",
  clinic_name: "",
  follow_up_required: true,
  preferred_time: "Morning",
  preferred_channel: "Call",
  availability_preferences: "",
  notes: "",
  script: "",
};
