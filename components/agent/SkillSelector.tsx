"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { SkillCategory } from "@/types/agent";

interface SkillSelectorProps {
  selectedSkills: SkillCategory[];
  onChange: (skills: SkillCategory[]) => void;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  "Groceries",
  "Hardware",
  "Agriculture",
  "Construction",
  "Restaurant Supplies",
  "Medical Supplies",
  "Electronics",
  "Fashion",
  "Office Supplies",
  "Automotive",
  "Others",
];

export default function SkillSelector({
  selectedSkills,
  onChange,
}: SkillSelectorProps) {
  const toggleSkill = (skill: SkillCategory) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    onChange(newSkills);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-[#10231f]">
        Select your expertise areas
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SKILL_CATEGORIES.map((skill) => (
          <label
            key={skill}
            className="flex cursor-pointer items-center gap-3 rounded-xl
              border border-[#ded8cc] bg-white p-3.5
              transition hover:border-[#2f8f83]/50"
          >
            <Checkbox
              checked={selectedSkills.includes(skill)}
              onCheckedChange={() => toggleSkill(skill)}
            />
            <span className="text-sm font-medium text-[#10231f]">
              {skill}
            </span>
          </label>
        ))}
      </div>

      {selectedSkills.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""}{" "}
          selected
        </p>
      )}
    </div>
  );
}