'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { LiveClock } from './LiveClock';
import {
  LogOut,
  Users,
  ChevronDown,
  User,
  ShieldCheck,
  Building2,
  Mail,
  CircleDot,
} from 'lucide-react';

interface TopNavbarProps {
  doctorName?: string;
  doctorReg?: string;
  onToggleQueue?: () => void;
  onToggleEvidence?: () => void;
  queueCount?: number;
  evidenceCount?: number;
  isEvidenceOpen?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  doctorName,
  doctorReg,
  onToggleQueue,
  queueCount = 0,
}) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeName = user?.name || doctorName || 'Attending Physician';
  const activeReg = user?.specialization
    ? `${user.specialization} · OPD Clinician`
    : doctorReg || 'Medical Officer · OPD Console';

  const initials =
    activeName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'MD';

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-[54px] bg-[#00504b] text-white px-3 sm:px-4 flex items-center justify-between shadow-sm shrink-0 select-none border-b border-[#003834] gap-2 relative z-50">
      {/* Left Branding & Mobile Queue Toggle */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        {/* Mobile/Tablet Queue Toggle Button */}
        {onToggleQueue && (
          <button
            onClick={onToggleQueue}
            className="lg:hidden p-1.5 rounded-lg bg-[#033030] text-[#99f6e4] border border-[#0d6e6e] flex items-center gap-1.5 text-xs font-semibold hover:bg-[#044242] transition-colors cursor-pointer shrink-0"
            title="Toggle Patient Queue"
          >
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-bold">{queueCount}</span>
          </button>
        )}

        {/* ABDM Official Logo Badge */}
        <div className="h-8.5 px-2 bg-white rounded-lg flex items-center justify-center shadow-xs shrink-0 border border-slate-200/80">
          <img
            src="https://abdm.gov.in/strapicms/uploads/logo_1c71441e1d.png"
            alt="Ayushman Bharat Digital Mission (ABDM)"
            className="h-6 w-auto object-contain"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xs tracking-wide text-white leading-tight truncate">
              AyushCare Health
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#033030] text-[#99f6e4] border border-[#0d6e6e]">
              OPD
            </span>
          </div>
          <p className="text-[10px] text-[#99f6e4]/80 leading-tight hidden sm:block truncate">
            Ayushman Bharat Digital Mission · General Medicine
          </p>
        </div>
      </div>

      {/* Center Branding (Desktop / Tablet) */}
      <div className="hidden md:flex items-center shrink-0">
        <span className="font-extrabold tracking-widest text-xs lg:text-sm text-white uppercase">
          AyushCare · Doctor Workspace
        </span>
      </div>

      {/* Right: Live Time & Doctor Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Live Clock Widget */}
        <LiveClock />

        {/* Doctor Profile Dropdown Trigger */}
        <div className="relative shrink-0 z-50" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center space-x-2 sm:space-x-2.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-[#043b3b] transition-all cursor-pointer border border-transparent hover:border-[#0d6e6e] focus:outline-none focus:ring-1 focus:ring-teal-400 group"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {/* Circular Avatar Badge */}
          <div className="w-8 h-8 rounded-full bg-[#033030] text-[#99f6e4] font-bold text-xs flex items-center justify-center border border-[#0d6e6e] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {initials}
          </div>

          {/* Doctor Identity */}
          <div className="text-left hidden lg:block min-w-0 max-w-[170px]">
            <p className="text-xs font-semibold text-white leading-none truncate">{activeName}</p>
            <p className="text-[10px] text-[#99f6e4]/80 leading-tight mt-0.5 truncate">{activeReg}</p>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-teal-200 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180 text-white' : 'group-hover:text-white'
            }`}
          />
        </button>

        {/* Dropdown Menu Modal with Top-level Z-index */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top-right">
            {/* User Profile Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#054444] text-[#99f6e4] font-bold text-sm flex items-center justify-center shrink-0 border border-teal-700">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{activeName}</p>
                <p className="text-[11px] text-teal-800 font-medium truncate">{activeReg}</p>
                {user?.email && (
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span>{user.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Account Details & Status */}
            <div className="px-4 py-2.5 space-y-2 text-[11px] text-slate-600 bg-slate-50/70 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Role:</span>
                </span>
                <span className="font-semibold text-slate-800 uppercase tracking-wide text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {user?.role === 'doctor' ? 'OPD Physician' : user?.role || 'Clinician'}
                </span>
              </div>

              {user?.hospital_id && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Facility ID:</span>
                  </span>
                  <span className="font-mono font-medium text-slate-700 text-[10px]">
                    {user.hospital_id.slice(0, 12)}...
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-emerald-500" />
                  <span>Status:</span>
                </span>
                <span className="text-emerald-700 font-semibold text-[10px]">Online & Active</span>
              </div>
            </div>

            {/* Logout Action Item */}
            <div className="p-1.5 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout from Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
};
