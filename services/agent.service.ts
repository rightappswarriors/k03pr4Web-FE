// Procurement Agent Registration Service
// Connected to k03pr4Web-BE NestJS Backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types ───────────────────────────────────────────────────────────────────────
export type ProcurementAgentType = "INDEPENDENT" | "ORGANIZATION";
export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL";

// ─── Register Agent (Single Endpoint) ───────────────────────────────────────────────
export const registerAgent = async (data: {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  city: string;
  province: string;
  zipCode: string;
  civilStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  emergencyContact?: string;
  agentType: ProcurementAgentType;
  invitationCode?: string;
  invitationLink?: string;
  documents: Array<{ type: string; fileUrl: string }>;
  interestedIndustries: string[];
  experienceLevel: ExperienceLevel;
}): Promise<{
  success: boolean;
  agentId?: string;
  status?: "PENDING_VERIFICATION" | "PENDING_ORGANIZATION_APPROVAL";
  message?: string;
  error?: string;
}> => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Agent Registration] Calling ${API_BASE_URL}/agent/register`);
  }

  const response = await fetch(`${API_BASE_URL}/agent/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Agent Registration] Error:`, result.error || result.message);
    }
    return { success: false, error: result.error || "Registration failed" };
  }

  return {
    success: true,
    agentId: result.data?.agentId,
    status: result.data?.status,
    message: result.message,
  };
};

// ─── Validate Invitation (does NOT consume) ────────────────────────────────────────
export const validateInvitation = async (codeOrLink: string): Promise<{
  valid: boolean;
  invitation?: {
    id: string;
    orgId: number;
    orgName: string;
    orgLogo?: string | null;
    orgAddress?: string | null;
    invitedPositionId?: string | null;
    invitedPositionName?: string | null;
    expiresAt: Date | null;
  };
  error?: string;
}> => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Agent Registration] Validating invitation at ${API_BASE_URL}/agent/invitation/validate`);
    }

    const response = await fetch(`${API_BASE_URL}/agent/invitation/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeOrLink }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Agent Registration] Validation error:`, result.error);
      }
      return { valid: false, error: result.error || "Invalid invitation" };
    }

    return {
      valid: true,
      invitation: result.data,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Agent Registration] Validation caught error:`, error);
    }
    return { valid: false, error: "Network error validating invitation" };
  }
};

// ─── Get Agent Details ─────────────────────────────────────────────────────────────
export const getAgentDetails = async (agentId: string): Promise<{
  id: string;
  agentType: string;
  status: string;
  email: string;
  phone: string;
  fullname: string;
  personalInfo?: {
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    civilStatus?: string;
    emergencyContact?: string;
  };
  preferences?: {
    interestedIndustries: string[];
    experienceLevel: string;
  };
  verifications?: Array<{
    id: string;
    documentType: string;
    fileUrl: string;
    status: string;
    createdAt: Date;
  }>;
  organization?: {
    id: number;
    name: string;
    profileImg?: string | null;
  } | null;
  position?: {
    id: string;
    name: string;
  } | null;
} | null> => {
  const response = await fetch(`${API_BASE_URL}/agent/${agentId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to get agent details");
  }

  return result.data;
};

// ─── Upload File Helper ───────────────────────────────────────────────────────────
export const uploadDocument = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const result = await response.json();
  return result.url;
};