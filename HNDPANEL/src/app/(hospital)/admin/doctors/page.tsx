'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '../../../../services/admin.service';
import { authService } from '../../../../services/auth.service';
import { Doctor } from '../../../../types/api';
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  Stethoscope,
  X,
  AlertCircle,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Client-managed Room assignments
  const [roomAssignments, setRoomAssignments] = useState<Record<string, string>>({});

  // Form State for Doctor Onboarding
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [roomNumber, setRoomNumber] = useState('OPD Room 101');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminService.getDoctors();
      setDoctors(list || []);
    } catch {
      setError('Failed to fetch doctor roster from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const registered = await authService.registerAdmin({
        hospitalName: 'AyushCare OPD Hospital',
        stateCode: 'DL',
        name,
        email,
        password,
      });

      if (registered && registered.id) {
        setRoomAssignments((prev) => ({
          ...prev,
          [registered.id]: roomNumber,
        }));
      }

      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      await fetchDoctors();
    } catch (err: any) {
      setError(err.message || 'Failed to register new clinician.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDoctorStatus = (doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, is_active: !d.is_active } : d))
    );
  };

  const handleRoomChange = (doctorId: string, newRoom: string) => {
    setRoomAssignments((prev) => ({
      ...prev,
      [doctorId]: newRoom,
    }));
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      doc.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-[#054444]" />
            <span>Doctor Roster & OPD Room Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage active medical staff, assign OPD consulting rooms, and onboard new clinicians.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDoctors}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#054444] hover:bg-[#064e4b] text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Doctor</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#054444] focus:border-[#054444]"
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#054444] border-t-transparent" />
            Fetching doctor roster records...
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600">No Doctors Registered in Hospital</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click &apos;Onboard New Doctor&apos; to register clinicians to the hospital directory.
            </p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No doctors found matching your search &apos;{search}&apos;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">DOCTOR NAME</th>
                  <th className="px-4 py-3">SPECIALIZATION</th>
                  <th className="px-4 py-3">EMAIL CONTACT</th>
                  <th className="px-4 py-3">OPD ROOM ASSIGNMENT</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc, idx) => {
                  const initials =
                    doc.name
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'DR';

                  const currentRoom = roomAssignments[doc.id] || `OPD Room ${101 + (idx % 10)}`;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#054444] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {doc.id.slice(0, 8)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium border border-slate-200">
                          {doc.specialization || 'General Medicine'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono">{doc.email}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#054444]">
                        <select
                          value={currentRoom}
                          onChange={(e) => handleRoomChange(doc.id, e.target.value)}
                          className="bg-[#f8fafc] border border-slate-200 rounded px-2 py-1 text-xs text-[#054444] font-medium focus:outline-none focus:ring-1 focus:ring-[#054444]"
                        >
                          <option value="OPD Room 101">OPD Room 101</option>
                          <option value="OPD Room 102">OPD Room 102</option>
                          <option value="OPD Room 103">OPD Room 103</option>
                          <option value="OPD Room 104">OPD Room 104</option>
                          <option value="Emergency Room">Emergency Room</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            doc.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {doc.is_active ? (
                            <>
                              <UserCheck className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 text-rose-600" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => toggleDoctorStatus(doc.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                            doc.is_active
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {doc.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for Onboarding Doctor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl p-6 relative text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                <Building2 className="w-5 h-5 text-[#054444]" />
                Onboard New Doctor
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDoctor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="dr.rajesh@hospital.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="AYUSH Clinical">AYUSH Clinical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">OPD Room Assignment</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#054444] hover:bg-[#064e4b] text-white rounded-lg font-semibold shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
