
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/integrations/supabase/client";
import { Patient, FollowUp } from "@/types/supabase";
import { toast } from "sonner";

// Helper to generate a random date within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to format date to ISO string (YYYY-MM-DD)
const formatDateToISOString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper to format time to HH:MM:SS
const formatTimeString = (date: Date) => {
  return date.toTimeString().split(' ')[0];
};

// Generate random patient data
const generatePatientData = (doctorId: string, clinicId: string | null) => {
  const treatments = [
    { category: "Dental", types: ["Cleaning", "Filling", "Root Canal", "Crown", "Extraction"] },
    { category: "Orthodontics", types: ["Braces", "Invisalign", "Retainer"] },
    { category: "Cosmetic", types: ["Whitening", "Veneers", "Bonding"] },
    { category: "Surgical", types: ["Wisdom Teeth", "Dental Implants", "Gum Surgery"] },
    { category: "Preventive", types: ["Check-up", "Fluoride Treatment", "Sealants"] }
  ];

  const firstNames = ["John", "Emma", "Michael", "Sophia", "William", "Olivia", "James", "Ava", "Alexander", "Mia", "Daniel", "Sarah", "Matthew", "Emily", "David", "Abigail", "Joseph", "Elizabeth", "Andrew", "Sofia"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  
  const patientStatus = ["Interested", "Not Interested", "Pending", "Contacted", "Booked"];
  const preferredTimes = ["Morning", "Afternoon", "Evening", null];
  const preferredChannels = ["Call", "SMS", "Email", null];
  const genders = ["Male", "Female", "Other", "Prefer not to say"];
  
  const randomTreatment = treatments[Math.floor(Math.random() * treatments.length)];
  const randomTreatmentType = randomTreatment.types[Math.floor(Math.random() * randomTreatment.types.length)];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  const status = patientStatus[Math.floor(Math.random() * patientStatus.length)];
  const preferredTime = preferredTimes[Math.floor(Math.random() * preferredTimes.length)];
  const preferredChannel = preferredChannels[Math.floor(Math.random() * preferredChannels.length)];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  
  // Random price between 100 and 2000
  const price = Math.floor(Math.random() * 1900) + 100;
  
  // Random age between 18 and 75
  const age = Math.floor(Math.random() * 57) + 18;
  
  // 80% chance of follow-up required
  const followUpRequired = Math.random() < 0.8;
  
  // Generate random phone number
  const phoneDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  const phone = `+1${phoneDigits}`;
  
  // Generate random availability preferences
  const availabilities = ["Weekdays only", "Weekends preferred", "Mornings only", "Afternoons only", "Evenings only", "Any time"];
  const availabilityPreferences = availabilities[Math.floor(Math.random() * availabilities.length)];
  
  // Generate random notes
  const noteTemplates = [
    "Patient requested detailed information about treatment options.",
    "Has dental anxiety, may need additional reassurance.",
    "Previous experience with similar treatment at another provider.",
    "Concerned about insurance coverage.",
    "Prefers to be contacted only via email.",
    "Has scheduling constraints due to work.",
    "Referred by existing patient.",
    "Seeking second opinion after consultation elsewhere.",
    "Very interested in financing options.",
    "Has questions about recovery time."
  ];
  const notes = noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
  
  // Generate created_at date in the last 3 months
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  const createdAt = randomDate(threeMonthsAgo, now);
  
  // Generate random interaction outcome based on status
  let lastInteractionOutcome = null;
  if (status === "Interested") {
    lastInteractionOutcome = "Yes";
  } else if (status === "Not Interested") {
    lastInteractionOutcome = "No";
  } else if (status === "Contacted") {
    const outcomes = ["Maybe", "No Answer", "Yes"];
    lastInteractionOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
  }
  
  return {
    name: `${firstName} ${lastName}`,
    age,
    gender,
    phone,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    treatment_category: randomTreatment.category,
    treatment_type: randomTreatmentType,
    price,
    doctor_id: doctorId,
    clinic_id: clinicId,
    follow_up_required: followUpRequired,
    status,
    preferred_time: preferredTime,
    preferred_channel: preferredChannel,
    availability_preferences: availabilityPreferences,
    notes,
    created_at: createdAt.toISOString(),
    last_interaction_outcome: lastInteractionOutcome,
    last_modified_by: doctorId
  };
};

// Generate follow-up data for a patient
const generateFollowUpData = (patientId: string, doctorId: string, patientStatus: string) => {
  const followUpTypes = ["Phone Call", "SMS", "Email"];
  const responseTypes = ["Yes", "No", "Maybe", "No Answer", "Opt-out", null];
  
  let responses = [...responseTypes];
  
  // Bias response based on patient status
  if (patientStatus === "Interested") {
    responses = ["Yes", "Maybe", "Yes", "Yes", "No Answer"];
  } else if (patientStatus === "Not Interested") {
    responses = ["No", "Opt-out", "No", "No Answer"];
  }
  
  const now = new Date();
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  // Number of follow-ups for this patient (1-4)
  const followUpCount = Math.floor(Math.random() * 3) + 1;
  
  const followUps = [];
  for (let i = 0; i < followUpCount; i++) {
    const followUpDate = randomDate(twoMonthsAgo, now);
    const followUpType = followUpTypes[Math.floor(Math.random() * followUpTypes.length)];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Generate notes based on response
    let notes = null;
    if (response === "Yes") {
      notes = "Patient expressed interest and requested more information.";
    } else if (response === "No") {
      notes = "Patient declined further communication.";
    } else if (response === "Maybe") {
      notes = "Patient is considering options, needs more time.";
    } else if (response === "No Answer") {
      notes = "Left voicemail.";
    }
    
    followUps.push({
      patient_id: patientId,
      created_by: doctorId,
      date: formatDateToISOString(followUpDate),
      time: formatTimeString(followUpDate),
      type: followUpType,
      response,
      notes
    });
  }
  
  return followUps;
};

// Generate and insert demo data
export const generateDemoData = async () => {
  try {
    // Get current user profile
    const { profile } = await getCurrentUserProfile();
    
    if (!profile) {
      console.error("No user profile found");
      return;
    }
    
    // Check if there's already patient data
    const { data: existingPatients, error: patientError } = await supabase
      .from("patients")
      .select("count", { count: "exact", head: true });
      
    if (patientError) {
      throw patientError;
    }
    
    // Only generate data if there are no patients
    if (existingPatients?.count && existingPatients.count > 0) {
      console.log("Data already exists, skipping demo data generation");
      return;
    }
    
    console.log("Generating demo patient data...");
    toast.info("Generating demo data...");
    
    // Number of patients to create
    const patientCount = 30;
    
    // Create patients
    const patients = [];
    for (let i = 0; i < patientCount; i++) {
      patients.push(generatePatientData(profile.id, profile.clinic_id));
    }
    
    // Insert patients
    const { data: patientData, error: insertError } = await supabase
      .from("patients")
      .insert(patients)
      .select();
      
    if (insertError) {
      throw insertError;
    }
    
    console.log(`Successfully created ${patientData.length} demo patients`);
    
    // Create follow-ups for each patient
    let allFollowUps: FollowUp[] = [];
    
    patientData.forEach(patient => {
      const followUps = generateFollowUpData(patient.id, profile.id, patient.status);
      allFollowUps = [...allFollowUps, ...followUps];
    });
    
    // Insert follow-ups
    const { data: followUpData, error: followUpError } = await supabase
      .from("follow_ups")
      .insert(allFollowUps)
      .select();
      
    if (followUpError) {
      throw followUpError;
    }
    
    console.log(`Successfully created ${followUpData.length} demo follow-ups`);
    toast.success("Demo data generated successfully!");
    
    return { patients: patientData, followUps: followUpData };
  } catch (error) {
    console.error("Error generating demo data:", error);
    toast.error("Failed to generate demo data");
    return null;
  }
};
