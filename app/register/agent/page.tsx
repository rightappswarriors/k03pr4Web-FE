"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Shield,
  FileText,
  ClipboardList,
  Package,
} from "lucide-react";
import AuthShowcase from "@/components/auth/AuthShowcase";
import OnboardingStepper from "@/components/agent/OnboardingStepper";
import { Checkbox } from "@/components/ui/Checkbox";
import Image from "next/image";
import { registerAgent, validateInvitation } from "@/services/agent.service";

import {
  ProcurementAgentType,
  ProcurementCategory,
  ExperienceLevel,
  Gender,
  ValidateInvitationResponse,
  ApplicationStatus,
} from "@/types/agent";

// ─── Step enum ─────────────────────────────────────────────────────
enum RegistrationStep {
  ACCOUNT = 1,
  AGENT_TYPE = 2,
  INVITATION = 3,
  PERSONAL_INFO = 4,
  VERIFICATION = 5,
  PREFERENCES = 6,
  REVIEW = 7,
}

// ─── Categories ─────────────────────────────────────────────────────
const PROCUREMENT_CATEGORIES: ProcurementCategory[] = [
  "CONSTRUCTION",
  "OFFICE_SUPPLIES",
  "AGRICULTURE",
  "FOOD",
  "MEDICAL",
  "AUTOMOTIVE",
  "ELECTRONICS",
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["BEGINNER", "INTERMEDIATE", "PROFESSIONAL"];

export default function ProcurementAgentRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.ACCOUNT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  // Form state
  const [form, setForm] = useState({
    // Step 1: Account
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    // Step 2: Agent Type
    agentType: "" as ProcurementAgentType,
    // Step 3: Invitation
    invitationCode: "",
    validatedInvitation: null as ValidateInvitationResponse["invitation"] | null,
    // Step 4: Personal Info
    dateOfBirth: "",
    gender: "",
    address: "",
    civilStatus: "",
    emergencyContact: "",
    emergencyPhone: "",
    // Step 5: Verification
    primaryIdFront: null as File | null,
    primaryIdBack: null as File | null,
    selfie: null as File | null,
    tin: null as File | null,
    nbi: null as File | null,
    policeClearance: null as File | null,
    // Step 6: Preferences
    categories: [] as ProcurementCategory[],
    experienceLevel: "" as ExperienceLevel,
    // Agreements
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketplace: false,
    
  });

  const fieldClass =
    "h-12 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] pl-11 pr-4 text-sm text-[#10231f] outline-none transition focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10";

  // Navigation
  const nextStep = () => {
    if (step < RegistrationStep.REVIEW) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > RegistrationStep.ACCOUNT) {
      setStep(step - 1);
    }
  };

  // Step validation
  const validateStep = () => {
    switch (step) {
      case RegistrationStep.ACCOUNT:
        if (!form.fullName || !form.email || !form.mobileNumber || !form.password) {
          return "Please complete all required fields.";
        }
        if (form.mobileNumber.length !== 11) {
          return "Mobile number must be exactly 11 digits.";
        }
        if (form.password !== form.confirmPassword) {
          return "Passwords do not match.";
        }
        break;
      case RegistrationStep.PERSONAL_INFO:
        if (!form.dateOfBirth || !form.gender || !form.address) {
          return "Please complete all required fields.";
        }
        break;
      case RegistrationStep.VERIFICATION:
        if (!form.primaryIdFront || !form.primaryIdBack || !form.selfie) {
          return "Government ID and Selfie are required.";
        }
        break;
      case RegistrationStep.PREFERENCES:
        if (form.categories.length === 0) {
          return "Please select at least one procurement category.";
        }
        if (!form.experienceLevel) {
          return "Please select your experience level.";
        }
        break;
      case RegistrationStep.REVIEW:
        if (!form.agreeToTerms || !form.agreeToPrivacy || !form.agreeToMarketplace) {
          return "Please agree to all terms and policies.";
        }
        break;
    }
    return null;
  };

  // Validate invitation with real API

  const submitRegistration = async () => {
    setIsSubmitting(true);

    // Build documents array from uploaded files
    const documents: Array<{ type: string; fileUrl: string }> = [];

    // In real implementation, files would be uploaded first and we'd get URLs
    // For now, we simulate URLs
    if (form.primaryIdFront) documents.push({ type: "GOVERNMENT_ID_FRONT", fileUrl: `uploaded_${Date.now()}_front` });
    if (form.primaryIdBack) documents.push({ type: "GOVERNMENT_ID_BACK", fileUrl: `uploaded_${Date.now()}_back` });
    if (form.selfie) documents.push({ type: "SELFIE_WITH_ID", fileUrl: `uploaded_${Date.now()}_selfie` });
    if (form.tin) documents.push({ type: "TIN", fileUrl: `uploaded_${Date.now()}_tin` });
    if (form.nbi) documents.push({ type: "NBI_CLEARANCE", fileUrl: `uploaded_${Date.now()}_nbi` });
    if (form.policeClearance) documents.push({ type: "POLICE_CLEARANCE", fileUrl: `uploaded_${Date.now()}_police` });

    try {
      const result = await registerAgent({
        fullName: form.fullName,
        email: form.email,
        mobileNumber: form.mobileNumber,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as "MALE" | "FEMALE" | "OTHER",
        address: form.address,
        city: "",
        province: "",
        zipCode:  "",
        civilStatus: form.civilStatus as any,
        emergencyContact: form.emergencyContact,
        agentType: form.agentType,
        invitationCode: form.invitationCode || undefined,
        documents,
        interestedIndustries: form.categories,
        experienceLevel: form.experienceLevel,
      });

      if (!result.success) {
        alert(result.error || "Registration failed");
        return;
      }

      setRegistrationComplete(true);
      setApplicationStatus({
        status: form.agentType === "ORGANIZATION"
          ? "PENDING_ORGANIZATION_APPROVAL"
          : "PENDING_VERIFICATION",
        stages: {
          accountCreated: true,
          profileComplete: true,
          documentsUploaded: true,
          identityVerified: false,
          organizationApproved: false,
          agentActivated: false,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case RegistrationStep.ACCOUNT:
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                <input
                  type="tel"
                  placeholder="09123456789"
                  value={form.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 11) {
                      setForm({ ...form, mobileNumber: value });
                    }
                  }}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                  <input
                    type="password"
                    placeholder="Create password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case RegistrationStep.AGENT_TYPE:
        return (
          <div className="space-y-4">
            <p className="text-sm font-bold text-[#10231f]">
              Select your procurement agent type:
            </p>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, agentType: "INDEPENDENT", validatedInvitation: null });
                  nextStep();
                }}
                className={`
                  rounded-xl border-2 p-5 text-left transition-all
                  ${form.agentType === "INDEPENDENT"
                    ? "border-[#2f8f83] bg-[#f8faf9]"
                    : "border-[#ded8cc] bg-white hover:border-[#2f8f83]/30"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-lg
                    ${form.agentType === "INDEPENDENT" ? "bg-[#2f8f83]" : "bg-[#e8e6e1]"}
                  `}>
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#10231f]">Independent Procurement Agent</p>
                    <p className="mt-1 text-sm text-[#66706b]">
                      Purchase products directly without organizational affiliation
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, agentType: "ORGANIZATION" });
                  nextStep();
                }}
                className={`
                  rounded-xl border-2 p-5 text-left transition-all
                  ${form.agentType === "ORGANIZATION"
                    ? "border-[#2f8f83] bg-[#f8faf9]"
                    : "border-[#ded8cc] bg-white hover:border-[#2f8f83]/30"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-lg
                    ${form.agentType === "ORGANIZATION" ? "bg-[#2f8f83]" : "bg-[#e8e6e1]"}
                  `}>
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#10231f]">Organization Procurement Agent</p>
                    <p className="mt-1 text-sm text-[#66706b]">
                      Join an existing organization as a procurement agent
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case RegistrationStep.INVITATION:
        if (form.agentType !== "ORGANIZATION") {
          nextStep();
          return null;
        }
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Invitation Code
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                <input
                  type="text"
                  placeholder="Enter invitation code"
                  value={form.invitationCode}
                  onChange={(e) => setForm({ ...form, invitationCode: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>

            {form.validatedInvitation && (
              <div className="rounded-xl border border-[#ded8cc] bg-white p-5">
                <div className="flex items-center gap-4">
                  {form.validatedInvitation.orgLogo && (
                    <Image
                      src={form.validatedInvitation.orgLogo}
                      alt={form.validatedInvitation.orgName}
                      width={60}
                      height={60}
                      className="rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-[#10231f]">
                      {form.validatedInvitation.orgName}
                    </p>
                    <p className="mt-1 text-sm text-[#66706b]">
                      {form.validatedInvitation.orgIndustry}
                    </p>
                    <p className="mt-2 text-xs text-[#66706b]">
                      Invited for: {form.validatedInvitation.invitedPositionName}
                    </p>
                    <p className="text-xs text-[#66706b]">
                      Expires: {form.validatedInvitation.expiresAt}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={prevStep}
                    className="flex-1 rounded-xl border border-[#ded8cc] py-2.5 text-sm font-medium text-[#10231f]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setForm({ ...form, invitationCode: "" });
                      nextStep();
                    }}
                    className="flex-1 rounded-xl bg-[#2f8f83] py-2.5 text-sm font-bold text-white"
                  >
                    Join Organization
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case RegistrationStep.PERSONAL_INFO:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Birthday
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                  className="h-12 w-full appearance-none rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 pr-10 text-sm text-[#10231f] outline-none transition focus:border-[#2f8f83] focus:bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Address
              </label>
              <input
                type="text"
                placeholder="Your complete address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Civil Status
              </label>
              <select
                value={form.civilStatus}
                onChange={(e) => setForm({ ...form, civilStatus: e.target.value })}
                className="h-12 w-full appearance-none rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 pr-10 text-sm text-[#10231f] outline-none transition focus:border-[#2f8f83] focus:bg-white"
              >
                <option value="">Select status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="WIDOWED">Widowed</option>
                <option value="SEPARATED">Separated</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Emergency Contact (Optional)
              </label>
              <input
                type="text"
                placeholder="Contact person name"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#10231f]">
                Emergency Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                <input
                  type="tel"
                  placeholder="Emergency contact number"
                  value={form.emergencyPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm({ ...form, emergencyPhone: value });
                  }}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>
        );

      case RegistrationStep.VERIFICATION:
        return (
          <div className="space-y-4">
            <p className="text-sm font-bold text-[#10231f]">
              Upload required documents:
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Government ID (Front) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, primaryIdFront: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Government ID (Back) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, primaryIdBack: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Selfie with ID *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, selfie: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-slate-600"
                />
              </div>
            </div>

            <p className="text-xs text-[#66706b]">
              Supported IDs: National ID, Passport, Driver's License, PRC, SSS, PhilHealth, TIN
            </p>

            <div className="border-t border-[#ded8cc] pt-4">
              <p className="mb-3 text-sm font-bold text-[#10231f]">
                Optional Documents:
              </p>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  TIN
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, tin: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-slate-600"
                />
              </div>

              <div className="mt-3">
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  NBI Clearance
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, nbi: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-slate-600"
                />
              </div>

              <div className="mt-3">
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Police Clearance
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, policeClearance: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-slate-600"
                />
              </div>
            </div>
          </div>
        );

      case RegistrationStep.PREFERENCES:
        return (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-bold text-[#10231f]">
                Industries Interested
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PROCUREMENT_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.categories.includes(cat)}
                      onCheckedChange={(c) => {
                        setForm((prev) => ({
                          ...prev,
                          categories: c
                            ? [...prev.categories, cat]
                            : prev.categories.filter((c) => c !== cat),
                        }));
                      }}
                    />
                    <span className="text-sm text-slate-600">
                      {cat.replace("_", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-bold text-[#10231f]">
                Experience Level
              </p>
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, experienceLevel: level })}
                    className={`
                      rounded-xl border px-3 py-2.5 text-sm font-medium transition
                      ${form.experienceLevel === level
                        ? "border-[#2f8f83] bg-[#2f8f83] text-white"
                        : "border-[#ded8cc] bg-white text-[#10231f]"
                      }
                    `}
                  >
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case RegistrationStep.REVIEW:
        return (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#ded8cc] bg-white p-5">
              <h3 className="font-bold text-[#10231f]">Account Summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="text-[#66706b]">Name:</span> {form.fullName}</p>
                <p><span className="text-[#66706b]">Email:</span> {form.email}</p>
                <p><span className="text-[#66706b]">Mobile:</span> {form.mobileNumber}</p>
                <p><span className="text-[#66706b]">Type:</span> {form.agentType === "INDEPENDENT" ? "Independent" : "Organization"}
                </p>
                {form.validatedInvitation && (
                  <p><span className="text-[#66706b]">Organization:</span> {form.validatedInvitation.orgName}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={form.agreeToTerms}
                  onCheckedChange={(c) => setForm({ ...form, agreeToTerms: !!c })}
                  className="mt-0.5"
                />
                <span className="text-xs text-slate-600">
                  I agree to the Terms and Conditions
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={form.agreeToPrivacy}
                  onCheckedChange={(c) => setForm({ ...form, agreeToPrivacy: !!c })}
                  className="mt-0.5"
                />
                <span className="text-xs text-slate-600">
                  I agree to the Privacy Policy
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={form.agreeToMarketplace}
                  onCheckedChange={(c) => setForm({ ...form, agreeToMarketplace: !!c })}
                  className="mt-0.5"
                />
                <span className="text-xs text-slate-600">
                  I agree to the Marketplace Agreement
                </span>
              </label>
            </div>
          </div>
        );
    }
  };

  // Calculate step number for stepper (skip invitation step for independent)
  const stepNumber = form.agentType === "ORGANIZATION" && step === RegistrationStep.INVITATION
    ? 3
    : step;

  // Header based on step
  const stepHeaders = {
    [RegistrationStep.ACCOUNT]: {
      title: "Create Account",
      subtitle: "Your account credentials for Kompra",
    },
    [RegistrationStep.AGENT_TYPE]: {
      title: "Choose Agent Type",
      subtitle: "Select how you want to use Kompra Wholesale",
    },
    [RegistrationStep.INVITATION]: {
      title: "Join Organization",
      subtitle: "Validate your invitation code",
    },
    [RegistrationStep.PERSONAL_INFO]: {
      title: "Personal Information",
      subtitle: "Complete your profile details",
    },
    [RegistrationStep.VERIFICATION]: {
      title: "Verification",
      subtitle: "Upload required identification documents",
    },
    [RegistrationStep.PREFERENCES]: {
      title: "Procurement Preferences",
      subtitle: "Let us know your interests and experience",
    },
    [RegistrationStep.REVIEW]: {
      title: "Review & Submit",
      subtitle: "Confirm your registration details",
    },
  };

  const currentStepIndex = Object.values(RegistrationStep).indexOf(step);
  const totalSteps = form.agentType === "ORGANIZATION" ? 7 : 6;

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-[#f6f4ee] lg:flex">
        <AuthShowcase variant="seller" />
        <main className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="rounded-[1.75rem] border border-[#ded8cc] bg-white p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f7f5]">
                <Check className="h-10 w-10 text-[#2f8f83]" />
              </div>

              <h2 className="text-2xl font-black text-[#10231f]">
                Registration Complete!
              </h2>

              <p className="mt-3 text-sm text-[#66706b]">
                {applicationStatus?.status === "PENDING_ORGANIZATION_APPROVAL"
                  ? "Your application is pending organization approval."
                  : "Your documents are being reviewed."
                }
              </p>

              {applicationStatus && (
                <div className="mt-6 space-y-2 text-left">
                  <p className="text-sm">
                    <span className="text-[#66706b]">Status:</span>{" "}
                    <span className="font-semibold text-[#10231f]">
                      {applicationStatus.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={() => router.push("/login")}
                className="mt-8 rounded-xl bg-[#2f8f83] px-6 py-3 font-bold text-white"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ee] lg:flex">
      <AuthShowcase variant="seller" />

      <main className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-xl">
          {/* Logo for mobile */}
          <div className="mb-8 lg:hidden">
            <img src="/img/green_logo.png" alt="Kompra.ph" className="h-12 w-auto" />
          </div>

          <section className="rounded-[1.75rem] border border-[#ded8cc] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
            {/* Header */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
                Procurement Agent Registration
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#10231f]">
                {stepHeaders[step].title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#66706b]">
                {stepHeaders[step].subtitle}
              </p>
            </div>

            {/* Stepper */}
            <div className="mt-6">
              <OnboardingStepper currentStep={stepNumber} totalSteps={totalSteps} />
            </div>

            {/* Form Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-3">
              {step > RegistrationStep.ACCOUNT && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-[#ded8cc] bg-white py-3 text-sm font-medium text-[#10231f] transition hover:bg-[#f7f7f5] disabled:opacity-50"
                >
                  Back
                </button>
              )}

              {step < RegistrationStep.REVIEW && (
                <button
                  type="button"
                  onClick={() => {
                    const error = validateStep();
                    if (error) {
                      alert(error);
                      return;
                    }
                    nextStep();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#2f8f83] py-3 text-sm font-bold text-white transition hover:bg-[#26776d] disabled:opacity-50"
                >
                  Continue
                </button>
              )}

              {step === RegistrationStep.REVIEW && (
                <button
                  type="button"
                  onClick={() => {
                    const error = validateStep();
                    if (error) {
                      alert(error);
                      return;
                    }
                    submitRegistration();
                  }}
                  disabled={isSubmitting || !form.agreeToTerms || !form.agreeToPrivacy || !form.agreeToMarketplace}
                  className="flex-1 rounded-xl bg-[#2f8f83] py-3 text-sm font-bold text-white transition hover:bg-[#26776d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}