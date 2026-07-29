"use client";

import { AgentRegistrationData, AgentType, SkillCategory } from "@/types/agent";
import { Store, Users, MapPin, CreditCard } from "lucide-react";

interface ReviewCardProps {
  data: Partial<AgentRegistrationData>;
}

export default function ReviewCard({ data }: ReviewCardProps) {
  const {
    agentType,
    personalInfo,
    organization,
    coverage,
    skills,
    payment,
  } = data;

  return (
    <div className="space-y-5">
      {/* Agent Type */}
      {agentType && (
        <div className="rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            {agentType === "INDEPENDENT" ? (
              <Store className="h-4 w-4 text-[#2f8f83]" />
            ) : (
              <Users className="h-4 w-4 text-[#2f8f83]" />
            )}
            <h3 className="font-bold text-[#10231f]">Agent Type</h3>
          </div>
          <p className="text-sm text-slate-600">
            {agentType === "INDEPENDENT" ? "Independent Agent" : "Organization Agent"}
          </p>
        </div>
      )}

      {/* Organization Info */}
      {agentType === "ORGANIZATION" && organization && (
        <div className="rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-[#2f8f83]" />
            <h3 className="font-bold text-[#10231f]">Organization</h3>
          </div>
          {organization.invitationCode && (
            <p className="text-sm text-slate-600">
              Invitation Code: {organization.invitationCode}
            </p>
          )}
          {organization.organizationName && (
            <p className="text-sm text-slate-600">
              Organization: {organization.organizationName}
            </p>
          )}
        </div>
      )}

      {/* Personal Info */}
      {personalInfo && (
        <div className="rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-[#2f8f83]" />
            <h3 className="font-bold text-[#10231f]">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <p className="text-sm">
              <span className="text-slate-500">Name:</span>{" "}
              <span className="text-slate-600">{personalInfo.fullName}</span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Email:</span>{" "}
              <span className="text-slate-600">{personalInfo.email}</span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Phone:</span>{" "}
              <span className="text-slate-600">{personalInfo.contactNumber}</span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Gender:</span>{" "}
              <span className="text-slate-600">{personalInfo.gender}</span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Birthday:</span>{" "}
              <span className="text-slate-600">{personalInfo.dateOfBirth}</span>
            </p>
          </div>
        </div>
      )}

      {/* Coverage Area */}
      {coverage && (
        <div className="rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#2f8f83]" />
            <h3 className="font-bold text-[#10231f]">Coverage Area</h3>
          </div>
          <p className="text-sm text-slate-600">
            {[coverage.region, coverage.province, coverage.city, coverage.barangay]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Service Radius: {coverage.serviceRadius}km
          </p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-[#2f8f83]" />
            <h3 className="font-bold text-[#10231f]">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[#f0f9f7] px-2.5 py-1 text-[10px] font-medium text-[#2f8f83]"
              >
                {skill.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment */}
      {payment && (
        <div className="rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#2f8f83]" />
            <h3 className="font-bold text-[#10231f]">Payment Method</h3>
          </div>
          <p className="text-sm text-slate-600">
            {payment.method === "GCASH"
              ? "GCash"
              : payment.method === "MAYA"
              ? "Maya"
              : "Bank"}
          </p>
          {payment.walletName && (
            <p className="mt-1 text-sm text-slate-500">
              {payment.walletName} - {payment.accountNumber}
            </p>
          )}
        </div>
      )}
    </div>
  );
}