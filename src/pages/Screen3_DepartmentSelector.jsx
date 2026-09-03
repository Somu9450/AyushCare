import React, { useState } from 'react';
import { 
  Leaf, 
  Stethoscope, 
  Heart, 
  Activity, 
  Brain, 
  Sparkles, 
  Info, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Eye,
  Bone,
  Baby,
  Feather
} from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import AudioButton from '../components/common/AudioButton';

// Clinical Departments for AYUSH & Allopathy
const DEPARTMENTS = {
  AYUSH: [
    {
      id: 'kayachikitsa',
      name: 'Kayachikitsa',
      hi: 'कायाचिकित्सा',
      parallel: 'Internal Medicine & Chronic Metabolic Disorders',
      agniParallel: 'Agni (Digestive Fire) & Metabolism balance',
      desc: 'Holistic management of diabetes, arthritis, hypertension, gastrointestinal diseases, and chronic fatigue.',
      icon: Leaf,
      badge: 'Ayurveda Core'
    },
    {
      id: 'panchakarma',
      name: 'Panchakarma',
      hi: 'पंचकर्म चिकित्सा',
      parallel: 'Bio-Purification, Detoxification & Cellular Rejuvenation',
      agniParallel: 'Shodhana (deep cellular detox) & toxin elimination',
      desc: 'Vamana, Virechana, Basti, Nasya, and Raktamokshana therapies for autoimmune and neuro-muscular disorders.',
      icon: Sparkles,
      badge: 'Purification'
    },
    {
      id: 'shalya_tantra',
      name: 'Shalya Tantra',
      hi: 'शल्य तंत्र (आयुर्वेदिक सर्जरी)',
      parallel: 'General Surgery, Anorectal Clinic & Wound Care',
      agniParallel: 'Kshara Sutra & Marma pressure therapies',
      desc: 'Specialized parasurgical techniques, Kshara Sutra ligation for fistula/piles, and healing of chronic diabetic ulcers.',
      icon: Activity,
      badge: 'Surgical & Marma'
    },
    {
      id: 'shalakya_tantra',
      name: 'Shalakya Tantra',
      hi: 'शालाक्य तंत्र',
      parallel: 'Ophthalmology, ENT & Head / Neck Disorders',
      agniParallel: 'Netra Tarpana & sensory organ rejuvenation',
      desc: 'Management of myopia, dry eye, sinusitis, migraines, tinnitus, and cervical spine stress.',
      icon: Eye,
      badge: 'ENT & Eye'
    },
    {
      id: 'kaumarbhritya',
      name: 'Kaumarbhritya',
      hi: 'कौमारभृत्य',
      parallel: 'Pediatrics & Pediatric Neuro-Development',
      agniParallel: 'Suvarna Prashan & Bal Rog Immunity',
      desc: 'Infant growth, ADHD, asthma in children, and immunity enhancement through traditional herbal formulation.',
      icon: Baby,
      badge: 'Pediatrics'
    },
    {
      id: 'swasthavritta',
      name: 'Rasayana & Swasthavritta',
      hi: 'रसायन एवं स्वस्थवृत्त',
      parallel: 'Preventive Medicine, Yoga & Lifestyle Health',
      agniParallel: 'Ojas (vitality) & longevity enhancement',
      desc: 'Personalized dietary regimens, circadian rhythm correction, and therapeutic Yoga for lifestyle disorders.',
      icon: Feather,
      badge: 'Wellness & Yoga'
    }
  ],
  ALLOPATHY: [
    {
      id: 'general_medicine',
      name: 'General Medicine',
      hi: 'जनरल मेडिसिन',
      parallel: 'Adult Primary Care & Infection Triage',
      desc: 'Fever, respiratory viral infections, diabetes control, acute pain, and diagnostic evaluations.',
      icon: Stethoscope,
      badge: 'OPD 1'
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      hi: 'कार्डियोलॉजी (हृदय रोग)',
      parallel: 'Cardiovascular Health & ECG / Echo Screening',
      desc: 'Chest discomfort, hypertension, arrhythmias, post-angioplasty care, and lipid profiling.',
      icon: Heart,
      badge: 'Super Specialty'
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics & Joint Care',
      hi: 'अस्थि एवं जोड़ रोग',
      parallel: 'Musculoskeletal, Fracture & Spine Triage',
      desc: 'Knee arthritis, disc herniation, fractures, sports injuries, and physical rehabilitation.',
      icon: Bone,
      badge: 'Trauma & Bone'
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      hi: 'बाल रोग विशेषज्ञ',
      parallel: 'Child Health, Immunization & Neonatology',
      desc: 'Comprehensive child healthcare, national vaccination schedule, and childhood allergies.',
      icon: Baby,
      badge: 'Pediatric OPD'
    }
  ]
};

// Doctors list with simulated OPD weekly schedules
// Today is simulated as Thursday for realistic kiosk constraints
const DOCTORS_DATABASE = [
  {
    id: 'dr_atul_agarwal',
    name: 'Dr. Atul Agarwal',
    deptId: 'cardiology',
    track: 'ALLOPATHY',
    qualification: 'MD, DM (Cardiology), AIIMS',
    room: 'Room 104, Block B',
    days: ['Monday', 'Thursday'],
    availableToday: true, // Today is Thursday
    timing: '09:00 AM - 01:00 PM'
  },
  {
    id: 'dr_priya_sharma',
    name: 'Dr. Priya Sharma',
    deptId: 'general_medicine',
    track: 'ALLOPATHY',
    qualification: 'MD (Internal Medicine)',
    room: 'Room 102, Block A',
    days: ['Tuesday', 'Friday'],
    availableToday: false, // Not today
    timing: '09:00 AM - 02:00 PM',
    nextAvailable: 'Friday (Tomorrow, 09:00 AM)'
  },
  {
    id: 'vaidya_ramanathan',
    name: 'Vaidya K. Ramanathan',
    deptId: 'kayachikitsa',
    track: 'AYUSH',
    qualification: 'BAMS, MD (Ayurveda), Banaras Hindu University',
    room: 'Ayush OPD 1, Dhanvantari Block',
    days: ['Monday', 'Wednesday', 'Friday'],
    availableToday: false, // Not today (Thu)
    timing: '08:30 AM - 01:30 PM',
    nextAvailable: 'Friday (Tomorrow, 08:30 AM)'
  },
  {
    id: 'vaidya_ananya_sen',
    name: 'Vaidya Ananya Sen',
    deptId: 'panchakarma',
    track: 'AYUSH',
    qualification: 'BAMS, MS (Ayurveda), Gujarat Ayurved University',
    room: 'Ayush OPD 3, Panchakarma Wing',
    days: ['Thursday', 'Saturday'],
    availableToday: true, // Today is Thursday
    timing: '09:00 AM - 02:00 PM'
  },
  {
    id: 'vaidya_harish_verma',
    name: 'Vaidya Harish Chandra Verma',
    deptId: 'shalya_tantra',
    track: 'AYUSH',
    qualification: 'BAMS, MS (Shalya Tantra - Kshara Sutra Specialist)',
    room: 'Ayush OPD 4, Sushruta Wing',
    days: ['Thursday', 'Friday'],
    availableToday: true,
    timing: '09:30 AM - 01:30 PM'
  }
];

// Ayurvedic terminology quick helper definitions
const AYURVEDIC_TERMS = [
  { term: 'Agni (अग्नि)', parallel: 'Digestive Fire & Metabolic Power', desc: 'The fundamental biological energy responsible for digesting food, cellular assimilation, and systemic metabolic waste burning.' },
  { term: 'Tridosha (त्रिदोष)', parallel: 'Bio-Energetic Constituents', desc: 'Vata (movement & neurological), Pitta (transformation & enzymatic heat), Kapha (structure, lubrication & immunity).' },
  { term: 'Dhatu (सप्त धातु)', parallel: 'Seven Tissue Layers', desc: 'Plasma (Rasa), Blood (Rakta), Muscle (Mamsa), Fat (Meda), Bone (Asthi), Marrow/Nerve (Majja), Vital Reproductive/Immune Essence (Shukra/Ojas).' },
  { term: 'Panchakarma (पंचकर्म)', parallel: 'Five Detoxification Therapies', desc: 'Clinical bio-purification techniques designed to evacuate deep-seated cellular toxins (Ama) from tissues.' }
];

export const Screen3_DepartmentSelector = () => {
  const { sessionData, updateSessionData, nextScreen, language } = useKioskStore();
  const { t } = useTranslation();

  const [selectedTrack, setSelectedTrack] = useState(sessionData.track || 'AYUSH');
  const [selectedDept, setSelectedDept] = useState(sessionData.selectedDepartment || DEPARTMENTS.AYUSH[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(sessionData.requestedDoctor || null);
  const [showGlossary, setShowGlossary] = useState(false);

  // Filter departments by track
  const currentDepartments = DEPARTMENTS[selectedTrack] || DEPARTMENTS.AYUSH;

  // Filter doctors by selected department and track
  const departmentDoctors = DOCTORS_DATABASE.filter(
    (doc) => doc.track === selectedTrack && doc.deptId === selectedDept?.id
  );

  const handleTrackChange = (track) => {
    setSelectedTrack(track);
    const newDept = DEPARTMENTS[track][0];
    setSelectedDept(newDept);
    setSelectedDoctor(null);
    updateSessionData({ track, selectedDepartment: newDept, requestedDoctor: null });
  };

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setSelectedDoctor(null);
    updateSessionData({ selectedDepartment: dept, requestedDoctor: null });
  };

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    updateSessionData({ requestedDoctor: doc });
  };

  const handleProceed = () => {
    updateSessionData({
      track: selectedTrack,
      selectedDepartment: selectedDept,
      requestedDoctor: selectedDoctor
    });
    nextScreen();
  };

  const audioPrompt = language === 'hi'
    ? 'कृपया अपनी चिकित्सा पद्धति आयुष अथवा एलोपैथी चुनें, फिर संबंधित विभाग एवं चिकित्सक का चयन करें।'
    : 'Please choose your preferred healthcare track: Ayush or Allopathy, then select your clinical department and doctor.';

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full select-none animate-in fade-in duration-300">
      
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Integrative Health Triage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('screen3.title', 'Choose Medical Track & Department')}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {t('screen3.subtitle', 'Select between holistic Ayush therapy or standard Allopathy consultation')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowGlossary(!showGlossary)}
            className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span>{showGlossary ? 'Hide Terminology Guide' : 'Ayurvedic Terminology Guide'}</span>
          </button>
          <AudioButton textToRead={audioPrompt} />
        </div>
      </div>

      {/* Ayurvedic Terminology Helper Drawer (if open) */}
      {showGlossary && (
        <div className="my-4 p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-amber-950 text-sm uppercase tracking-wide">
                {t('screen3.terminologyHelperTitle', 'Ayurvedic Terminology Guide')}
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-medium">Allopathic parallels for patients</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AYURVEDIC_TERMS.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{item.term}</span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {item.parallel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dual-Track Toggle Bar (AYUSH vs ALLOPATHY) */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* AYUSH Track Card */}
        <button
          type="button"
          onClick={() => handleTrackChange('AYUSH')}
          className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative min-h-[96px] ${
            selectedTrack === 'AYUSH'
              ? 'bg-gradient-to-br from-teal-900 to-teal-800 text-white border-amber-400 shadow-xl ring-4 ring-amber-400/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedTrack === 'AYUSH' ? 'bg-white/20 text-amber-300' : 'bg-teal-100 text-teal-800'
              }`}>
                <Leaf className="w-7 h-7" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wide block">
                  {t('screen3.trackAyush', 'AYUSH Integrative Medicine')}
                </span>
                <span className={`text-xs block ${selectedTrack === 'AYUSH' ? 'text-teal-200' : 'text-slate-500'}`}>
                  {t('screen3.trackAyushDesc')}
                </span>
              </div>
            </div>

            {selectedTrack === 'AYUSH' && (
              <span className="bg-amber-400 text-teal-950 font-black text-xs px-2.5 py-1 rounded-full uppercase">
                Selected
              </span>
            )}
          </div>
        </button>

        {/* Allopathy Track Card */}
        <button
          type="button"
          onClick={() => handleTrackChange('ALLOPATHY')}
          className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative min-h-[96px] ${
            selectedTrack === 'ALLOPATHY'
              ? 'bg-gradient-to-br from-teal-900 to-teal-800 text-white border-amber-400 shadow-xl ring-4 ring-amber-400/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedTrack === 'ALLOPATHY' ? 'bg-white/20 text-amber-300' : 'bg-slate-100 text-slate-800'
              }`}>
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wide block">
                  {t('screen3.trackAllopathy', 'Modern Allopathy Care')}
                </span>
                <span className={`text-xs block ${selectedTrack === 'ALLOPATHY' ? 'text-teal-200' : 'text-slate-500'}`}>
                  {t('screen3.trackAllopathyDesc')}
                </span>
              </div>
            </div>

            {selectedTrack === 'ALLOPATHY' && (
              <span className="bg-amber-400 text-teal-950 font-black text-xs px-2.5 py-1 rounded-full uppercase">
                Selected
              </span>
            )}
          </div>
        </button>

      </div>

      {/* Main Grid: Department Grid (Left 7 Cols) + Doctor Schedule Filter (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Department Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{t('screen3.chooseDept', 'Select Clinical Department')}</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {currentDepartments.length} Available
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentDepartments.map((dept) => {
              const IconComp = dept.icon;
              const isSelected = selectedDept?.id === dept.id;

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDeptSelect(dept)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[140px] relative ${
                    isSelected
                      ? 'bg-teal-50 border-teal-700 shadow-md ring-2 ring-teal-600/30'
                      : 'bg-white border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-teal-800 text-amber-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                        {dept.badge}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                      {language === 'hi' ? dept.hi : dept.name}
                    </h4>
                    <p className="text-[11px] font-bold text-teal-800 mt-0.5 line-clamp-1">
                      {dept.parallel}
                    </p>
                  </div>

                  {dept.agniParallel && (
                    <div className="mt-2 pt-2 border-t border-teal-200/50 text-[10px] text-slate-600">
                      <span className="font-semibold text-teal-900">Principle: </span>
                      <span>{dept.agniParallel}</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 text-teal-700">
                      <CheckCircle2 className="w-5 h-5 fill-teal-700 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Doctor Selection & Scheduling Constraints Filter */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-700" />
                <span>{t('screen3.filterDoctor', 'Doctor Selection & Schedule Filter')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('screen3.filterDoctorPrompt')}
              </p>
            </div>

            {/* General OPD Duty Option */}
            <button
              type="button"
              onClick={() => handleDoctorSelect(null)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selectedDoctor === null
                  ? 'bg-teal-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50/40 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    selectedDoctor === null ? 'bg-white/20 text-amber-300' : 'bg-teal-100 text-teal-800'
                  }`}>
                    OPD
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">General OPD Duty Specialist</h5>
                    <p className={`text-xs ${selectedDoctor === null ? 'text-teal-200' : 'text-slate-500'}`}>
                      Fastest assignment (Next available consultation)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded">
                  Available Now
                </span>
              </div>
            </button>

            {/* Specific Doctors in Selected Department */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Department Specialists ({selectedDept?.name})
              </span>

              {departmentDoctors.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                  No individual specialist schedule listed today for this sub-clinic. General Duty Doctor will attend.
                </div>
              ) : (
                departmentDoctors.map((doc) => {
                  const isChosen = selectedDoctor?.id === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDoctorSelect(doc)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 ${
                        isChosen
                          ? 'bg-teal-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-extrabold text-sm">{doc.name}</h5>
                          <p className={`text-[11px] font-medium ${isChosen ? 'text-teal-200' : 'text-slate-500'}`}>
                            {doc.qualification}
                          </p>
                        </div>
                        {doc.availableToday ? (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded shadow-xs">
                            Available Today
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            {doc.nextAvailable || 'Next Slot'}
                          </span>
                        )}
                      </div>

                      <div className={`text-xs flex items-center gap-3 pt-1 border-t ${
                        isChosen ? 'border-teal-800 text-teal-200' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{doc.timing}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{doc.days.join(', ')}</span>
                        </div>
                      </div>

                      {/* Scheduling Constraint Warning Notice */}
                      {!doc.availableToday && isChosen && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 text-xs flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                          <span>
                            {t('screen3.scheduleWarning', 'Doctor is not consulting today. You may choose an available duty specialist or book for their next OPD slot.')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Selection Confirmation Card */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                {t('screen3.selectedSummary', 'Your Current Selection')}:
              </span>
              <div className="flex items-center justify-between text-slate-800">
                <span className="text-slate-500">Track:</span>
                <span className="font-bold">{selectedTrack}</span>
              </div>
              <div className="flex items-center justify-between text-slate-800">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold">{selectedDept?.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-800">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-teal-800">
                  {selectedDoctor ? selectedDoctor.name : 'General Duty Specialist (Today)'}
                </span>
              </div>
            </div>

            {/* Proceed Action Button */}
            <button
              type="button"
              onClick={handleProceed}
              className="w-full min-h-[58px] bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all"
            >
              <span>Confirm & Proceed to Symptoms</span>
              <ArrowRight className="w-5 h-5 text-amber-300" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Screen3_DepartmentSelector;
