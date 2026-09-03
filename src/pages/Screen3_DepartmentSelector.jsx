import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  HelpCircle,
  Leaf,
  Search,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import AudioButton from '../components/common/AudioButton';

/* =========================================================
   DEPARTMENTS
========================================================= */

const DEPARTMENTS = {
  AYUSH: [
    {
      id: 'kayachikitsa',
      name: 'Kayachikitsa',
      hi: 'कायाचिकित्सा',
      parallel: 'Internal Medicine',
      description:
        'General Ayurvedic medical care, chronic conditions and metabolic disorders.',
      icon: '🌿',
    },
    {
      id: 'panchakarma',
      name: 'Panchakarma',
      hi: 'पंचकर्म',
      parallel: 'Therapeutic purification',
      description:
        'Ayurvedic therapeutic procedures and supervised Panchakarma care.',
      icon: '✨',
    },
    {
      id: 'shalya_tantra',
      name: 'Shalya Tantra',
      hi: 'शल्य तंत्र',
      parallel: 'Surgery & wound care',
      description:
        'Parasurgical procedures, wound care and related Ayurvedic surgical services.',
      icon: '🩺',
    },
    {
      id: 'shalakya_tantra',
      name: 'Shalakya Tantra',
      hi: 'शालाक्य तंत्र',
      parallel: 'Eye, ENT & head-neck',
      description:
        'Conditions involving eyes, ears, nose, throat and head-neck region.',
      icon: '👁️',
    },
    {
      id: 'kaumarbhritya',
      name: 'Kaumarbhritya',
      hi: 'कौमारभृत्य',
      parallel: 'Pediatrics',
      description:
        'Ayurvedic care for infants, children and adolescent health.',
      icon: '👶',
    },
    {
      id: 'swasthavritta',
      name: 'Swasthavritta',
      hi: 'स्वस्थवृत्त',
      parallel: 'Preventive & lifestyle care',
      description:
        'Preventive healthcare, diet, lifestyle and wellness guidance.',
      icon: '🧘',
    },
  ],

  ALLOPATHY: [
    {
      id: 'general_medicine',
      name: 'General Medicine',
      hi: 'जनरल मेडिसिन',
      parallel: 'Adult primary care',
      description:
        'Fever, infections, chronic diseases and general medical complaints.',
      icon: '🩺',
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      hi: 'कार्डियोलॉजी',
      parallel: 'Heart & circulation',
      description:
        'Heart-related symptoms, hypertension and cardiovascular conditions.',
      icon: '❤️',
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      hi: 'अस्थि एवं जोड़ रोग',
      parallel: 'Bones, joints & spine',
      description:
        'Joint pain, fractures, spine problems and musculoskeletal conditions.',
      icon: '🦴',
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      hi: 'बाल रोग',
      parallel: 'Child healthcare',
      description:
        'Medical care for infants, children and adolescents.',
      icon: '👶',
    },
  ],
};

/* =========================================================
   DOCTORS
========================================================= */

const DOCTORS = [
  {
    id: 'dr_atul_agarwal',
    name: 'Dr. Atul Agarwal',
    departmentId: 'cardiology',
    track: 'ALLOPATHY',
    qualification: 'MD, DM (Cardiology)',
    room: 'Room 104',
    days: ['Monday', 'Thursday'],
    availableToday: true,
    timing: '09:00 AM – 01:00 PM',
  },

  {
    id: 'dr_priya_sharma',
    name: 'Dr. Priya Sharma',
    departmentId: 'general_medicine',
    track: 'ALLOPATHY',
    qualification: 'MD (Internal Medicine)',
    room: 'Room 102',
    days: ['Tuesday', 'Friday'],
    availableToday: false,
    timing: '09:00 AM – 02:00 PM',
    nextAvailable: 'Friday, 09:00 AM',
  },

  {
    id: 'vaidya_ramanathan',
    name: 'Vaidya K. Ramanathan',
    departmentId: 'kayachikitsa',
    track: 'AYUSH',
    qualification: 'BAMS, MD (Ayurveda)',
    room: 'Ayush OPD 1',
    days: ['Monday', 'Wednesday', 'Friday'],
    availableToday: false,
    timing: '08:30 AM – 01:30 PM',
    nextAvailable: 'Friday, 08:30 AM',
  },

  {
    id: 'vaidya_ananya_sen',
    name: 'Vaidya Ananya Sen',
    departmentId: 'panchakarma',
    track: 'AYUSH',
    qualification: 'BAMS, MS (Ayurveda)',
    room: 'Ayush OPD 3',
    days: ['Thursday', 'Saturday'],
    availableToday: true,
    timing: '09:00 AM – 02:00 PM',
  },

  {
    id: 'vaidya_harish_verma',
    name: 'Vaidya Harish Chandra Verma',
    departmentId: 'shalya_tantra',
    track: 'AYUSH',
    qualification: 'BAMS, MS (Shalya Tantra)',
    room: 'Ayush OPD 4',
    days: ['Thursday', 'Friday'],
    availableToday: true,
    timing: '09:30 AM – 01:30 PM',
  },
];

/* =========================================================
   AYURVEDIC GLOSSARY
========================================================= */

const AYURVEDIC_TERMS = [
  {
    term: 'Agni',
    hindi: 'अग्नि',
    plain: 'Digestive strength',
    plainHindi: 'पाचन शक्ति',
    description:
      'How well your body digests and processes food.',
  },

  {
    term: 'Kostha',
    hindi: 'कोष्ठ',
    plain: 'Bowel habit',
    plainHindi: 'पेट साफ होने की आदत',
    description:
      'Your usual bowel movement pattern and regularity.',
  },

  {
    term: 'Prakriti',
    hindi: 'प्रकृति',
    plain: 'Body constitution',
    plainHindi: 'शरीर की मूल प्रकृति',
    description:
      'Your traditional Ayurvedic constitution.',
  },

  {
    term: 'Vikriti',
    hindi: 'विकृति',
    plain: 'Current imbalance',
    plainHindi: 'वर्तमान असंतुलन',
    description:
      'The current state of imbalance described in Ayurvedic assessment.',
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const Screen3_DepartmentSelector = () => {

  const {
    sessionData,
    updateSessionData,
    nextScreen,
    language,
  } = useKioskStore();

  const { t } = useTranslation();

  const [selectedTrack, setSelectedTrack] =
    useState(
      sessionData.track || 'AYUSH'
    );

  const [selectedDepartment, setSelectedDepartment] =
    useState(
      sessionData.selectedDepartment ||
        DEPARTMENTS.AYUSH[0]
    );

  const [selectedDoctor, setSelectedDoctor] =
    useState(
      sessionData.requestedDoctor || null
    );

  const [showGlossary, setShowGlossary] =
    useState(false);

  const [doctorSearch, setDoctorSearch] =
    useState('');

  /* -------------------------------------------------------
     DEPARTMENTS
  -------------------------------------------------------- */

  const departments =
    DEPARTMENTS[selectedTrack];

  /* -------------------------------------------------------
     DOCTORS
  -------------------------------------------------------- */

  const departmentDoctors =
    useMemo(() => {

      const normalized =
        doctorSearch
          .trim()
          .toLowerCase();

      return DOCTORS.filter(
        (doctor) => {

          const matchesDepartment =
            doctor.track === selectedTrack &&
            doctor.departmentId ===
              selectedDepartment?.id;

          const matchesSearch =
            !normalized ||
            doctor.name
              .toLowerCase()
              .includes(normalized);

          return (
            matchesDepartment &&
            matchesSearch
          );
        }
      );

    }, [
      selectedTrack,
      selectedDepartment,
      doctorSearch,
    ]);

  /* -------------------------------------------------------
     TRACK CHANGE
  -------------------------------------------------------- */

  const handleTrackChange = (track) => {

    const firstDepartment =
      DEPARTMENTS[track][0];

    setSelectedTrack(track);
    setSelectedDepartment(
      firstDepartment
    );
    setSelectedDoctor(null);

    updateSessionData({
      track,
      selectedDepartment:
        firstDepartment,
      requestedDoctor: null,
    });
  };

  /* -------------------------------------------------------
     DEPARTMENT CHANGE
  -------------------------------------------------------- */

  const handleDepartmentChange = (
    department
  ) => {

    setSelectedDepartment(
      department
    );

    setSelectedDoctor(null);

    updateSessionData({
      selectedDepartment:
        department,
      requestedDoctor: null,
    });
  };

  /* -------------------------------------------------------
     DOCTOR
  -------------------------------------------------------- */

  const handleDoctorSelect = (
    doctor
  ) => {

    setSelectedDoctor(doctor);

    updateSessionData({
      requestedDoctor:
        doctor,
    });
  };

  const clearDoctor = () => {

    setSelectedDoctor(null);

    updateSessionData({
      requestedDoctor: null,
    });
  };

  /* -------------------------------------------------------
     CONTINUE
  -------------------------------------------------------- */

  const handleContinue = () => {

    updateSessionData({
      track: selectedTrack,
      selectedDepartment,
      requestedDoctor:
        selectedDoctor,
    });

    nextScreen();
  };

  const audioPrompt =
    language === 'hi'
      ? 'आयुष या एलोपैथी चुनें। फिर अपना विभाग और यदि चाहें तो किसी विशेष डॉक्टर का चयन करें।'
      : 'Choose Ayush or Allopathy, then select your department and optionally request a specific doctor.';

  return (
    <div className="flex-1 px-4 py-6 sm:px-6 md:px-10">

      <div className="w-full max-w-6xl mx-auto">

        {/* --------------------------------------------------
            HEADER
        --------------------------------------------------- */}

        <div className="flex items-start justify-between gap-4 mb-5">

          <div>

            <p className="text-xs font-black uppercase tracking-wider text-teal-700">
              Step 2 · Care selection
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Choose your department
            </h1>

            <p className="mt-1 text-sm sm:text-base text-slate-500">
              अपना विभाग चुनें
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowGlossary(
                (previous) =>
                  !previous
              )
            }
            className="
              min-h-[48px]
              px-3
              sm:px-4
              rounded-xl
              border
              border-teal-200
              bg-teal-50
              text-teal-800
              text-xs
              sm:text-sm
              font-bold
              flex
              items-center
              gap-2
              cursor-pointer
              shrink-0
            "
          >

            <HelpCircle className="w-5 h-5" />

            <span className="hidden sm:inline">
              {showGlossary
                ? 'Hide guide'
                : 'Ayurveda guide'}
            </span>

          </button>

        </div>

        {/* --------------------------------------------------
            TRACK
        --------------------------------------------------- */}

        <div className="grid grid-cols-2 gap-3 mb-5">

          <button
            type="button"
            onClick={() =>
              handleTrackChange('AYUSH')
            }
            className={`
              min-h-[94px]
              rounded-2xl
              border-2
              p-4
              text-left
              cursor-pointer
              transition
              ${
                selectedTrack === 'AYUSH'
                  ? 'border-teal-700 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }
            `}
          >

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                🌿
              </div>

              <div>

                <p className="font-black text-slate-900">
                  AYUSH
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  आयुष चिकित्सा
                </p>

              </div>

            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              handleTrackChange(
                'ALLOPATHY'
              )
            }
            className={`
              min-h-[94px]
              rounded-2xl
              border-2
              p-4
              text-left
              cursor-pointer
              transition
              ${
                selectedTrack ===
                'ALLOPATHY'
                  ? 'border-teal-700 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }
            `}
          >

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                🩺
              </div>

              <div>

                <p className="font-black text-slate-900">
                  Allopathy
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  एलोपैथी चिकित्सा
                </p>

              </div>

            </div>

          </button>

        </div>

        {/* --------------------------------------------------
            AYURVEDIC GLOSSARY
        --------------------------------------------------- */}

        {showGlossary && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <Leaf className="w-5 h-5 text-amber-700 mt-0.5" />

                <div>

                  <p className="font-black text-amber-950">
                    Ayurveda terms explained
                  </p>

                  <p className="text-xs text-amber-800 mt-1">
                    आसान भाषा में आयुर्वेदिक शब्द
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowGlossary(false)
                }
                className="w-10 h-10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5 text-amber-700" />
              </button>

            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

              {AYURVEDIC_TERMS.map(
                (item) => (
                  <div
                    key={item.term}
                    className="bg-white rounded-xl border border-amber-200 p-4"
                  >

                    <p className="font-black text-slate-900">
                      {item.term}{' '}
                      <span className="font-bold text-teal-700">
                        ({item.hindi})
                      </span>
                    </p>

                    <p className="mt-1 text-sm font-bold text-teal-800">
                      {item.plain}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {item.plainHindi}
                    </p>

                    <p className="text-xs text-slate-600 mt-3 leading-5">
                      {item.description}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* --------------------------------------------------
            DEPARTMENT GRID
        --------------------------------------------------- */}

        <section>

          <div className="mb-3">

            <h2 className="text-base font-black text-slate-900">
              Select department
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              संबंधित विभाग चुनें
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {departments.map(
              (department) => {

                const selected =
                  selectedDepartment?.id ===
                  department.id;

                return (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() =>
                      handleDepartmentChange(
                        department
                      )
                    }
                    className={`
                      min-h-[132px]
                      rounded-2xl
                      border-2
                      p-4
                      text-left
                      cursor-pointer
                      transition
                      ${
                        selected
                          ? 'border-teal-700 bg-teal-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }
                    `}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <span className="text-2xl">
                        {department.icon}
                      </span>

                      {selected && (
                        <span className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </span>
                      )}

                    </div>

                    <p className="mt-3 font-black text-slate-900">
                      {department.name}
                    </p>

                    <p className="text-xs font-bold text-teal-700 mt-1">
                      {department.hi}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      {department.parallel}
                    </p>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* --------------------------------------------------
            DOCTOR SELECTION
        --------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <UserRound className="w-5 h-5 text-teal-700" />

                <h2 className="font-black text-slate-900">
                  Consult a specific doctor
                </h2>

              </div>

              <p className="text-xs text-slate-500 mt-1">
                किसी विशेष डॉक्टर को चुनें (वैकल्पिक)
              </p>

            </div>

            <div className="relative w-full sm:w-64">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                value={doctorSearch}
                onChange={(event) =>
                  setDoctorSearch(
                    event.target.value
                  )
                }
                placeholder="Search doctor"
                className="
                  w-full
                  min-h-[50px]
                  pl-10
                  pr-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  text-sm
                  outline-none
                  focus:border-teal-700
                "
              />

            </div>

          </div>

          <div className="mt-4 space-y-3">

            {departmentDoctors.length === 0 && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">

                <p className="text-sm font-bold text-slate-700">
                  No doctor found for this department.
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  You can continue with the department's general OPD.
                </p>

              </div>
            )}

            {departmentDoctors.map(
              (doctor) => {

                const selected =
                  selectedDoctor?.id ===
                  doctor.id;

                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() =>
                      handleDoctorSelect(
                        doctor
                      )
                    }
                    className={`
                      w-full
                      min-h-[104px]
                      rounded-xl
                      border-2
                      p-4
                      text-left
                      flex
                      items-start
                      gap-4
                      cursor-pointer
                      transition
                      ${
                        selected
                          ? 'border-teal-700 bg-teal-50'
                          : 'border-slate-200 bg-white'
                      }
                    `}
                  >

                    <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center shrink-0">

                      <Stethoscope className="w-5 h-5 text-teal-700" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="font-black text-slate-900">
                          {doctor.name}
                        </p>

                        {doctor.availableToday && (
                          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                            AVAILABLE TODAY
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        {doctor.qualification}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">

                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock3 className="w-3.5 h-3.5" />
                          {doctor.timing}
                        </span>

                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {doctor.days.join(', ')}
                        </span>

                      </div>

                      {!doctor.availableToday &&
                        doctor.nextAvailable && (
                          <p className="mt-2 text-xs font-bold text-amber-700">
                            Next available: {doctor.nextAvailable}
                          </p>
                        )}

                    </div>

                    {selected && (
                      <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">

                        <Check className="w-4 h-4" />

                      </div>
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* General OPD option */}

          {selectedDoctor && (
            <button
              type="button"
              onClick={clearDoctor}
              className="mt-3 min-h-[48px] px-3 text-xs font-bold text-slate-500 hover:text-teal-700 cursor-pointer"
            >
              Continue without a specific doctor
            </button>
          )}

        </section>

        {/* --------------------------------------------------
            SUMMARY
        --------------------------------------------------- */}

        <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">

          <div className="flex flex-wrap items-center gap-3 text-sm">

            <span className="font-black text-slate-800">
              Selected:
            </span>

            <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 font-bold">
              {selectedTrack === 'AYUSH'
                ? 'AYUSH'
                : 'Allopathy'}
            </span>

            <ChevronRight className="w-4 h-4 text-slate-400" />

            <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 font-bold">
              {selectedDepartment.name}
            </span>

            {selectedDoctor && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />

                <span className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                  {selectedDoctor.name}
                </span>
              </>
            )}

          </div>

        </div>

        {/* --------------------------------------------------
            CONTINUE
        --------------------------------------------------- */}

        <button
          type="button"
          onClick={handleContinue}
          className="
            mt-5
            w-full
            min-h-[78px]
            rounded-2xl
            bg-teal-700
            hover:bg-teal-800
            text-white
            px-6
            flex
            items-center
            justify-between
            cursor-pointer
            transition
            kiosk-focus
          "
        >

          <span className="text-left">

            <span className="block text-lg font-black">
              Continue
            </span>

            <span className="block text-xs text-teal-100 mt-1">
              लक्षणों की जानकारी देने के लिए आगे बढ़ें
            </span>

          </span>

          <ArrowRight className="w-6 h-6" />

        </button>

        {/* Audio helper */}

        <div className="mt-4 flex justify-center">

          <AudioButton
            textToRead={audioPrompt}
            label={
              language === 'hi'
                ? 'निर्देश सुनें'
                : 'Listen to instructions'
            }
          />

        </div>

      </div>

    </div>
  );
};

export default Screen3_DepartmentSelector;