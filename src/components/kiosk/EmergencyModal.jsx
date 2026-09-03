import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, MapPin } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

export const EmergencyModal = () => {
  const { emergencyModalOpen, toggleEmergencyModal } = useKioskStore();
  const { t } = useTranslation();

  if (!emergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-rose-600 shadow-2xl overflow-hidden">
        {/* Header Alert Ribbon */}
        <div className="bg-rose-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-9 h-9 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-wider uppercase">
                {t('emergencyModal.title', 'EMERGENCY TRIAGE ALERT')}
              </h2>
              <p className="text-rose-100 text-sm font-medium">
                {t('emergencyModal.subtitle', 'Immediate Medical Assistance Requested')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleEmergencyModal(false)}
            className="p-2.5 rounded-full hover:bg-rose-700 text-white transition-colors cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0 mt-1" />
            <p className="text-rose-950 font-semibold text-lg leading-relaxed">
              {t('emergencyModal.alertMessage')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action 1: Location guide */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-slate-800 font-bold mb-2">
                <MapPin className="w-6 h-6 text-rose-600" />
                <span>Immediate Location</span>
              </div>
              <p className="text-sm text-slate-600">
                {t('emergencyModal.action1')}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-rose-700 uppercase tracking-wider">
                Priority Red Zone • Open 24x7
              </div>
            </div>

            {/* Action 2: Staff Notified */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-slate-800 font-bold mb-2">
                <PhoneCall className="w-6 h-6 text-emerald-600" />
                <span>Emergency Helplines</span>
              </div>
              <p className="text-sm text-slate-600">
                {t('emergencyModal.action2')}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>National Ambulance: <strong className="text-rose-600 text-sm">108</strong></span>
                <span>Hospital ER: <strong className="text-rose-600 text-sm">102</strong></span>
              </div>
            </div>
          </div>

          {/* Large Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                alert('Triage Nurse notified at Station A. Attendant dispatched.');
                toggleEmergencyModal(false);
              }}
              className="flex-1 min-h-[60px] bg-rose-600 hover:bg-rose-700 text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all"
            >
              <PhoneCall className="w-6 h-6" />
              <span>Call Triage Nurse Now</span>
            </button>
            <button
              type="button"
              onClick={() => toggleEmergencyModal(false)}
              className="px-6 min-h-[60px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl cursor-pointer transition-colors"
            >
              {t('emergencyModal.dismiss', 'Return to Normal Kiosk Check-In')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
