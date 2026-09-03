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
import AudioButton from '../components/common/AudioButton';

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

  const isHindi = language === 'hi';
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

  const toggleSection = (section) => {
    setExpanded((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  const inputClass =
    'w-full min-h-[52px] rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-black uppercase tracking-widest">
            <History className="w-4 h-4" />
            <span>Step 6 · Health History</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {isHindi
              ? 'आपके पिछले स्वास्थ्य की जानकारी'
              : 'Your health history'}
          </h1>

          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            We use this information to prepare a structured history for the
            clinician. You can skip anything you do not remember.
          </p>
        </div>

        <AudioButton
          textToRead={
            isHindi
              ? 'अब हम आपके पिछले स्वास्थ्य, दवाओं, एलर्जी और ऑपरेशन के बारे में कुछ जानकारी लेंगे।'
              : 'Now we will collect some information about your previous illnesses, medicines, allergies and surgeries.'
          }
        />
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-[1fr_330px] gap-5 mt-5">
        <main className="space-y-4">
          {/* Current complaint summary */}
          <Section
            title="Current complaint"
            description="Information captured during your symptom interview"
            icon={HeartPulse}
          >
            {symptomObjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {symptomObjects.map((symptom) => (
                  <span
                    key={symptom}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 text-sm font-bold"
                  >
                    <Check className="w-4 h-4" />
                    {symptom}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState>
                No symptoms have been recorded yet.
              </EmptyState>
            )}

            {sessionData.symptomDuration && (
              <div className="mt-3 text-sm text-slate-600">
                Duration:{' '}
                <strong>{sessionData.symptomDuration}</strong>
              </div>
            )}
          </Section>

          {/* Past illnesses */}
          <Section
            title="Past illnesses & chronic conditions"
            description="Examples: diabetes, hypertension, asthma, tuberculosis, thyroid problems"
            icon={ClipboardList}
          >
            <button
              type="button"
              onClick={() => toggleSection('illnesses')}
              className="w-full flex items-center justify-between mb-4"
            >
              <span className="text-sm font-bold text-slate-700">
                {history.pastIllnesses.length} conditions added
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  expanded.illnesses ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expanded.illnesses && (
              <>
                <div className="flex gap-2">
                  <input
                    value={illnessInput}
                    onChange={(event) =>
                      setIllnessInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        addListItem(
                          'pastIllnesses',
                          illnessInput,
                          setIllnessInput
                        );
                      }
                    }}
                    placeholder="Enter an illness or condition"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      addListItem(
                        'pastIllnesses',
                        illnessInput,
                        setIllnessInput
                      )
                    }
                    className="w-[52px] shrink-0 rounded-xl bg-teal-800 text-white flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {history.pastIllnesses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {history.pastIllnesses.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() =>
                          removeListItem(
                            'pastIllnesses',
                            item.id
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-bold flex items-center gap-2"
                      >
                        {item.value}
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Section>

          {/* Medicines */}
          <Section
            title="Current medicines"
            description="Include regular medicines, inhalers, injections or long-term treatment"
            icon={ClipboardList}
          >
            <button
              type="button"
              onClick={() => toggleSection('medications')}
              className="w-full flex items-center justify-between mb-4"
            >
              <span className="text-sm font-bold text-slate-700">
                {history.medications.length} medicines added
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  expanded.medications ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expanded.medications && (
              <>
                <div className="flex gap-2">
                  <input
                    value={medicineInput}
                    onChange={(event) =>
                      setMedicineInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        addListItem(
                          'medications',
                          medicineInput,
                          setMedicineInput
                        );
                      }
                    }}
                    placeholder="Medicine name"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      addListItem(
                        'medications',
                        medicineInput,
                        setMedicineInput
                      )
                    }
                    className="w-[52px] shrink-0 rounded-xl bg-teal-800 text-white flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  {history.medications.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <span className="font-bold text-sm text-slate-800">
                        {item.value}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(
                            'medications',
                            item.id
                          )
                        }
                        className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* Allergies */}
          <Section
            title="Drug & other allergies"
            description="This information is important for safe treatment"
            icon={AlertCircle}
          >
            <button
              type="button"
              onClick={() => toggleSection('allergies')}
              className="w-full flex items-center justify-between mb-4"
            >
              <span className="text-sm font-bold text-slate-700">
                {history.allergies.length === 0
                  ? 'No allergies added'
                  : `${history.allergies.length} allergies added`}
              </span>

              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  expanded.allergies ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expanded.allergies && (
              <>
                <div className="flex gap-2">
                  <input
                    value={allergyInput}
                    onChange={(event) =>
                      setAllergyInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        addListItem(
                          'allergies',
                          allergyInput,
                          setAllergyInput
                        );
                      }
                    }}
                    placeholder="Example: Penicillin, dust, food allergy"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      addListItem(
                        'allergies',
                        allergyInput,
                        setAllergyInput
                      )
                    }
                    className="w-[52px] shrink-0 rounded-xl bg-teal-800 text-white flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {history.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {history.allergies.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() =>
                          removeListItem(
                            'allergies',
                            item.id
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm font-bold flex items-center gap-2"
                      >
                        {item.value}
                        <X className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Section>

          {/* Surgery */}
          <Section
            title="Previous surgeries / procedures"
            description="Tell us about any major operation or procedure you have had"
            icon={History}
          >
            <div className="flex gap-2">
              <input
                value={surgeryInput}
                onChange={(event) =>
                  setSurgeryInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addListItem(
                      'surgeries',
                      surgeryInput,
                      setSurgeryInput
                    );
                  }
                }}
                placeholder="Example: Appendectomy — 2019"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() =>
                  addListItem(
                    'surgeries',
                    surgeryInput,
                    setSurgeryInput
                  )
                }
                className="w-[52px] shrink-0 rounded-xl bg-teal-800 text-white flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {history.surgeries.length > 0 && (
              <div className="space-y-2 mt-3">
                {history.surgeries.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <span className="font-bold text-sm">
                      {item.value}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeListItem(
                          'surgeries',
                          item.id
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Personal + family */}
          <Section
            title="Family & personal history"
            description="You can provide whatever you know"
            icon={UserRound}
          >
            <button
              type="button"
              onClick={() => toggleSection('personal')}
              className="w-full flex items-center justify-between mb-4"
            >
              <span className="text-sm font-bold text-slate-700">
                Lifestyle and family information
              </span>

              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  expanded.personal ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expanded.personal && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-700">
                    Family history
                  </label>

                  <textarea
                    value={history.familyHistory}
                    onChange={(event) =>
                      updateHistory({
                        familyHistory: event.target.value,
                      })
                    }
                    placeholder="Example: Father has diabetes and hypertension…"
                    className={`${inputClass} mt-2 min-h-[100px] py-3 resize-none`}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700">
                    Other personal history
                  </label>

                  <textarea
                    value={history.personalHistory}
                    onChange={(event) =>
                      updateHistory({
                        personalHistory: event.target.value,
                      })
                    }
                    placeholder="Anything about your daily routine or health that may be useful…"
                    className={`${inputClass} mt-2 min-h-[100px] py-3 resize-none`}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <select
                    value={history.smoking}
                    onChange={(event) =>
                      updateHistory({
                        smoking: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Smoking</option>
                    <option value="never">Never</option>
                    <option value="former">Former smoker</option>
                    <option value="current">Current smoker</option>
                  </select>

                  <select
                    value={history.alcohol}
                    onChange={(event) =>
                      updateHistory({
                        alcohol: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Alcohol</option>
                    <option value="never">Never</option>
                    <option value="occasional">Occasional</option>
                    <option value="regular">Regular</option>
                  </select>

                  <select
                    value={history.diet}
                    onChange={(event) =>
                      updateHistory({
                        diet: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non_vegetarian">Non-vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <select
                  value={history.sleep}
                  onChange={(event) =>
                    updateHistory({
                      sleep: event.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Sleep pattern</option>
                  <option value="good">Generally good</option>
                  <option value="disturbed">Often disturbed</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            )}
          </Section>

          {/* AYUSH */}
          {isAyush && (
            <Section
              title="Ayurvedic health profile"
              description="Traditional Ayurvedic terms are shown with plain-language explanations"
              icon={Leaf}
            >
              <button
                type="button"
                onClick={() => toggleSection('ayush')}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="text-left">
                  <div className="text-sm font-black text-slate-800">
                    AYUSH intake
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    This information helps the Ayurvedic practitioner.
                  </div>
                </div>

                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expanded.ayush ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expanded.ayush && (
                <div className="space-y-5">
                  {[
                    ['prakriti', 'Prakriti (प्रकृति)', 'Natural body constitution'],
                    ['agni', 'Agni (पाचन अग्नि)', 'Digestive strength'],
                    ['kostha', 'Koshtha (कोष्ठ)', 'Bowel habit / regularity'],
                  ].map(([field, title, subtitle]) => (
                    <div key={field}>
                      <div className="mb-2">
                        <div className="font-black text-slate-900 text-sm">
                          {title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {subtitle}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {AYUSH_OPTIONS[field].map(
                          ([value, label]) => (
                            <button
                              type="button"
                              key={value}
                              onClick={() =>
                                setAyushValue(field, value)
                              }
                              className={`min-h-[54px] rounded-xl border-2 px-4 text-left text-sm font-bold ${
                                history.ayush[field] === value
                                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                                  : 'border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              {label}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </main>

        {/* Summary */}
        <aside className="lg:sticky lg:top-4 h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h2 className="font-black text-slate-900">
              History summary
            </h2>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            This information will be used to prepare your clinical summary.
          </p>

          <div className="mt-5 space-y-3">
            <SummaryRow
              label="Current symptoms"
              value={symptomObjects.length}
            />

            <SummaryRow
              label="Past conditions"
              value={history.pastIllnesses.length}
            />

            <SummaryRow
              label="Medicines"
              value={history.medications.length}
            />

            <SummaryRow
              label="Allergies"
              value={history.allergies.length}
            />

            <SummaryRow
              label="Surgeries"
              value={history.surgeries.length}
            />

            {isAyush && (
              <SummaryRow
                label="AYUSH profile"
                value={
                  Object.values(history.ayush).filter(Boolean)
                    .length
                }
              />
            )}
          </div>

          <div className="mt-5 rounded-xl bg-teal-50 border border-teal-100 p-4">
            <div className="flex items-start gap-3">
              <ClipboardList className="w-5 h-5 text-teal-700 shrink-0" />

              <div>
                <div className="font-black text-teal-950 text-sm">
                  You remain in control
                </div>

                <p className="text-xs text-teal-900 mt-1 leading-relaxed">
                  The information collected here is a draft for clinical
                  review. The doctor can edit or correct it later.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full min-h-[58px] rounded-2xl bg-teal-800 text-white font-black flex items-center justify-center gap-2"
            >
              Save & Continue
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={prevScreen}
              className="w-full min-h-[50px] rounded-2xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </aside>
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