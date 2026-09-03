import React, { useMemo, useState, useEffect } from 'react';
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
import KioskInput from '../components/common/KioskInput';
import { SkeletonDepartmentGrid, SkeletonDoctorList } from '../components/common/KioskSkeleton';

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
    },
    {
      id: 'panchakarma',
      name: 'Panchakarma',
      hi: 'पंचकर्म',
      parallel: 'Therapeutic purification',
      description:
        'Ayurvedic therapeutic procedures and supervised Panchakarma care.',
    },
    {
      id: 'shalya_tantra',
      name: 'Shalya Tantra',
      hi: 'शल्य तंत्र',
      parallel: 'Surgery & wound care',
      description:
        'Parasurgical procedures, wound care and related Ayurvedic surgical services.',
    },
    {
      id: 'shalakya_tantra',
      name: 'Shalakya Tantra',
      hi: 'शालाक्य तंत्र',
      parallel: 'Eye, ENT & head-neck',
      description:
        'Conditions involving eyes, ears, nose, throat and head-neck region.',
    },
    {
      id: 'kaumarbhritya',
      name: 'Kaumarbhritya',
      hi: 'कौमारभृत्य',
      parallel: 'Pediatrics',
      description:
        'Ayurvedic care for infants, children and adolescent health.',
    },
    {
      id: 'swasthavritta',
      name: 'Swasthavritta',
      hi: 'स्वस्थवृत्त',
      parallel: 'Preventive & lifestyle care',
      description:
        'Preventive healthcare, diet, lifestyle and wellness guidance.',
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
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      hi: 'कार्डियोलॉजी',
      parallel: 'Heart & circulation',
      description:
        'Heart-related symptoms, hypertension and cardiovascular conditions.',
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      hi: 'अस्थि एवं जोड़ रोग',
      parallel: 'Bones, joints & spine',
      description:
        'Joint pain, fractures, spine problems and musculoskeletal conditions.',
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      hi: 'बाल रोग',
      parallel: 'Child healthcare',
      description:
        'Medical care for infants, children and adolescents.',
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

  const { t, isHindi } = useTranslation();

  const [selectedTrack, setSelectedTrack] = useState(
    sessionData.track || 'AYUSH'
  );

  const departments = DEPARTMENTS[selectedTrack] || DEPARTMENTS.AYUSH;

  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    if (sessionData.selectedDepartment && typeof sessionData.selectedDepartment === 'object') {
      return sessionData.selectedDepartment;
    }
    return departments[0];
  });

  const [selectedDoctor, setSelectedDoctor] = useState(
    sessionData.requestedDoctor || null
  );

  const [showGlossary, setShowGlossary] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  useEffect(() => {
    if (!sessionData.selectedDepartment) {
      updateSessionData({
        track: selectedTrack,
        selectedDepartment: selectedDepartment || departments[0],
      });
    }
  }, []);

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

  const audioPrompt = t(
    'screen3.subtitle',
    'Choose Ayush or Allopathy, then select your department and optionally request a specific doctor.'
  );

  return (
    <div className="h-full w-full max-w-5xl mx-auto px-4 py-2 select-none flex flex-col justify-between">

      {/* --------------------------------------------------
          COMPACT HEADER
      --------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {t('screen3.stepLabel', 'Step 2 · Care Selection')}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {t('screen3.title', 'Choose your department')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('screen3.subtitle', 'Select between holistic Ayush therapy or modern clinical care')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AudioButton
            textToRead={audioPrompt}
            label={t('nav.listen', isHindi ? 'सुनें' : 'Listen')}
            className="min-h-[36px] py-1 text-xs"
          />

          <button
            type="button"
            onClick={() => setShowGlossary((prev) => !prev)}
            className="h-9 px-3 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{showGlossary ? 'Hide Guide' : 'Ayurveda Guide'}</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------
          TRACK SWITCHER (AYUSH vs ALLOPATHY)
      --------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          type="button"
          onClick={() => handleTrackChange('AYUSH')}
          className={`h-11 rounded-xl border-2 px-3 flex items-center gap-2.5 cursor-pointer transition text-left ${
            selectedTrack === 'AYUSH'
              ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-xs sm:text-sm text-slate-900 truncate">
              {t('screen3.trackAyush', 'AYUSH Integrative Care')}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {t('screen3.trackAyushDesc', 'Ayurveda, Yoga, Unani, Siddha, Homeo')}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTrackChange('ALLOPATHY')}
          className={`h-11 rounded-xl border-2 px-3 flex items-center gap-2.5 cursor-pointer transition text-left ${
            selectedTrack === 'ALLOPATHY'
              ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-xs sm:text-sm text-slate-900 truncate">
              {t('screen3.trackAllopathy', 'Allopathy Modern Medicine')}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {t('screen3.trackAllopathyDesc', 'General Medicine, Cardio, Ortho, Peds')}
            </p>
          </div>
        </button>
      </div>

      {/* --------------------------------------------------
          TWO-COLUMN ATM LAYOUT: DEPARTMENTS + DOCTOR ROUTING
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-3 items-start flex-1 min-h-0">

        {/* LEFT: 6 Department Cards in 3x2 Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-slate-800">
              {t('screen3.deptLabel', 'Select OPD Department')}
            </h2>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {departments.length} Available
            </span>
          </div>

          {isLoadingDepartments ? (
            <SkeletonDepartmentGrid />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {departments.map((department) => {
                const selected = selectedDepartment?.id === department.id;
                return (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() => handleDepartmentChange(department)}
                    className={`h-[74px] rounded-xl border-2 p-2 text-left cursor-pointer transition flex flex-col justify-between ${
                      selected
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs leading-tight truncate">
                        {isHindi ? department.hi : department.name}
                      </span>
                      {selected && (
                        <span className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-teal-700 truncate">
                      {isHindi ? department.name : department.hi}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {department.parallel}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Doctor Selection & Continue */}
        <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <UserRound className="w-4 h-4 text-teal-700" />
              <span>{t('screen3.doctorLabel', 'Consult Specific Doctor')}</span>
            </div>
            <span className="text-[10px] text-slate-400">Optional</span>
          </div>

          <KioskInput
            id="doctor-search"
            value={doctorSearch}
            onChange={setDoctorSearch}
            placeholder={t('screen3.searchDoctor', 'Search doctor...')}
            label="Search Doctor"
            prefixIcon={Search}
            inputClassName="h-8 text-xs py-0.5"
          />

          {/* Quick Doctor Choices */}
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-0.5">
            {isLoadingDoctors ? (
              <SkeletonDoctorList />
            ) : (
              <>
                {/* General OPD Option */}
                <button
                  type="button"
                  onClick={clearDoctor}
                  className={`h-11 rounded-xl border p-2 text-left flex items-center justify-between cursor-pointer transition ${
                    !selectedDoctor
                      ? 'border-teal-700 bg-teal-50/70 text-teal-900 font-bold'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black leading-tight truncate">
                      {t('screen3.noDoctor', 'Any Available Duty Doctor (Fastest OPD)')}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Immediate queue allocation</p>
                  </div>
                  {!selectedDoctor && (
                    <span className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                {/* Filtered Doctor List */}
                {departmentDoctors.slice(0, 2).map((doctor) => {
                  const selected = selectedDoctor?.id === doctor.id;
                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`h-11 rounded-xl border p-2 text-left flex items-center justify-between cursor-pointer transition ${
                        selected
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{doctor.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{doctor.experience}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold shrink-0">
                        {doctor.opdRoom}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Selected Summary Pill */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 flex items-center gap-1.5 text-xs">
            <span className="font-black text-slate-700 text-[11px]">Care:</span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-[11px]">
              {selectedTrack}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-[11px] truncate max-w-[120px]">
              {selectedDepartment?.name || 'General OPD'}
            </span>
            {selectedDoctor && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] truncate max-w-[100px]">
                  {selectedDoctor.name}
                </span>
              </>
            )}
          </div>

          {/* Action Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black flex items-center justify-between px-4 cursor-pointer transition text-sm shadow-xs"
          >
            <span>{t('nav.continue', 'Continue to Symptoms Intake')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* --------------------------------------------------
          GLOSSARY MODAL
      --------------------------------------------------- */}
      {showGlossary && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Ayurvedic Clinical Concepts</h3>
              <button
                type="button"
                onClick={() => setShowGlossary(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
              {AYURVEDIC_TERMS.map((item) => (
                <div key={item.term} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-xs text-teal-900">{item.term} ({item.hindi})</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Screen3_DepartmentSelector;