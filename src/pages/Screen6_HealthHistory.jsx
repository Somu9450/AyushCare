import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  History,
  Leaf,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import AudioButton from '../components/common/AudioButton';
import KioskInput from '../components/common/KioskInput';

const EMPTY_HISTORY = {
  pastIllnesses: [],
  surgeries: [],
  medications: [],
  allergies: [],
  familyHistory: '',
  personalHistory: '',
  smoking: '',
  alcohol: '',
  diet: '',
  sleep: '',
  ayush: {
    prakriti: '',
    agni: '',
    kostha: '',
  },
};

const makeId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;

const getAnswerLabel = (value, options) =>
  options.find(([id]) => id === value)?.[1] || value || 'Not recorded';

const AYUSH_LABELS = {
  prakriti: {
    vata: 'Vata',
    pitta: 'Pitta',
    kapha: 'Kapha',
    mixed: 'Mixed / combination',
    unknown: 'Not sure',
  },
  agni: {
    strong: 'Usually good digestion',
    variable: 'Variable digestion',
    weak: 'Often feels heavy',
    irregular: 'Very irregular',
  },
  kostha: {
    regular: 'Regular and comfortable',
    constipation: 'Often constipated',
    loose: 'Often loose',
    variable: 'Frequently changes',
  },
};

const AYUSH_OPTIONS = {
  prakriti: [
    ['vata', 'Vata'],
    ['pitta', 'Pitta'],
    ['kapha', 'Kapha'],
    ['mixed', 'Mixed / combination'],
    ['unknown', 'Not sure'],
  ],
  agni: [
    ['strong', 'Usually good digestion'],
    ['variable', 'Variable digestion'],
    ['weak', 'Often feels heavy'],
    ['irregular', 'Very irregular'],
  ],
  kostha: [
    ['regular', 'Regular and comfortable'],
    ['constipation', 'Often constipated'],
    ['loose', 'Often loose'],
    ['variable', 'Frequently changes'],
  ],
};

const Section = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <div>
        <h2 className="font-black text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>

    <div className="p-5">{children}</div>
  </section>
);

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
    {children}
  </div>
);

export const Screen6_HealthHistory = () => {
  const {
    sessionData,
    updateSessionData,
    nextScreen,
    prevScreen,
    language,
  } = useKioskStore();

  const { t, isHindi } = useTranslation();
  const isAyush = sessionData.track === 'AYUSH';

  const initialHistory = {
    ...EMPTY_HISTORY,
    ...(sessionData.healthHistory || {}),
    ayush: {
      ...EMPTY_HISTORY.ayush,
      ...(sessionData.healthHistory?.ayush || {}),
    },
  };

  const [history, setHistory] = useState(initialHistory);

  const [illnessInput, setIllnessInput] = useState('');
  const [surgeryInput, setSurgeryInput] = useState('');
  const [medicineInput, setMedicineInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const [expanded, setExpanded] = useState({
    illnesses: true,
    medications: true,
    allergies: true,
    personal: false,
    ayush: isAyush,
  });

  const symptomObjects = useMemo(() => {
    const ids = sessionData.symptoms || [];

    const names = {
      headache: 'Headache',
      chest_pain: 'Chest pain',
      breathlessness: 'Breathing difficulty',
      fever: 'Fever',
      fatigue: 'Weakness / fatigue',
      dizziness: 'Dizziness',
      abdominal_pain: 'Stomach pain',
      acidity: 'Acidity / heartburn',
      vomiting: 'Vomiting',
      diarrhea: 'Loose motions',
      joint_pain: 'Joint pain',
      back_pain: 'Back pain',
      stiffness: 'Stiffness',
      swelling: 'Swelling',
      cough: 'Cough',
      migraine: 'Migraine',
      neck_pain: 'Neck pain',
      vision_problem: 'Vision problem',
      palpitations: 'Palpitations',
    };

    return ids.map((id) => names[id] || id);
  }, [sessionData.symptoms]);

  const updateHistory = (patch) => {
    setHistory((previous) => {
      const updated = {
        ...previous,
        ...patch,
      };

      updateSessionData({
        healthHistory: updated,
      });

      return updated;
    });
  };

  const addListItem = (field, value, clear) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    const item = {
      id: makeId(field),
      value: cleanValue,
    };

    updateHistory({
      [field]: [...(history[field] || []), item],
    });

    clear('');
  };

  const removeListItem = (field, id) => {
    updateHistory({
      [field]: (history[field] || []).filter(
        (item) => item.id !== id
      ),
    });
  };

  const setAyushValue = (field, value) => {
    updateHistory({
      ayush: {
        ...history.ayush,
        [field]: value,
      },
    });
  };

  const handleContinue = () => {
    updateSessionData({
      healthHistory: history,
      healthHistoryCompleted: true,
    });

    nextScreen();
  };

  const [activeTab, setActiveTab] = useState('illnesses');

  const PRESETS = {
    pastIllnesses: ['Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'Heart Condition', 'No Chronic Illness'],
    medications: ['BP Medicine', 'Sugar Pills/Insulin', 'Inhaler', 'Thyroid Tablets', 'No Regular Medicines'],
    allergies: ['Penicillin', 'Sulfa Drugs', 'Dust/Pollen', 'Food Allergy', 'No Known Allergies'],
    surgeries: ['Appendectomy', 'C-Section', 'Fracture Surgery', 'Gallbladder', 'No Past Surgeries'],
  };

  const handleQuickAdd = (field, text) => {
    if ((history[field] || []).some((item) => item.value.toLowerCase() === text.toLowerCase())) return;
    addListItem(field, text, () => {});
  };

  return (
    <div className="h-full w-full max-w-5xl mx-auto px-4 py-2 select-none flex flex-col justify-between">
      {/* --------------------------------------------------
          COMPACT HEADER
      --------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {t('screen6.stepLabel', 'Step 4 · Health History')}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {t('screen6.title', 'Your Medical & Health History')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('screen6.subtitle', 'Tap to add conditions or medicines. You can skip any section you do not need.')}
          </p>
        </div>

        <AudioButton
          textToRead={
            isHindi
              ? 'अब हम आपके पिछले स्वास्थ्य, दवाओं, एलर्जी और ऑपरेशन के बारे में कुछ जानकारी लेंगे।'
              : 'Now we will collect some information about your previous illnesses, medicines, allergies and surgeries.'
          }
          label={t('nav.listen', isHindi ? 'सुनें' : 'Listen')}
          className="min-h-[32px] py-1 text-xs"
        />
      </div>

      {/* --------------------------------------------------
          TWO-COLUMN ATM LAYOUT: TABS + SUMMARY
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.85fr] gap-3 items-start flex-1 min-h-0">

        {/* LEFT COLUMN: Tab Navigation & Quick Presets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex flex-col gap-2">
          {/* Tab buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'illnesses', label: 'Past Illnesses', count: history.pastIllnesses.length, icon: ClipboardList },
              { id: 'medications', label: 'Medicines', count: history.medications.length, icon: ClipboardList },
              { id: 'allergies', label: 'Allergies', count: history.allergies.length, icon: AlertCircle },
              { id: 'surgeries', label: 'Surgeries', count: history.surgeries.length, icon: History },
              ...(isAyush ? [{ id: 'ayush', label: 'AYUSH Prakriti', count: Object.values(history.ayush).filter(Boolean).length, icon: Leaf }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 h-7 px-2.5 rounded-lg border font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition ${
                    activeTab === tab.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === tab.id ? 'bg-teal-900 text-white' : 'bg-teal-100 text-teal-800'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="min-h-[160px] flex flex-col justify-between">
            {activeTab === 'illnesses' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-700">Tap to add common chronic conditions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.pastIllnesses.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAdd('pastIllnesses', preset)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-xs font-bold text-slate-700 cursor-pointer transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div className="flex-1">
                    <KioskInput
                      id="input-illness"
                      value={illnessInput}
                      onChange={setIllnessInput}
                      placeholder="Type other past illness..."
                      label="Other Illness"
                      inputClassName="h-8 text-xs py-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addListItem('pastIllnesses', illnessInput, setIllnessInput)}
                    className="h-8 px-3 rounded-xl bg-teal-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {/* Added chips */}
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
                  {history.pastIllnesses.map((item) => (
                    <span key={item.id} className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <span>{item.value}</span>
                      <button type="button" onClick={() => removeListItem('pastIllnesses', item.id)} className="hover:text-red-700 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-700">Tap to add regular medications:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.medications.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAdd('medications', preset)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-xs font-bold text-slate-700 cursor-pointer transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div className="flex-1">
                    <KioskInput
                      id="input-medicine"
                      value={medicineInput}
                      onChange={setMedicineInput}
                      placeholder="Type medicine name or dosage..."
                      label="Medicine"
                      inputClassName="h-8 text-xs py-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addListItem('medications', medicineInput, setMedicineInput)}
                    className="h-8 px-3 rounded-xl bg-teal-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
                  {history.medications.map((item) => (
                    <span key={item.id} className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <span>{item.value}</span>
                      <button type="button" onClick={() => removeListItem('medications', item.id)} className="hover:text-red-700 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'allergies' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-700">Tap to add drug or food allergies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.allergies.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAdd('allergies', preset)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-xs font-bold text-slate-700 cursor-pointer transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div className="flex-1">
                    <KioskInput
                      id="input-allergy"
                      value={allergyInput}
                      onChange={setAllergyInput}
                      placeholder="Type allergy (e.g. Penicillin, Sulfa)..."
                      label="Allergy"
                      inputClassName="h-8 text-xs py-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addListItem('allergies', allergyInput, setAllergyInput)}
                    className="h-8 px-3 rounded-xl bg-teal-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
                  {history.allergies.map((item) => (
                    <span key={item.id} className="inline-flex items-center gap-1 bg-red-100 text-red-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <span>{item.value}</span>
                      <button type="button" onClick={() => removeListItem('allergies', item.id)} className="hover:text-red-700 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'surgeries' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-700">Tap to add previous surgeries:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.surgeries.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAdd('surgeries', preset)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-xs font-bold text-slate-700 cursor-pointer transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div className="flex-1">
                    <KioskInput
                      id="input-surgery"
                      value={surgeryInput}
                      onChange={setSurgeryInput}
                      placeholder="Type previous surgery or hospitalization..."
                      label="Surgery"
                      inputClassName="h-8 text-xs py-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addListItem('surgeries', surgeryInput, setSurgeryInput)}
                    className="h-8 px-3 rounded-xl bg-teal-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
                  {history.surgeries.map((item) => (
                    <span key={item.id} className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <span>{item.value}</span>
                      <button type="button" onClick={() => removeListItem('surgeries', item.id)} className="hover:text-red-700 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ayush' && isAyush && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { field: 'prakriti', title: 'Body Type', options: AYUSH_OPTIONS.prakriti },
                  { field: 'agni', title: 'Digestive Fire', options: AYUSH_OPTIONS.agni },
                  { field: 'kostha', title: 'Bowel Tendency', options: AYUSH_OPTIONS.kostha },
                ].map(({ field, title, options }) => (
                  <div key={field} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <span className="text-xs font-black text-slate-800">{title}</span>
                    <div className="flex flex-col gap-1">
                      {options.slice(0, 3).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAyushValue(field, val)}
                          className={`h-6 px-1.5 rounded text-[10px] font-bold text-left truncate cursor-pointer ${
                            history.ayush[field] === val ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: History Summary & Save/Continue */}
        <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>History Summary</span>
            </div>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
              Optional Draft
            </span>
          </div>

          {/* Checklist Summary */}
          <div className="space-y-1.5 text-xs py-1 border-y border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Past Conditions:</span>
              <span className="font-bold text-slate-900">{history.pastIllnesses.length} added</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Current Medicines:</span>
              <span className="font-bold text-slate-900">{history.medications.length} added</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Allergies:</span>
              <span className="font-bold text-slate-900">{history.allergies.length} added</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Surgeries:</span>
              <span className="font-bold text-slate-900">{history.surgeries.length} added</span>
            </div>
            {isAyush && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">AYUSH Profile:</span>
                <span className="font-bold text-slate-900">{Object.values(history.ayush).filter(Boolean).length} recorded</span>
              </div>
            )}
          </div>

          <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-900">
            <strong>Clinical Safety:</strong> The doctor will review this summary during consultation.
          </div>

          {/* Action Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black flex items-center justify-between px-4 cursor-pointer transition text-sm shadow-xs"
          >
            <span>{t('screen6.saveAndContinue', 'Save & Continue')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-600">{label}</span>
    <span className="font-black text-slate-900">{value}</span>
  </div>
);

export default Screen6_HealthHistory;