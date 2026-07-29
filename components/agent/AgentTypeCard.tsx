"use client";

import { motion } from "framer-motion";
import { Store, Users } from "lucide-react";
import { ProcurementAgentType } from "@/types/agent";

interface AgentTypeCardProps {
  type: ProcurementAgentType;
  isSelected: boolean;
  onSelect: (type: ProcurementAgentType) => void;
}

export default function AgentTypeCard({ type, isSelected, onSelect }: AgentTypeCardProps) {
  const isIndependent = type === "INDEPENDENT";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(type)}
      className={`
        cursor-pointer rounded-2xl border-2 p-6 transition-all
        ${isSelected
          ? "border-[#2f8f83] bg-[#f8faf9]"
          : "border-[#ded8cc] bg-white hover:border-[#2f8f83]/50"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`
          flex h-12 w-12 items-center justify-center rounded-xl
          ${isSelected ? "bg-[#2f8f83]" : "bg-[#e2e8f0]"}
        `}>
          {isIndependent ? (
            <Store className={`h-6 w-6 ${isSelected ? "text-white" : "text-[#66706b]"}`} />
          ) : (
            <Users className={`h-6 w-6 ${isSelected ? "text-white" : "text-[#66706b]"}`} />
          )}
        </div>

        <div>
          <h3 className={`
            text-lg font-bold
            ${isSelected ? "text-[#2f8f83]" : "text-[#10231f]"}
          `}>
            {isIndependent ? "Independent Agent" : "Organization Agent"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#66706b]">
            {isIndependent
              ? "Purchase products directly from verified suppliers for your own business or resale."
              : "Purchase products on behalf of your registered organization, cooperative, company, school, church, or LGU from verified suppliers."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}