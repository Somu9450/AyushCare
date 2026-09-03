import React from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { AlertTriangle, X, PhoneCall } from 'lucide-react';

export default function EmergencyModal() {
  const { emergencyModalOpen, setEmergencyModal } = useKioskStore();

  if (!emergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border-4 border-red-500 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">Emergency Alert Triggered</h3>
          <p className="text-sm text-slate-600">
            Please proceed immediately to the **Red Triage Desk** in Room 101. Hospital emergency staff have been notified.
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center justify-center space-x-3 text-red-800 font-bold">
          <PhoneCall className="w-5 h-5 animate-bounce" />
          <span>Internal Emergency Code: DIAL 108 / DESK-101</span>
        </div>

        <button
          onClick={() => setEmergencyModal(false)}
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2"
        >
          <X className="w-5 h-5" />
          <span>Dismiss / Return to Kiosk</span>
        </button>
      </div>
    </div>
  );
}