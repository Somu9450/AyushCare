import React from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Printer,
  MapPin,
  UserRound,
  Stethoscope,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export const Screen10_TokenSuccess = () => {
  const {
    sessionData,
    language,
    resetSession,
  } = useKioskStore();

  const { t, isHindi, isPunjabi, isBengali } = useTranslation();

  const {
    tokenNumber,
    patientProfile,
    selectedDepartment,
    requestedDoctor,
    doctorAvailability,
    track,
    vitals,
    redFlagDetected,
    redFlags,
  } = sessionData;

  /*
   * -------------------------------------------------------
   * DISPLAY HELPERS
   * -------------------------------------------------------
   */

  const patientName =
    patientProfile?.hindiName ||
    patientProfile?.name ||
    'Patient';

  const departmentName =
    selectedDepartment?.name ||
    selectedDepartment?.label ||
    (track === 'AYUSH'
      ? 'AYUSH OPD'
      : 'General OPD');

  const doctorName =
    requestedDoctor?.name ||
    requestedDoctor?.label ||
    'Duty Medical Officer';

  const displayToken =
    tokenNumber || 'AY-OPD-108';

  const currentDate = new Date().toLocaleDateString(
    isHindi ? 'hi-IN' : isPunjabi ? 'pa-IN' : isBengali ? 'bn-IN' : 'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

  const currentTime = new Date().toLocaleTimeString(
    isHindi ? 'hi-IN' : isPunjabi ? 'pa-IN' : isBengali ? 'bn-IN' : 'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  /*
   * -------------------------------------------------------
   * PRINT
   * -------------------------------------------------------
   *
   * For the current mock implementation we use the browser
   * print dialog. A real kiosk printer integration can later
   * replace this without changing the UI flow.
   */

  const handlePrint = () => {
    window.print();
  };

  /*
   * -------------------------------------------------------
   * TEXT
   * -------------------------------------------------------
   */

  const text = {
    successTitle: isPunjabi
      ? 'ਓਪੀਡੀ ਟੋਕਨ ਸਫ਼ਲਤਾਪੂਰਵਕ ਤਿਆਰ ਹੋਇਆ'
      : isBengali
      ? 'ওপিডি টোকেন সফলভাবে তৈরি হয়েছে'
      : isHindi
      ? 'ओपीडी टोकन सफलतापूर्वक जनरेट हुआ'
      : 'OPD Token Generated Successfully',

    successDescription: isPunjabi
      ? 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਟੋਕਨ ਨੰਬਰ ਨੋਟ ਕਰੋ ਅਤੇ ਉਡੀਕ ਖੇਤਰ ਵਿੱਚ ਜਾਓ।'
      : isBengali
      ? 'অনুগ্রহ করে আপনার টোকেন নম্বর নোট করুন এবং অপেক্ষা করুন।'
      : isHindi
      ? 'कृपया अपना टोकन नंबर नोट करें और प्रतीक्षा क्षेत्र में जाएँ।'
      : 'Please note your token number and proceed to the waiting area.',

    tokenLabel: isPunjabi
      ? 'ਤੁਹਾਡਾ ਟੋਕਨ ਨੰਬਰ'
      : isBengali
      ? 'আপনার টোকেন নম্বর'
      : isHindi
      ? 'आपका टोकन नंबर'
      : 'Your Token Number',

    patient: isPunjabi ? 'ਮਰੀਜ਼' : isBengali ? 'রোগী' : isHindi ? 'मरीज़' : 'Patient',

    department: isPunjabi ? 'ਵਿਭਾਗ' : isBengali ? 'বিভাগ' : isHindi ? 'विभाग' : 'Department',

    doctor: isPunjabi ? 'ਡਾਕਟਰ' : isBengali ? 'ডাক্তার' : isHindi ? 'डॉक्टर' : 'Doctor',

    date: isPunjabi ? 'ਮਿਤੀ' : isBengali ? 'তারিখ' : isHindi ? 'दिनांक' : 'Date',

    time: isPunjabi ? 'ਸਮਾਂ' : isBengali ? 'সময়' : isHindi ? 'समय' : 'Time',

    priority: isPunjabi
      ? 'ਤਰਜੀਹ ਟ੍ਰਾਈਏਜ'
      : isBengali
      ? 'জরুরি ট্রায়াজ'
      : isHindi
      ? 'प्राथमिकता ट्रायेज'
      : 'Priority Triage',

    priorityMessage: isPunjabi
      ? 'ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦੇ ਆਧਾਰ ਤੇ ਸਟਾਫ ਨੂੰ ਸੂਚਿਤ ਕੀਤਾ ਗਿਆ ਹੈ।'
      : isBengali
      ? 'আপনার লক্ষণের ভিত্তিতে কর্মীদের সতর্ক করা হয়েছে।'
      : isHindi
      ? 'आपके लक्षणों के आधार पर स्टाफ को प्राथमिकता सूचना भेजी गई है।'
      : 'The triage staff has been alerted based on the symptoms recorded.',

    waitingMessage: isPunjabi
      ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਕ੍ਰੀਨ ਤੇ ਆਪਣਾ ਟੋਕਨ ਨੰਬਰ ਆਉਣ ਦੀ ਉਡੀਕ ਕਰੋ।'
      : isBengali
      ? 'স্ক্রিনে আপনার টোকেন নম্বর আসার জন্য অপেক্ষা করুন।'
      : isHindi
      ? 'कृपया स्क्रीन पर प्रदर्शित टोकन नंबर के लिए प्रतीक्षा करें।'
      : 'Please wait for your token number to be displayed on the waiting screen.',

    print: isPunjabi
      ? 'ਟੋਕਨ ਸਲਿੱਪ ਪ੍ਰਿੰਟ ਕਰੋ'
      : isBengali
      ? 'টোকেন স্লিপ প্রিন্ট করুন'
      : isHindi
      ? 'टोकन स्लिप प्रिंट करें'
      : 'Print Token Slip',

    newCheckIn: isPunjabi
      ? 'ਨਵਾਂ ਚੈੱਕ-ਇਨ'
      : isBengali
      ? 'নতুন চেক-ইন'
      : isHindi
      ? 'नया चेक-इन'
      : 'New Check-In',

    secure: isPunjabi
      ? 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਰੂਪ ਨਾਲ ਸੇਵ ਕੀਤੀ ਗਈ ਹੈ'
      : isBengali
      ? 'আপনার তথ্য সুরক্ষিতভাবে সংরক্ষিত হয়েছে'
      : isHindi
      ? 'आपकी जानकारी सुरक्षित रूप से सेव की गई है'
      : 'Your information has been securely saved',

    track: isPunjabi ? 'ਸੇਵਾ' : isBengali ? 'সেবা' : isHindi ? 'सेवा' : 'Service',

    ayush: isPunjabi ? 'ਆਯੁਸ਼' : isBengali ? 'আয়ুষ' : isHindi ? 'आयुष' : 'AYUSH',

    allopathy: isPunjabi ? 'ਐਲੋਪੈਥੀ' : isBengali ? 'অ্যালোপ্যাথি' : isHindi ? 'एलोपैथी' : 'Allopathy',
  };

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div className="h-full w-full max-w-4xl mx-auto px-4 py-2 select-none flex flex-col justify-between">
      {/* --------------------------------------------------
          COMPACT HEADER
      --------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {text.successTitle}
            </h1>
            <p className="text-xs text-slate-500">
              {text.successDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{text.secure}</span>
        </div>
      </div>

      {/* --------------------------------------------------
          TWO-COLUMN ATM LAYOUT
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-3 items-stretch flex-1 min-h-0">

        {/* LEFT COLUMN: Token Display Card */}
        <div className="bg-teal-800 text-white rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200">
              {text.tokenLabel}
            </span>
            <div className="text-5xl font-black font-mono tracking-tight my-2 text-white">
              {displayToken}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
              <Clock3 className="w-3.5 h-3.5 text-teal-200" />
              <span>{currentDate} • {currentTime}</span>
            </div>
          </div>

          <div className="rounded-xl bg-teal-900/60 p-2.5 border border-teal-700/50 text-xs text-teal-100 leading-relaxed mt-3">
            <p className="font-bold text-white mb-0.5">Please proceed to Waiting Area</p>
            <p className="text-[11px] text-teal-200">{text.waitingMessage}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col justify-between gap-2">
          {/* Patient and Dept info */}
          <div className="grid grid-cols-2 gap-2">
            <InfoCard icon={<UserRound className="w-4 h-4" />} label={text.patient} value={patientName} />
            <InfoCard icon={<MapPin className="w-4 h-4" />} label={text.department} value={departmentName} />
            <InfoCard icon={<Stethoscope className="w-4 h-4" />} label={text.doctor} value={doctorName} />
            <InfoCard icon={<HeartPulse className="w-4 h-4" />} label={text.track} value={track === 'AYUSH' ? text.ayush : text.allopathy} />
          </div>

          {/* Priority Alert if any */}
          {redFlagDetected && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-2 flex items-center gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <span className="font-black block">{text.priority}</span>
                <span className="text-[10px] text-amber-800">{text.priorityMessage}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={resetSession}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{text.newCheckIn}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{text.print}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/*
 * =========================================================
 * REUSABLE INFORMATION CARD
 * =========================================================
 */

const InfoCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-200
        bg-slate-50
        p-4
        flex
        items-center
        gap-3
        min-h-[76px]
      "
    >

      <div
        className="
          shrink-0
          w-11 h-11
          rounded-xl
          bg-white
          border border-slate-200
          text-teal-800
          flex
          items-center
          justify-center
        "
      >
        {icon}
      </div>

      <div className="min-w-0">

        <div
          className="
            text-[11px]
            sm:text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          {label}
        </div>

        <div
          className="
            mt-1
            text-sm
            sm:text-base
            font-bold
            text-slate-900
            truncate
          "
        >
          {value}
        </div>

      </div>

    </div>
  );
};

export default Screen10_TokenSuccess;