"use client";

import { useState, ChangeEvent } from "react";
import { Upload, CheckCircle2, X, FileText } from "lucide-react";
import { SupportedID } from "@/types/agent";

interface UploadCardProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  acceptedTypes?: string;
}

const SUPPORTED_IDS: { value: SupportedID; label: string }[] = [
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVER_LICENSE", label: "Driver's License" },
  { value: "PHILHEALTH", label: "PhilHealth" },
  { value: "PRC", label: "PRC" },
  { value: "SSS", label: "SSS" },
  { value: "TIN", label: "TIN" },
];

export default function UploadCard({
  label,
  file,
  onChange,
}: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    onChange(selectedFile);
  };

  const handleRemove = () => {
    onChange(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-[#10231f]">
        {label}
      </label>

      <div className="relative">
        <label
          className={`
            flex cursor-pointer flex-col items-center justify-center rounded-xl
            border-2 border-dashed py-8 transition
            ${file
              ? "border-[#2f8f83] bg-[#f8faf9]"
              : "border-slate-300 bg-white hover:border-slate-400"
            }
          `}
        >
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />

          {isUploading ? (
            <div className="w-full px-4">
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-[#2f8f83] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : file ? (
            <div className="flex items-center gap-2 text-[#2f8f83]">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-sm font-medium">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove();
                }}
                className="ml-2 rounded-full p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs text-slate-500">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                PNG, JPG, PDF up to 5MB
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}

// Supported IDs section component
export function SupportedIDsSection() {
  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-[#10231f]">Supported IDs</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SUPPORTED_IDS.map((id) => (
          <div
            key={id.value}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <FileText className="h-4 w-4 text-[#2f8f83]" />
            <span className="text-xs text-slate-600">{id.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}