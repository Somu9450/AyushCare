'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Users, FileText, PanelRightClose, PanelRightOpen } from 'lucide-react';

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
  onToggleEvidence,
  queueCount = 0,
  evidenceCount = 0,
  isEvidenceOpen = false,
}) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

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

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-[54px] bg-[#054444] text-white px-3 sm:px-4 flex items-center justify-between shadow-sm shrink-0 select-none border-b border-[#033434] gap-2">
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
              AyushCare Health Stack
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
          MEDIKIOSK · Doctor Workspace
        </span>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Toggle Evidence / Reports Drawer Button */}
       

        {/* Doctor Identity */}
        <div className="text-right hidden lg:block">
          <p className="text-xs font-semibold text-white leading-none">{activeName}</p>
          <p className="text-[10px] text-[#99f6e4]/80 leading-tight mt-0.5">{activeReg}</p>
        </div>

        {/* Circular Avatar Badge */}
        <div className="w-7 h-7 rounded-full bg-[#033030] text-[#99f6e4] font-bold text-xs flex items-center justify-center border border-[#0d6e6e] shrink-0">
          {initials}
        </div>

        {/* Exit Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-1 text-xs font-medium text-white/90 hover:text-white transition-colors border-l border-teal-800/80 pl-2.5 sm:pl-3 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 text-white/80" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};
