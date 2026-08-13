"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShowcase from "@/components/auth/AuthShowcase";
import {
  Building2, Mail, Phone, Lock, Eye, EyeOff, ChevronDown, MapPin, Upload, Loader2, CheckCircle2
} from "lucide-react";

// --- TYPES ---
interface UploadCardProps {
  title: string;
  subtext: string;
  file: File | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    // Account Info
    company_name: "",
    contact_person: "",
    email: "",
    contact_number: "",
    password: "",
    confirmPassword: "",
    // Company Details
    business_type: "Manufacturer",
    category: "Food",
    address: "",
    city: "",
    province: "",
    zip_code: "",
    min_order_value: "",
    delivery_areas: "",
    description: "",
    // Documents
    sec_dti_reg: null as File | null,
    bir_2303: null as File | null,
    catalog: null as File | null,
    agreed_to_terms: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!formData.agreed_to_terms) {
      alert("You must agree to the Supplier Agreement.");
      return;
    }

    setLoading(true);
    const data = new FormData();

    // Mapping fields to match typical Django backend expectations
    data.append("full_name", formData.contact_person);
    data.append("email", formData.email);
    data.append("contact_number", formData.contact_number);
    data.append("password", formData.password);
    data.append("role", "SUPPLIER");

    const supplierDetails = {
      company_name: formData.company_name,
      business_type: formData.business_type,
      category: formData.category,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      zip_code: formData.zip_code,
      min_order_value: formData.min_order_value,
      delivery_areas: formData.delivery_areas,
      description: formData.description,
    };
    data.append("supplier_details", JSON.stringify(supplierDetails));

    if (formData.sec_dti_reg) data.append("sec_dti_reg", formData.sec_dti_reg);
    if (formData.bir_2303) data.append("bir_2303", formData.bir_2303);
    if (formData.catalog) data.append("catalog", formData.catalog);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        const err = await response.json();
        alert("Registration Error: " + JSON.stringify(err));
      }
    } catch (error) {
      alert("Connection to server failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:flex">
      <AuthShowcase variant="supplier" />

      <div className="flex min-h-screen w-full items-center justify-center px-3 py-4 sm:px-4 lg:w-1/2 lg:px-6">
        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="w-full max-w-115">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h1 className="text-lg font-serif font-bold text-[#0f172a] sm:text-xl">Supplier Registration</h1>
            <p className="mt-1.5 text-sm text-slate-500">Step {step} of 3</p>

            {/* PROGRESS BAR */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full ${step >= i ? "bg-[#2f8f83]" : "bg-slate-200"}`} />
              ))}
            </div>

            {/* STEP 1: ACCOUNT INFO */}
            {step === 1 && (
              <div className="mt-5 space-y-3.5">
                <Input label="Company Name *" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. AgriTrade Corp" />
                <Input label="Contact Person *" name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Full Name" />
                <Input label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={16}/>} />
                <Input label="Phone Number" name="contact_number" value={formData.contact_number} onChange={handleChange} icon={<Phone size={16}/>} />
                <div className="relative">
                  <Input label="Password *" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} icon={<Lock size={16}/>} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <Input label="Confirm Password *" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} icon={<Lock size={16}/>} />
                <button type="button" onClick={nextStep} className="w-full rounded-lg bg-[#2f8f83] py-2.5 font-semibold text-white transition hover:bg-[#26776d]">Continue →</button>
              </div>
            )}

            {/* STEP 2: COMPANY DETAILS */}
            {step === 2 && (
              <div className="mt-5 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                   <Select label="Business Type *" name="business_type" value={formData.business_type} onChange={handleChange} options={["Manufacturer", "Distributor", "Wholesaler", "Importer"]} />
                   <Select label="Product Category *" name="category" value={formData.category} onChange={handleChange} options={["Food", "Beverages", "Groceries", "Household"]} />
                </div>
                <Input label="Company Address *" name="address" value={formData.address} onChange={handleChange} icon={<MapPin size={16}/>} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City *" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="Province" name="province" value={formData.province} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Min. Order (₱)" name="min_order_value" value={formData.min_order_value} onChange={handleChange} />
                  <Input label="ZIP Code" name="zip_code" value={formData.zip_code} onChange={handleChange} />
                </div>
                <Input label="Delivery Areas" name="delivery_areas" value={formData.delivery_areas} onChange={handleChange} placeholder="Metro Manila, etc." />
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Tell us about your company..." className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-[#2f8f83]" />
                <div className="flex gap-3">
                  <button type="button" onClick={prevStep} className="flex-1 rounded-lg border py-2.5 text-sm">Back</button>
                  <button type="button" onClick={nextStep} className="flex-1 rounded-lg bg-[#2f8f83] py-2.5 text-sm font-semibold text-white">Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 3: DOCUMENTS */}
            {step === 3 && (
              <div className="mt-5 space-y-4">
                <UploadCard title="SEC / DTI Certificate" subtext="JPG, PNG, PDF up to 5MB" file={formData.sec_dti_reg} onChange={(e) => handleFileChange(e, "sec_dti_reg")} />
                <UploadCard title="BIR Form 2303" subtext="JPG, PNG, PDF up to 5MB" file={formData.bir_2303} onChange={(e) => handleFileChange(e, "bir_2303")} />
                <UploadCard title="Catalog (Optional)" subtext="PDF, XLSX up to 10MB" file={formData.catalog} onChange={(e) => handleFileChange(e, "catalog")} />
                
                <label className="flex items-start gap-2.5 rounded-xl border p-3 bg-slate-50">
                  <input type="checkbox" name="agreed_to_terms" checked={formData.agreed_to_terms} onChange={handleChange} className="mt-1 h-4 w-4" />
                  <span className="text-xs text-slate-500 leading-tight">I agree to the Supplier Agreement and confirm information is accurate.</span>
                </label>

                <div className="flex gap-3">
                  <button type="button" onClick={prevStep} className="flex-1 rounded-lg border py-2.5">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 flex justify-center items-center rounded-lg bg-[#2f8f83] text-white font-semibold">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit"}
                  </button>
                </div>
              </div>
            )}

            {/* LINKS */}
            <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
              <p>Already a Supplier? <Link href="/login" className="font-bold text-[#2f8f83]">Log In</Link></p>
              <p>Want to sell directly? <Link href="/register/store-seller" className="font-bold text-[#2f8f83]">Register as Store Seller</Link></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function Input({ label, icon, ...props }: any) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-800">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input {...props} className={`w-full rounded-lg border border-slate-300 py-2.5 ${icon ? 'pl-10' : 'px-3'} text-sm focus:border-[#2f8f83] outline-none`} />
      </div>
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-800">{label}</label>
      <div className="relative">
        <select {...props} className="w-full appearance-none rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-[#2f8f83]">
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
      </div>
    </div>
  );
}

function UploadCard({ title, subtext, file, onChange }: UploadCardProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700">{title}</label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#fcfcfb] py-4 hover:bg-slate-50">
        <input type="file" hidden onChange={onChange} />
        {file ? (
          <div className="flex items-center gap-2 text-[#2f8f83] text-sm font-medium">
            <CheckCircle2 size={18} /> {file.name.substring(0, 20)}...
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 text-slate-400" />
            <p className="mt-1 text-xs text-slate-500">Upload {subtext}</p>
          </>
        )}
      </label>
    </div>
  );
}