// Procurement Agent Registration Types - Refactored for 7-step flow

export type ServiceRadius = 5 | 10 | 20 | 50;

export type ProcurementAgentType = "INDEPENDENT" | "ORGANIZATION";

export type InvitationStatus = "YES" | "NO";

export type Gender = "Male" | "Female" | "Other";

export type SupportedID =
  | "NATIONAL_ID"
  | "PASSPORT"
  | "DRIVER_LICENSE"
  | "PHILHEALTH"
  | "PRC"
  | "SSS"
  | "TIN";

export type OrganizationType =
  | "COMPANY"
  | "COOPERATIVE"
  | "LGU"
  | "SCHOOL"
  | "CHURCH"
  | "NGO"
  | "ASSOCIATION";

export type OrganizationRole =
  | "OWNER"
  | "MANAGER"
  | "PROCUREMENT_OFFICER"
  | "PURCHASING_OFFICER"
  | "BUYER"
  | "TREASURER"
  | "ADMINISTRATOR"
  | "AUTHORIZED_REPRESENTATIVE"
  | "OTHER";

export type BusinessType =
  | "RETAIL_STORE"
  | "RESELLER"
  | "DISTRIBUTOR"
  | "ONLINE_SELLER"
  | "PERSONAL_BUYER";

// ─── Experience Level ────────────────────────────────────────────────────────
export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL";

// ─── Procurement Categories ───────────────────────────────────────────────────
export type ProcurementCategory =
  | "CONSTRUCTION"
  | "OFFICE_SUPPLIES"
  | "AGRICULTURE"
  | "FOOD"
  | "MEDICAL"
  | "AUTOMOTIVE"
  | "ELECTRONICS";

// ─── Registration Status ───────────────────────────────────────────────────────
export type AgentRegistrationStatus =
  | "REGISTERED"                    // Step 1 complete
  | "PENDING_VERIFICATION"         // Step 5 complete
  | "PENDING_ORGANIZATION_APPROVAL" // Org agents after all steps
  | "ACTIVE"                       // Fully approved
  | "REJECTED";                    // Rejected during review

// ─── Step 1: User Account ─────────────────────────────────────────────────────
export interface UserAccount {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

// ─── Step 2: Agent Type ───────────────────────────────────────────────────────
export interface AgentTypeSelection {
  agentType: ProcurementAgentType | "";
}

// ─── Step 3: Validate Invitation (Organization agents only) ─────────────────────
export interface InvitationValidation {
  invitationCode: string;
  invitationLink?: string;
}

export interface ValidatedInvitation {
  id: string;
  orgId: number;
  orgName: string;
  orgLogo?: string;
  orgAddress?: string;
  orgIndustry?: string;
  invitedPositionId?: string;
  invitedPositionName?: string;
  invitedByName?: string;
  invitedByEmail?: string;
  expiresAt: string;
}

// ─── Step 4: Personal Information ─────────────────────────────────────────────
export interface PersonalInformation {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: Gender | "";
  address: string;
  civilStatus: "SINGLE" | "MARRIED" | "WIDOWED" | "SEPARATED";
  emergencyContact?: string;
  emergencyPhone?: string;
}

// ─── Step 5: Verification ─────────────────────────────────────────────────────
export interface VerificationDocuments {
  primaryIdFront: File | null;
  primaryIdBack: File | null;
  selfie: File | null;
  tin?: File | null;
  nbi?: File | null;
  policeClearance?: File | null;
}

// ─── Step 6: Procurement Preferences ──────────────────────────────────────────
export interface ProcurementPreferences {
  categories: ProcurementCategory[];
  experienceLevel: ExperienceLevel;
}

// ─── Complete Registration Data ───────────────────────────────────────────────
export interface ProcurementRegistrationData {
  agentType: ProcurementAgentType | "";
  // Step 1
  userAccount: UserAccount;
  // Step 2 - Validated invitation for org agents
  validatedInvitation?: ValidatedInvitation;
  // Step 3
  personalInfo: PersonalInformation;
  // Step 4
  verification: VerificationDocuments;
  // Step 5
  preferences: ProcurementPreferences;
  // Agreements
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketplace: boolean;
}

// ─── Agent Registration Types (for Sales Agent registration) ───────────────────
export type AgentType = ProcurementAgentType;

export type SkillCategory =
  | "Groceries"
  | "Hardware"
  | "Agriculture"
  | "Construction"
  | "Restaurant Supplies"
  | "Medical Supplies"
  | "Electronics"
  | "Fashion"
  | "Office Supplies"
  | "Automotive"
  | "Others";

export interface OrganizationInfo {
  invitationCode?: string;
  organizationName?: string;
}

export interface CoverageArea {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  serviceRadius?: ServiceRadius;
}

export interface PaymentMethod {
  method: "GCASH" | "MAYA" | "BANK";
  walletName?: string;
  accountNumber?: string;
}

export interface AgentRegistrationData {
  agentType?: ProcurementAgentType;
  personalInfo?: {
    fullName?: string;
    email?: string;
    contactNumber?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  organization?: OrganizationInfo;
  coverage?: CoverageArea;
  skills?: SkillCategory[];
  payment?: PaymentMethod;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface RegisterProcurementAgentResponse {
  success: boolean;
  userId?: string;
  agentId?: string;
  status?: AgentRegistrationStatus;
  message?: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  invitation?: ValidatedInvitation;
  error?: string;
}

export interface ApplicationStatus {
  status: AgentRegistrationStatus;
  stages: {
    accountCreated: boolean;
    profileComplete: boolean;
    documentsUploaded: boolean;
    identityVerified: boolean;
    organizationApproved: boolean;
    agentActivated: boolean;
  };
}

// ─── Organization Search ──────────────────────────────────────────────────────
export interface OrganizationSearchResult {
  id: string;
  name: string;
  type: OrganizationType;
  province: string;
  city: string;
  memberCount: number;
  logo?: string;
}