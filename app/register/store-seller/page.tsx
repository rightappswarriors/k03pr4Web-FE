"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShowcase from "@/components/auth/AuthShowcase";
import {
  Mail, Phone, Lock, Eye, EyeOff, ChevronDown, MapPin, Upload, Loader2, CheckCircle2
} from "lucide-react";

// --- TYPES FOR PROPS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode; // Optional icon
}

interface FileUploadProps {
  label: string;
  file: File | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function StoreSellerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    password: "",
    confirmPassword: "",
    store_name: "",
    category: "Bakery & Pastries",
    address: "",
    city: "",
    province: "",
    zip_code: "",
    description: "",
    business_permit: null as File | null,
    dti_sec_registration: null as File | null,
  });

  // Fixed 'e' type error
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fixed 'e' and 'fieldName' type error
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("full_name", formData.full_name);
    data.append("email", formData.email);
    data.append("contact_number", formData.contact_number);
    data.append("password", formData.password);
    data.append("role", "SELLER");

    const storeDetails = {
      store_name: formData.store_name,
      category: formData.category,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      zip_code: formData.zip_code,
      description: formData.description,
    };
    data.append("store_details", JSON.stringify(storeDetails));

    if (formData.business_permit) data.append("business_permit", formData.business_permit);
    if (formData.dti_sec_registration) data.append("dti_sec_registration", formData.dti_sec_registration);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        const errorData = await response.json();
        alert("Registration Failed: " + JSON.stringify(errorData));
      }
    } catch (err) {
      alert("Server error. Check if Django is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:flex">
      <AuthShowcase variant="seller" />

      <div className="flex min-h-screen w-full items-center justify-center px-3 py-4 sm:px-4 lg:w-1/2 lg:px-6">
        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="w-full max-w-115">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h1 className="text-lg font-serif font-bold text-[#0f172a] sm:text-xl">Store Seller Registration</h1>
            <p className="mt-1.5 text-sm text-slate-500">Step {step} of 3</p>

            {/* PROGRESS BAR */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full ${step >= i ? "bg-[#2f8f83]" : "bg-slate-200"}`} />
              ))}
            </div>

            {step === 1 && (
              <div className="mt-5 space-y-3.5">
                <Input label="Store Name *" name="store_name" value={formData.store_name} onChange={handleChange} />
                <Input label="Owner Full Name *" name="full_name" value={formData.full_name} onChange={handleChange} />
                <Input icon={<Mail size={16}/>} label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} />
                <div className="relative">
                  <Input icon={<Lock size={16}/>} label="Password *" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <Input icon={<Lock size={16}/>} label="Confirm Password *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                <button type="button" onClick={nextStep} className="w-full rounded-lg bg-[#2f8f83] py-2.5 font-semibold text-white">Continue →</button>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Store Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm">
                    <option>Bakery & Pastries</option>
                    <option>Groceries</option>
                  </select>
                </div>
                <Input icon={<MapPin size={16}/>} label="Store Address *" name="address" value={formData.address} onChange={handleChange} />
                <div className="flex gap-3">
                  <button type="button" onClick={prevStep} className="flex-1 rounded-lg border py-2.5">Back</button>
                  <button type="button" onClick={nextStep} className="flex-1 rounded-lg bg-[#2f8f83] py-2.5 text-white">Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 space-y-4">
                <FileUpload label="Business Permit" file={formData.business_permit} onChange={(e) => handleFileChange(e, "business_permit")} />
                <FileUpload label="DTI / SEC Registration" file={formData.dti_sec_registration} onChange={(e) => handleFileChange(e, "dti_sec_registration")} />
                <div className="flex gap-3">
                  <button type="button" onClick={prevStep} className="flex-1 rounded-lg border py-2.5">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#2f8f83] py-2.5 text-white rounded-lg">
                    {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Submit"}
                  </button>
                </div>
              </div>
            )}


            {/* LINKS */}
            <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
              <p>Already a Seller? <Link href="/login" className="font-bold text-[#2f8f83]">Log In</Link></p>
              <p>Want to supply directly? <Link href="/register/supplier" className="font-bold text-[#2f8f83]">Register as B2B Supplier</Link></p>
            </div>


          </div>
        </form>
      </div>
    </div>
  );
}

// --- FIXED HELPER COMPONENTS WITH TYPES ---

function Input({ label, icon, ...props }: InputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-800">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input {...props} className={`w-full rounded-lg border border-slate-300 py-2.5 ${icon ? 'pl-10' : 'px-3'} text-sm focus:border-[#2f8f83] outline-none`} />
      </div>
    </div>
  );
}

function FileUpload({ label, file, onChange }: FileUploadProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-900">{label}</label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-6">
        <input type="file" hidden onChange={onChange} />
        {file ? (
          <div className="flex items-center gap-2 text-[#2f8f83]">
            <CheckCircle2 size={24} />
            <span className="text-sm">{file.name}</span>
          </div>
        ) : (
          <Upload className="h-7 w-7 text-slate-400" />
        )}
      </label>
    </div>
  );
}