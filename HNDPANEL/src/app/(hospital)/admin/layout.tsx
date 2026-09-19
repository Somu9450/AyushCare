'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  Users,
  Layers,
  LogOut,
  Activity,
  ChevronRight,
  Menu,
  X,
  Building2,
  CalendarDays,
  History,
  ShieldCheck,
} from 'lucide-react';
import { LiveClock } from '../../../components/LiveClock';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Live Token Desk & Queue', href: '/admin/queue', icon: Layers, short: 'Queue' },
    { label: 'Doctor Roster & Rooms', href: '/admin/doctors', icon: Users, short: 'Doctors' },
    { label: 'Department Analytics', href: '/admin/departments', icon: Building2, short: 'Depts' },
    { label: 'Past Records & History', href: '/admin/history', icon: History, short: 'History' },
  ];

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex flex-col text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <header className="h-[56px] bg-[#00504b] text-white px-3 sm:px-5 flex items-center justify-between shrink-0 shadow-sm border-b border-[#003834] z-40">
        {/* Left Branding & Mobile Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-lg bg-[#033434] text-[#99f6e4] border border-[#0d6e6e] hover:bg-[#055a4c] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="h-8.5 px-2 bg-white rounded-lg flex items-center justify-center shadow-xs shrink-0 border border-slate-200/80">
            <img
              src="https://abdm.gov.in/strapicms/uploads/logo_1c71441e1d.png"
              alt="Ayushman Bharat Digital Mission (ABDM)"
              className="h-6 w-auto object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight truncate">
                AyushCare Admin
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.2 text-[9px] font-bold bg-[#033030] text-[#99f6e4] border border-[#0d6e6e] rounded-full">
                HOSPITAL
              </span>
            </div>
            <p className="text-[10px] text-[#99f6e4]/80 leading-tight hidden sm:block truncate">
              AyushCare Central Health Operations & OPD Control
            </p>
          </div>
        </div>

        {/* Center Workspace Branding */}
        <div className="hidden md:flex items-center shrink-0">
          <span className="font-extrabold tracking-widest text-xs lg:text-sm text-white uppercase">
            AyushCare · Hospital Control Desk
          </span>
        </div>

        {/* Right Info, Time & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Live Clock Widget */}
          <LiveClock />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#033030] border border-[#0d6e6e] rounded-full text-xs text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-semibold text-white truncate max-w-[120px]">{user?.name || 'Administrator'}</span>
            <span className="text-[#99f6e4]/60">|</span>
            <span className="text-[#99f6e4]/80 text-[11px] hidden md:inline truncate max-w-[150px]">
              {user?.email || 'admin@hospital.gov.in'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-[#033434] sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-lg sm:rounded-none sm:border-l sm:border-teal-700/60 sm:pl-3 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-[56px] z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          />
        )}

        {/* Admin Navigation Sidebar (Desktop Docked + Mobile Slide-Over) */}
        <aside
          className={`fixed lg:static inset-y-0 top-[56px] lg:top-0 left-0 z-40 lg:z-auto w-64 sm:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 tracking-wider font-bold mb-3 px-2 uppercase">
              HOSPITAL MANAGEMENT
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
                      ? 'bg-[#044e42] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'opacity-40'}`} />
                </Link>
              );
            })}
          </div>

          {/* Bottom Telemetry Card */}
          <div className="bg-teal-50/80 border border-teal-200/90 rounded-xl p-3 text-teal-950 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#044e42] mb-1">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>OPD Telemetry Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-800/90 font-medium">
              Synchronized with AyushCare Kiosk Intake and AyushCare Mobile patient portal.
            </p>
          </div>
        </aside>

        {/* Dynamic Admin Page Workspace */}
        <main className="flex-1 bg-[#f8fafc] overflow-y-auto p-3 sm:p-5 md:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Smartphones only) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                isActive ? 'text-[#044e42]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#044e42]' : 'text-slate-400'}`} />
              <span>{item.short}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
