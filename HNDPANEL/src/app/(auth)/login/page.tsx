'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { Stethoscope, ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'hospital_admin'>('doctor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both Staff Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email: email.trim(), password });
      if (user.role === 'hospital_admin') {
        router.push('/admin/queue');
      } else {
        router.push('/doctor');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[url('/KioskScreenBg.png')] bg-center bg-cover bg-no-repeat bg-[#f1f8f7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/98 border border-slate-200/90 rounded-2xl shadow-2xl p-8 text-slate-800 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 flex items-center justify-center mb-2">
            <img
              src="/ayushCareLogo.png"
              alt="AyushCare Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-[#12383b]">Ayush</span>
            <span className="text-[#438b34]">Care</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 tracking-wide mt-1">
            Doctor Workspace & Hospital Admin Portal
          </p>
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-[11px] font-semibold text-teal-800">
            <img src="/ayushman-bharat-icon.png" alt="Ayushman Bharat" className="w-4 h-4 object-contain" />
            <span>Ayushman Bharat Digital Mission</span>
          </div>
        </div>

        {/* Role Segment Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              selectedRole === 'doctor'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Console</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('hospital_admin')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              selectedRole === 'hospital_admin'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Hospital Admin</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Staff Email / User Identifier
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder={selectedRole === 'doctor' ? 'doctor@hospital.gov.in' : 'admin@hospital.gov.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-teal-800 hover:bg-teal-900 text-white font-medium py-3 px-4 rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
          Secured by ABDM Health Stack & Government EHR Protocols
        </div>
      </div>
    </div>
  );
}
