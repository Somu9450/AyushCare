'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  Users,
  Layers,
  LogOut,
  Activity,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Token Desk & Queue', href: '/admin/queue', icon: Layers },
    { label: 'Doctor Roster & Rooms', href: '/admin/doctors', icon: Users },
  ];

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex flex-col text-slate-900 overflow-hidden font-sans select-none">
      {/* Admin Top Navbar */}
      <header className="h-[54px] bg-[#054444] text-white px-5 flex items-center justify-between shrink-0 shadow-sm border-b border-[#033434]">
        {/* Left Branding with ABDM Official Logo */}
        <div className="flex items-center gap-3">
          <div className="h-8.5 px-2 bg-white rounded-lg flex items-center justify-center shadow-xs shrink-0 border border-slate-200/80">
            <img
              src="https://abdm.gov.in/strapicms/uploads/logo_1c71441e1d.png"
              alt="Ayushman Bharat Digital Mission (ABDM)"
              className="h-6 w-auto object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-white tracking-wide leading-tight">
                Hospital Admin Console
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#033030] text-[#99f6e4] border border-[#0d6e6e] rounded-full">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-[#99f6e4]/80 leading-tight">
              Central Health Operations & OPD Control
            </p>
          </div>
        </div>

        {/* Right Admin Staff Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#033030] border border-[#0d6e6e] rounded-full text-xs text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="font-semibold text-white">{user?.name || 'Administrator'}</span>
            <span className="text-[#99f6e4]/60">|</span>
            <span className="text-[#99f6e4]/80 text-[11px]">{user?.email || 'admin@hospital.gov.in'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors border-l border-teal-800/80 pl-3 ml-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-white/80" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 tracking-wider font-bold mb-3 px-2 uppercase">
              MANAGEMENT MODULES
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-[#054444] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              );
            })}
          </div>

          {/* Bottom Info Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-emerald-900 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#065f46] mb-1">
              <Activity className="w-4 h-4 text-[#065f46]" />
              <span>OPD Sync Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#065f46]/90 font-medium">
              Kiosk intake tokens automatically route to assigned doctor queues.
            </p>
          </div>
        </aside>

        {/* Dynamic Admin Page Workspace */}
        <main className="flex-1 bg-[#f8fafc] overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
