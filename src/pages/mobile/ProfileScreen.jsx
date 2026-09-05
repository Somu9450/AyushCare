import React, { useState } from "react";
import {
  User,
  IdCard,
  Phone,
  Calendar,
  MapPin,
  Heart,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  Sparkles,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";

// TODO: Replace mock patient profile with patient API.
// TODO: Persist profile changes through patient profile API.
// TODO: Integrate ABDM authentication when backend is available.

export const ProfileScreen = () => {
  const { session, updatePatientProfile, setScreen } = useMobileStore();
  const patient = session.patient || {};

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [revealSensitive, setRevealSensitive] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(patient.name || "Rajesh Kumar Sharma");
  const [editMobile, setEditMobile] = useState(patient.mobile || "+91 98765 43210");
  const [editAddress, setEditAddress] = useState(
    patient.address || "H.No. 42, Sector 4, Rohini, New Delhi"
  );

  // Masked string utilities
  const getMaskedAbha = (abha) => {
    if (!abha) return "91-XXXX-XXXX-9012";
    // Mask middle digits: 91-XXXX-XXXX-9012
    const clean = abha.replace(/\s+/g, "");
    if (clean.length >= 14) {
      return `${clean.slice(0, 3)}XXXX-XXXX-${clean.slice(-4)}`;
    }
    return "91-XXXX-XXXX-9012";
  };

  const getMaskedMobile = (mobile) => {
    if (!mobile) return "+91 XXXXX 43210";
    const digits = mobile.replace(/\D/g, "");
    if (digits.length >= 10) {
      return `+91 XXXXX ${digits.slice(-5)}`;
    }
    return "+91 XXXXX 43210";
  };

  const getMaskedAadhaar = () => {
    return "XXXX-XXXX-0144";
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updatePatientProfile({
      name: editName.trim() || patient.name,
      mobile: editMobile.trim() || patient.mobile,
      address: editAddress.trim() || patient.address,
    });
    setIsEditModalOpen(false);
    setToastMessage("Profile updated");
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Header */}
      <MobileHeader
        title="Patient Profile"
        showBack={true}
        onBack={() => setScreen(SCREENS.MORE)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Patient Digital Identity Card */}
        <section
          aria-label="Patient Identity Card"
          className="p-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 text-white shadow-md space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-xl text-white shadow-inner">
                {patient.name ? patient.name.charAt(0) : "R"}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-white leading-tight">
                  {patient.name || "Rajesh Kumar Sharma"}
                </h2>
                {patient.hindiName && (
                  <p className="text-xs text-teal-200">{patient.hindiName}</p>
                )}
                <p className="text-xs text-teal-100 font-medium">
                  {patient.age} Yrs · {patient.gender} · {patient.bloodGroup || "B+"}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-700/90 text-teal-100 border border-teal-500/40 px-2.5 py-1 rounded-full shrink-0">
              ABDM Verified ✓
            </span>
          </div>

          {/* Masked ABHA Number Badge */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-teal-200 font-bold block">
                ABHA Number (Health ID)
              </span>
              <span className="text-sm font-mono font-bold tracking-wider text-white">
                {revealSensitive ? patient.abhaNumber : getMaskedAbha(patient.abhaNumber)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setRevealSensitive(!revealSensitive)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-teal-200 transition cursor-pointer"
              title={revealSensitive ? "Mask identifiers" : "Reveal identifiers"}
            >
              {revealSensitive ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-teal-200/80 pt-1 border-t border-white/10">
            <span>Mobile: {revealSensitive ? patient.mobile : getMaskedMobile(patient.mobile)}</span>
            <span>Aadhaar: {getMaskedAadhaar()}</span>
          </div>
        </section>

        {/* 2. Personal Information Grid */}
        <section
          aria-label="Personal Information"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Personal Information
            </h3>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Full Name
              </span>
              <p className="font-bold text-slate-800 text-sm">{patient.name}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Date of Birth
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {patient.dob || "15 Jun 1984"} ({patient.age} years)
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Gender
              </span>
              <p className="font-bold text-slate-800 text-sm">{patient.gender}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Mobile Number
              </span>
              <p className="font-bold text-slate-800 text-sm font-mono">
                {revealSensitive ? patient.mobile : getMaskedMobile(patient.mobile)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Blood Group
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {patient.bloodGroup || "B+"}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Prakriti (Ayush Profile)
              </span>
              <p className="font-bold text-slate-800 text-sm">
                Vata-Pitta (Predominant)
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              Permanent Residential Address
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {patient.address || "H.No. 42, Sector 4, Rohini, New Delhi"}
            </p>
            <p className="text-[11px] text-slate-500">
              District: {patient.district || "Central Delhi"}, State: {patient.state || "Delhi"}
            </p>
          </div>
        </section>

        {/* 3. Security & Privacy Notice */}
        <div className="p-4 rounded-3xl bg-slate-100/90 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">
              ABDM Government Healthcare Protection
            </p>
            <p className="leading-relaxed">
              Your sensitive health identifiers are masked in compliance with National Digital Health Mission standards. To manage healthcare provider consents, visit{" "}
              <button
                type="button"
                onClick={() => setScreen(SCREENS.PRIVACY)}
                className="font-bold text-teal-800 hover:underline cursor-pointer"
              >
                Privacy & Data Control
              </button>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Edit Profile Drawer / Modal */}
      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Edit Patient Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-teal-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-teal-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-teal-700 resize-none"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Note: ABHA identifier and Date of Birth are tied to national records and cannot be altered without Aadhaar biometric re-verification.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};

export default ProfileScreen;
