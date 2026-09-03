import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { CheckCircle2, RotateCcw, Printer } from 'lucide-react';

export const Screen10_TokenSuccess = () => {
  const { sessionData, resetSession } = useKioskStore();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-lg animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-900">OPD Token Generated Successfully!</h2>
        <p className="text-slate-600 mt-2">Please collect your printed token slip and proceed to your consultation room.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border-2 border-teal-600 shadow-xl w-full max-w-md space-y-3 font-mono">
        <div className="text-xs text-slate-500 uppercase tracking-wider">AyushCare OPD Token</div>
        <div className="text-4xl font-black text-teal-900">{sessionData.tokenNumber || 'AY-OPD-108'}</div>
        <div className="text-xs text-slate-600 border-t pt-2">
          {sessionData.selectedDepartment?.name || 'Kayachikitsa'} • {sessionData.requestedDoctor?.name || 'General OPD Duty'}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button 
          onClick={() => alert('Printing token slip...')} 
          className="px-6 py-3 bg-teal-800 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Printer className="w-5 h-5 text-amber-300" />
          <span>Print Slip</span>
        </button>
        <button 
          onClick={resetSession} 
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>New Check-In</span>
        </button>
      </div>
    </div>
  );
};

export default Screen10_TokenSuccess;
