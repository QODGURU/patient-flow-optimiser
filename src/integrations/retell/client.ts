
import { toast } from "sonner";
import type { Patient } from "@/types/supabase";

const RETELL_API_KEY = "key_2cc8305d482c4de6263ad81aac6c"; // Replace with environment variable in production

interface RetellLLMResponse {
  id: string;
  status: string;
  error?: string;
}

interface RetellAgentResponse {
  id: string;
  status: string;
  error?: string;
}

interface RetellCallResponse {
  id: string;
  status: string;
  error?: string;
}

export class RetellClient {
  private apiKey: string;
  private baseUrl: string = "https://api.retellai.com";
  private llmId: string | null = null;
  private agentId: string | null = null;

  constructor(apiKey: string = RETELL_API_KEY) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
    try {
      console.log(`Making ${method} request to ${endpoint} with data:`, data);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error from Retell API: ${response.status}`, errorData);
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in Retell API request to ${endpoint}:`, error);
      throw error;
    }
  }

  async createLLM(patientInfo: { treatment_category?: string, treatment_type?: string }): Promise<string> {
    try {
      const treatmentInfo = patientInfo.treatment_category || "healthcare";
      
      const llmData = {
        model: "gpt-4o",
        s2s_model: "gpt-4o-realtime",
        model_temperature: 0.5,
        tool_call_strict_mode: true,
        general_prompt: `You are a healthcare assistant calling to schedule appointments. You're calling about ${treatmentInfo} treatment.`,
        states: [
          {
            name: "information_collection",
            state_prompt: "Please provide your name and preferred appointment time.",
            edges: [
              {
                destination_state_name: "appointment_booking",
                description: "Proceed to booking after collecting information."
              }
            ]
          },
          {
            name: "appointment_booking",
            state_prompt: "Booking your appointment now.",
            tools: [
              {
                type: "function",
                name: "update_patient_response",
                description: "Update the patient's response in the system",
                parameters: {
                  type: "object",
                  properties: {
                    response: {
                      type: "string",
                      description: "The patient's response (yes, no, maybe)",
                      enum: ["yes", "no", "maybe"]
                    },
                    notes: {
                      type: "string",
                      description: "Any additional notes from the conversation"
                    }
                  },
                  required: ["response"]
                }
              }
            ]
          }
        ],
        starting_state: "information_collection",
        begin_message: "Hello, this is your healthcare assistant.",
        default_dynamic_variables: {
          customer_name: "Patient"
        }
      };

      const response = await this.makeRequest<RetellLLMResponse>("/create-retell-llm", "POST", llmData);
      console.log("Created Retell LLM:", response);
      
      if (!response.id) {
        throw new Error("No LLM ID returned from Retell API");
      }
      
      this.llmId = response.id;
      return response.id;
    } catch (error) {
      console.error("Error creating Retell LLM:", error);
      toast.error("Failed to create Retell AI assistant");
      throw error;
    }
  }

  async createAgent(llmId: string): Promise<string> {
    try {
      if (!llmId && !this.llmId) {
        throw new Error("LLM ID is required to create an agent");
      }
      
      const agentData = {
        response_engine: {
          type: "retell-llm",
          llm_id: llmId || this.llmId
        },
        voice_id: "11labs-Adrian"
      };

      const response = await this.makeRequest<RetellAgentResponse>("/create-agent", "POST", agentData);
      console.log("Created Retell Agent:", response);
      
      if (!response.id) {
        throw new Error("No Agent ID returned from Retell API");
      }
      
      this.agentId = response.id;
      return response.id;
    } catch (error) {
      console.error("Error creating Retell Agent:", error);
      toast.error("Failed to create Retell AI agent");
      throw error;
    }
  }

  async makeOutboundCall(
    agentId: string,
    phoneNumber: string, 
    patientName: string = "Patient",
    variables: Record<string, string> = {}
  ): Promise<string> {
    try {
      if (!agentId && !this.agentId) {
        throw new Error("Agent ID is required to make an outbound call");
      }
      
      // Format phone number to E.164 format if not already
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = `+${phoneNumber.replace(/\D/g, '')}`;
      }
      
      const callData = {
        agent_id: agentId || this.agentId,
        from: "+18304370001", // This should be a Retell phone number
        to: formattedPhone,
        direction: "outbound",
        variables: {
          customer_name: patientName,
          ...variables
        }
      };

      const response = await this.makeRequest<RetellCallResponse>("/create-phone-call", "POST", callData);
      console.log("Created Retell outbound call:", response);
      
      if (!response.id) {
        throw new Error("No Call ID returned from Retell API");
      }
      
      return response.id;
    } catch (error) {
      console.error("Error making Retell outbound call:", error);
      toast.error("Failed to initiate Retell AI call");
      throw error;
    }
  }

  async setupWebhook(agentId: string, webhookUrl: string): Promise<void> {
    try {
      if (!agentId && !this.agentId) {
        throw new Error("Agent ID is required to set up a webhook");
      }
      
      const webhookData = {
        agent_id: agentId || this.agentId,
        webhook_url: webhookUrl
      };

      await this.makeRequest("/update-agent", "PATCH", webhookData);
      console.log("Set up Retell webhook successfully");
    } catch (error) {
      console.error("Error setting up Retell webhook:", error);
      toast.error("Failed to set up Retell AI webhook");
      throw error;
    }
  }

  // Helper method to create all necessary components and make a call
  async setupAndCall(patient: Patient, webhookUrl?: string): Promise<string> {
    try {
      // Create LLM
      const llmId = await this.createLLM({
        treatment_category: patient.treatment_category,
        treatment_type: patient.treatment_type
      });
      
      // Create Agent
      const agentId = await this.createAgent(llmId);
      
      // Set up webhook if provided
      if (webhookUrl) {
        await this.setupWebhook(agentId, webhookUrl);
      }
      
      // Make outbound call
      const callId = await this.makeOutboundCall(
        agentId, 
        patient.phone, 
        patient.name,
        {
          treatment: patient.treatment_type || "treatment",
          price: patient.price?.toString() || "unspecified price"
        }
      );
      
      toast.success("Retell AI call initiated successfully");
      return callId;
    } catch (error) {
      console.error("Error in Retell setup and call:", error);
      toast.error("Failed to set up Retell AI call");
      throw error;
    }
  }
}

export const retellClient = new RetellClient();
