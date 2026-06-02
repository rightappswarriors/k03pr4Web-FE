"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Clock3,
  Package,
  Camera,
  Pencil,
  X,
  ShoppingBag,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import RecentOrders from "@/components/profile/RecentOrders";


type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  profileImage?: string;
};

type OrderItem = {
  id: number;
  transactionnumber: string;
  date: string;
  total: number; // ✅ FIX (was string)
  status: "Delivered" | "Pending" | "Processing" | "Cancelled";
  items: any[];

  // ✅ ADD THESE
  subtotal: number;
  delivery_fee: number;
  order_type: "DELIVERY" | "PICKUP";
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

   const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);

      const token = localStorage.getItem("access");

      // ✅ FIX 1: prevent infinite loading if no token
      if (!token) {
        console.warn("No token found");
        setLoadingOrders(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ FIX 2: stop loading if request fails
        if (!res.ok) {
          console.error("Failed to fetch orders");
          setLoadingOrders(false);
          return;
        }

        const data = await res.json();

        console.log("Orders API response:", data); // 🔍 DEBUG (you can remove later)

        // 🔥 transform backend data → frontend format
        const formattedOrders: OrderItem[] = data.map((order: any) => ({
          id: order.id, // ✅ numeric (for cancel API)
          transactionnumber: order.transactionnumber, // ✅ for display

          date: new Date(order.createdat).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
          }),

          total: order.total,
          status: mapStatus(order.status),
          items: order.items,

          subtotal: order.subtotal,
          delivery_fee: order.delivery_fee,
          order_type: order.order_type,
        }));

        setOrders(formattedOrders);

        const totalOrders = data.length;

        const pendingOrders = data.filter((order: any) =>
          ["pending", "confirmed", "preparing"].includes(
            order.status?.toLowerCase()
          )
        ).length;

        setStats({
          orders: totalOrders,
          wishlist: 0,
          pending: pendingOrders,
        });

        setLoadingOrders(false);

      } catch (err) {
        console.error("Fetch orders error:", err);

        // ✅ FIX 3: stop loading on error
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);


  const mapStatus = (
    status: string
  ): "Delivered" | "Pending" | "Processing" | "Cancelled" => {
    const s = status.toLowerCase();

    if (["completed", "delivered", "received"].includes(s)) {
      return "Delivered";
    }

    if (s === "pending") {
      return "Pending";
    }

    if (s === "cancelled") {
      return "Cancelled"; 
    }

    return "Processing";
  };


  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    profileImage: "",
  });

  const [formData, setFormData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access");

      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update-profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch profile");
          return;
        }

        const data = await res.json();
        console.log("PROFILE API:", data);

        const userProfile: ProfileData = {
          fullName: data.full_name,
          email: data.email,
          phone: data.contact_number,
          birthday: data.date_of_birth,
          gender: data.gender,
          profileImage: data.profile_image || "",
        };

        setProfile(userProfile);
        setFormData(userProfile);

      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const formatBirthday = (value: string) => {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        }).format(date);
      }
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }).format(parsed);
    }

    return value;
  };

  const recentOrders = orders;

  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    pending: 0,
  });

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((name) => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const saveUserToLocalStorage = (updatedFields: Partial<ProfileData>) => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        ...user,
        ...updatedFields,
      })
    );
  };


  const handleCancelOrder = (orderId: number) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };


  const confirmCancelOrder = async () => {
    if (!cancelOrderId) return;

    const token = localStorage.getItem("access");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    try {
      setCancellingOrderId(cancelOrderId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${cancelOrderId}/cancel/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to cancel order.");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === cancelOrderId
            ? { ...order, status: "Cancelled" }
            : order
        )
      );

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setCancellingOrderId(null);
      setShowCancelModal(false);
      setCancelOrderId(null);
    }
  };


  const handleOpenEdit = () => {
    setFormData(profile);
    setIsEditOpen(true);
  };

  const handleSaveProfile = () => {
    setProfile(formData);
    saveUserToLocalStorage({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      birthday: formData.birthday,
      gender: formData.gender,
      profileImage: formData.profileImage || "",
    });
    setIsEditOpen(false);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const uploadProfileImage = async (file: File) => {
  const token = localStorage.getItem("access");

  if (!token) {
    console.error("No token found");
    return;
  }

  const formData = new FormData();
    formData.append("profile_image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update-profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed:", data);
        return;
      }

      // ✅ update UI with backend image
      setProfile((prev) => ({
        ...prev,
        profileImage: data.profile_image || "",
      }));

    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

     
    uploadProfileImage(file); 
    event.target.value = "";
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const openCamera = async () => {
    setCameraError("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera is not supported on this device/browser.");
        setIsCameraOpen(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraStream(stream);
      setIsImageMenuOpen(false);
      setIsCameraOpen(true);
    } catch (error) {
      setCameraError("Unable to access camera. Please allow camera permission.");
      setIsImageMenuOpen(false);
      setIsCameraOpen(true);
    }
  };


  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;

      videoRef.current
        .play()
        .then(() => {})
        .catch(() => {
          setCameraError("Unable to display camera preview.");
        });
    }
  }, [isCameraOpen, cameraStream]);



  const closeCamera = () => {
    stopCamera();
    setCameraStream(null);
    setIsCameraOpen(false);
    setCameraError("");
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;
    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL("image/png");
    const file = dataURLtoFile(imageBase64, "profile.png");

    uploadProfileImage(file);

    closeCamera();
  };

  const handleDeleteImage = () => {
    setProfile((prev) => ({
      ...prev,
      profileImage: "",
    }));

    setFormData((prev) => ({
      ...prev,
      profileImage: "",
    }));

    saveUserToLocalStorage({
      profileImage: "",
    });

    setIsImageMenuOpen(false);
  };

  const infoItems = [
    {
      icon: User,
      label: "Full Name",
      value: profile.fullName,
    },
    {
      icon: Mail,
      label: "Email",
      value: profile.email,
    },
    {
      icon: Phone,
      label: "Phone",
      value: profile.phone,
    },
    {
      icon: Calendar,
      label: "Birthday",
      value: formatBirthday(profile.birthday),
    },
    {
      icon: User,
      label: "Gender",
      value: profile.gender,
    },
  ];


  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };


  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />

      <section className="pb-12">
        <div className="h-37.5 w-full bg-[#2f8f83] sm:h-45 md:h-52.5" />

        <div className="container-shell -mt-14 sm:-mt-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                <div className="relative shrink-0">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#3a9688] text-3xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsImageMenuOpen(true)}
                    className="absolute bottom-1 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#de922f] text-white shadow-md transition hover:scale-105 hover:bg-[#c98020]"
                  >
                    <Camera className="h-4 w-4" />
                  </button>

                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </div>

                <div className="mt-12 text-center sm:mt-14 sm:text-left md:mt-16">
                  <h1 className="text-2xl font-bold text-brand-blue sm:text-3xl">
                    {profile.fullName || "Your Name"}
                  </h1>
                  <p className="text-sm text-slate-500 sm:text-base">
                    {profile.email || "your@email.com"}
                  </p>
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#de922f] hover:bg-[#de922f] hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* --- STATS --- */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf7f4] text-[#2f8f83]">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-blue">{stats.orders}</p>
                    <p className="text-sm text-slate-500">Orders</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf7f4] text-[#2f8f83]">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-blue">{stats.wishlist}</p>
                    <p className="text-sm text-slate-500">Wishlist</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf7f4] text-[#2f8f83]">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-blue">{stats.pending}</p>
                    <p className="text-sm text-slate-500">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- TABS --- */}
            <div className="mt-6 inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "info"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-slate-500 hover:text-brand-blue"
                }`}
              >
                My Info
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "orders"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-slate-500 hover:text-brand-blue"
                }`}
              >
                Recent Orders
              </button>
            </div>

            {/* --- CONTENT --- */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              {activeTab === "info" ? (
                <div className="divide-y divide-slate-200">
                  {infoItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm text-slate-500">{item.label}</p>
                          <p className="mt-1 wrap-break-word text-base font-medium text-brand-blue">
                            {item.value || "-"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <RecentOrders
                  orders={recentOrders}
                  loading={loadingOrders}
                  expandedOrder={expandedOrder}
                  setExpandedOrder={setExpandedOrder}
                  onCancelOrder={handleCancelOrder}
                  cancellingOrderId={cancellingOrderId} 
                />
              )}
            </div>
            </div>
            </div>
            </section>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-bold text-brand-blue">Edit Profile</h2>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f8f83]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f8f83]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f8f83]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Birthday
                </label>

                <input
                  type="text"
                  value={formatBirthday(formData.birthday)}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f8f83]"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-[#de922f] hover:text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isImageMenuOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold text-brand-blue">Profile Photo</h3>
              <button
                type="button"
                onClick={() => setIsImageMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-5">
              <button
                type="button"
                onClick={openCamera}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <Camera className="h-5 w-5 text-[#2f8f83]" />
                <span className="text-sm font-medium text-slate-700">Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <ImageIcon className="h-5 w-5 text-[#2f8f83]" />
                <span className="text-sm font-medium text-slate-700">
                  {profile.profileImage ? "Change Image" : "Upload Image"}
                </span>
              </button>

              {profile.profileImage && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="flex w-full items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-left transition hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Delete Image</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-blue">Take Your Photo</h3>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {cameraError}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="block h-80 w-full bg-black object-cover"
                />
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <p className="mt-3 text-center text-sm text-slate-500">
              Position your face in the center, then capture your photo.
            </p>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              {!cameraError && (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="flex-1 rounded-xl bg-[#de922f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#c98020]"
                >
                  Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <h2 className="text-lg font-bold text-red-600">
              ⚠️ Cancel Order
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              {/* NO BUTTON */}
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm transition-all duration-200 hover:bg-[#d98b2b] hover:text-white group"
              >
                Keep Order
              </button>

              {/* YES BUTTON */}
              <button
                onClick={confirmCancelOrder}
                disabled={cancellingOrderId !== null}
                className={`rounded-xl px-4 py-2 text-sm text-white ${
                  cancellingOrderId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {cancellingOrderId ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}