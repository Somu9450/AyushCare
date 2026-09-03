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

export const Screen10_TokenSuccess = () => {
  const {
    sessionData,
    language,
    resetSession,
  } = useKioskStore();

  const isHindi = language === 'hi';

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
    isHindi ? 'hi-IN' : 'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

  const currentTime = new Date().toLocaleTimeString(
    isHindi ? 'hi-IN' : 'en-IN',
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
    successTitle: isHindi
      ? 'ओपीडी टोकन सफलतापूर्वक जनरेट हुआ'
      : 'OPD Token Generated Successfully',

    successDescription: isHindi
      ? 'कृपया अपना टोकन नंबर नोट करें और प्रतीक्षा क्षेत्र में जाएँ।'
      : 'Please note your token number and proceed to the waiting area.',

    tokenLabel: isHindi
      ? 'आपका टोकन नंबर'
      : 'Your Token Number',

    patient: isHindi
      ? 'मरीज़'
      : 'Patient',

    department: isHindi
      ? 'विभाग'
      : 'Department',

    doctor: isHindi
      ? 'डॉक्टर'
      : 'Doctor',

    date: isHindi
      ? 'दिनांक'
      : 'Date',

    time: isHindi
      ? 'समय'
      : 'Time',

    priority: isHindi
      ? 'प्राथमिकता ट्रायेज'
      : 'Priority Triage',

    priorityMessage: isHindi
      ? 'आपके लक्षणों के आधार पर स्टाफ को प्राथमिकता सूचना भेजी गई है।'
      : 'The triage staff has been alerted based on the symptoms recorded.',

    waitingMessage: isHindi
      ? 'कृपया स्क्रीन पर प्रदर्शित टोकन नंबर के लिए प्रतीक्षा करें।'
      : 'Please wait for your token number to be displayed on the waiting screen.',

    print: isHindi
      ? 'टोकन स्लिप प्रिंट करें'
      : 'Print Token Slip',

    newCheckIn: isHindi
      ? 'नया चेक-इन'
      : 'New Check-In',

    secure: isHindi
      ? 'आपकी जानकारी सुरक्षित रूप से सेव की गई है'
      : 'Your information has been securely saved',

    track: isHindi
      ? 'सेवा'
      : 'Service',

    ayush: isHindi
      ? 'आयुष'
      : 'AYUSH',

    allopathy: isHindi
      ? 'एलोपैथी'
      : 'Allopathy',
  };

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div className="flex-1 w-full bg-slate-50 overflow-y-auto">
      <div className="min-h-full w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col justify-center">

        {/* =================================================
            SUCCESS HEADER
        ================================================= */}

        <div className="text-center mb-6 sm:mb-8">

          <div
            className="
              mx-auto
              w-20 h-20
              sm:w-24 sm:h-24
              rounded-[28px]
              bg-emerald-100
              text-emerald-700
              flex items-center justify-center
              shadow-sm
              mb-5
            "
          >
            <CheckCircle2
              className="w-12 h-12 sm:w-14 sm:h-14"
              strokeWidth={2.2}
            />
          </div>

          <h1
            className="
              text-2xl
              sm:text-3xl
              lg:text-4xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            {text.successTitle}
          </h1>

          <p
            className="
              mt-2
              text-sm
              sm:text-base
              text-slate-600
              max-w-xl
              mx-auto
            "
          >
            {text.successDescription}
          </p>

        </div>

        {/* =================================================
            MAIN TOKEN CARD
        ================================================= */}

        <div
          className="
            bg-white
            rounded-[28px]
            border border-slate-200
            shadow-xl
            overflow-hidden
            w-full
          "
        >

          {/* -------------------------------------------------
              TOKEN SECTION
          ------------------------------------------------- */}

          <div
            className="
              bg-teal-800
              text-white
              px-5 py-7
              sm:px-8 sm:py-9
              text-center
            "
          >

            <p
              className="
                text-xs
                sm:text-sm
                font-bold
                uppercase
                tracking-[0.18em]
                text-teal-100
              "
            >
              {text.tokenLabel}
            </p>

            <div
              className="
                mt-3
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-black
                tracking-tight
                font-mono
              "
            >
              {displayToken}
            </div>

            <div
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                px-4 py-2
                rounded-full
                bg-white/10
                border border-white/15
                text-xs
                sm:text-sm
                font-semibold
              "
            >
              <Clock3 className="w-4 h-4" />

              <span>
                {currentDate} • {currentTime}
              </span>
            </div>

          </div>

          {/* -------------------------------------------------
              PATIENT / ROUTING INFORMATION
          ------------------------------------------------- */}

          <div className="p-5 sm:p-7">

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
                sm:gap-4
              "
            >

              {/* Patient */}

              <InfoCard
                icon={<UserRound className="w-5 h-5" />}
                label={text.patient}
                value={patientName}
              />

              {/* Department */}

              <InfoCard
                icon={<MapPin className="w-5 h-5" />}
                label={text.department}
                value={departmentName}
              />

              {/* Doctor */}

              <InfoCard
                icon={<Stethoscope className="w-5 h-5" />}
                label={text.doctor}
                value={doctorName}
              />

              {/* Track */}

              <InfoCard
                icon={<HeartPulse className="w-5 h-5" />}
                label={text.track}
                value={
                  track === 'AYUSH'
                    ? text.ayush
                    : text.allopathy
                }
              />

            </div>

            {/* -------------------------------------------------
                DOCTOR AVAILABILITY
            ------------------------------------------------- */}

            {doctorAvailability && (
              <div
                className="
                  mt-4
                  p-4
                  rounded-2xl
                  bg-slate-50
                  border border-slate-200
                  text-sm
                  text-slate-700
                "
              >
                <div className="font-bold text-slate-900 mb-1">
                  {isHindi
                    ? 'रूटिंग स्थिति'
                    : 'Routing Status'}
                </div>

                <div>
                  {typeof doctorAvailability === 'string'
                    ? doctorAvailability
                    : doctorAvailability.message ||
                      doctorAvailability.status ||
                      doctorAvailability.availability_status ||
                      'Routing confirmed'}
                </div>
              </div>
            )}

            {/* -------------------------------------------------
                RED FLAG / PRIORITY ALERT
            ------------------------------------------------- */}

            {redFlagDetected && (
              <div
                className="
                  mt-4
                  rounded-2xl
                  border-2
                  border-amber-300
                  bg-amber-50
                  p-4
                  sm:p-5
                "
              >

                <div className="flex items-start gap-3">

                  <div
                    className="
                      shrink-0
                      w-10 h-10
                      rounded-xl
                      bg-amber-100
                      text-amber-700
                      flex items-center justify-center
                    "
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">

                    <div
                      className="
                        font-black
                        text-amber-900
                        text-sm
                        sm:text-base
                      "
                    >
                      {text.priority}
                    </div>

                    <p
                      className="
                        mt-1
                        text-xs
                        sm:text-sm
                        text-amber-800
                        leading-relaxed
                      "
                    >
                      {text.priorityMessage}
                    </p>

                    {redFlags?.length > 0 && (
                      <div className="mt-2 text-xs text-amber-800">
                        {redFlags.length}{' '}
                        {isHindi
                          ? 'प्राथमिकता संकेत रिकॉर्ड किए गए हैं।'
                          : 'priority indicator(s) recorded.'}
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* -------------------------------------------------
                WAITING MESSAGE
            ------------------------------------------------- */}

            <div
              className="
                mt-5
                rounded-2xl
                bg-teal-50
                border border-teal-100
                p-4
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  shrink-0
                  w-9 h-9
                  rounded-xl
                  bg-teal-100
                  text-teal-800
                  flex
                  items-center
                  justify-center
                "
              >
                <Clock3 className="w-5 h-5" />
              </div>

              <p
                className="
                  text-sm
                  text-teal-900
                  leading-relaxed
                "
              >
                {text.waitingMessage}
              </p>

            </div>

            {/* -------------------------------------------------
                SECURITY MESSAGE
            ------------------------------------------------- */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-2
                text-xs
                sm:text-sm
                text-slate-500
                text-center
              "
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />

              <span>
                {text.secure}
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div
          className="
            mt-6
            flex
            flex-col-reverse
            sm:flex-row
            justify-center
            gap-3
            sm:gap-4
          "
        >

          {/* New Check-In */}

          <button
            type="button"
            onClick={resetSession}
            className="
              min-h-[60px]
              px-6
              sm:px-8
              rounded-2xl
              border-2
              border-slate-200
              bg-white
              text-slate-800
              font-bold
              text-base
              flex
              items-center
              justify-center
              gap-2
              hover:bg-slate-50
              active:scale-[0.98]
              transition
              shadow-sm
              cursor-pointer
            "
          >
            <RotateCcw className="w-5 h-5" />

            <span>
              {text.newCheckIn}
            </span>
          </button>

          {/* Print */}

          <button
            type="button"
            onClick={handlePrint}
            className="
              min-h-[60px]
              px-6
              sm:px-8
              rounded-2xl
              bg-teal-800
              text-white
              font-bold
              text-base
              flex
              items-center
              justify-center
              gap-2
              hover:bg-teal-700
              active:scale-[0.98]
              transition
              shadow-md
              cursor-pointer
            "
          >
            <Printer className="w-5 h-5" />

            <span>
              {text.print}
            </span>
          </button>

        </div>

        {/* =================================================
            KIOSK FOOTER
        ================================================= */}

        <div
          className="
            mt-5
            text-center
            text-[11px]
            sm:text-xs
            text-slate-400
          "
        >
          {isHindi
            ? 'कृपया अपना टोकन नंबर सुरक्षित रखें।'
            : 'Please keep your token number safe.'}
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