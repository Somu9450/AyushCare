import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { History, ArrowRight } from 'lucide-react';

export const Screen6_HealthHistory = () => {
  const { nextScreen, prevScreen } = useKioskStore();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
        <History className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-900">Screen 6: Patient Health History</h2>
        <p className="text-slate-600 mt-2">Past illnesses, chronic medications, surgical history, and allergies</p>
      </div>
      <div className="flex gap-4">
        <button onClick={prevScreen} className="px-6 py-3 bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer">
          Back
        </button>
        <button onClick={nextScreen} className="px-6 py-3 bg-teal-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer">
          <span>Continue to Screen 7</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Screen6_HealthHistory;
