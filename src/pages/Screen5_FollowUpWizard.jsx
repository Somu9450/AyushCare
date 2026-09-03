import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Leaf,
  Mic,
  MicOff,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import AudioButton from '../components/common/AudioButton';

const QUESTION_BANK = {
  headache: [
    {
      id: 'headache_onset',
      title: 'When did the headache begin?',
      hi: 'सिरदर्द कब शुरू हुआ?',
      options: [
        ['sudden', 'Suddenly', 'अचानक'],
        ['gradual', 'Gradually', 'धीरे-धीरे'],
        ['not_sure', 'Not sure', 'पता नहीं'],
      ],
    },
    {
      id: 'headache_character',
      title: 'How does the headache feel?',
      hi: 'सिरदर्द कैसा महसूस होता है?',
      options: [
        ['sharp', 'Sharp', 'तेज़ / चुभने वाला'],
        ['dull', 'Dull / Heavy', 'भारी / सुस्त'],
        ['throbbing', 'Throbbing', 'धड़कने जैसा'],
        ['pressure', 'Pressure', 'दबाव जैसा'],
      ],
    },
    {
      id: 'headache_severity',
      title: 'How severe is the pain?',
      hi: 'दर्द कितना तेज़ है?',
      options: [
        ['mild', 'Mild', 'हल्का'],
        ['moderate', 'Moderate', 'मध्यम'],
        ['severe', 'Severe', 'बहुत तेज़'],
      ],
    },
  ],

  chest_pain: [
    {
      id: 'chest_onset',
      title: 'When did the chest pain start?',
      hi: 'सीने में दर्द कब शुरू हुआ?',
      options: [
        ['today', 'Today', 'आज'],
        ['few_days', 'A few days ago', 'कुछ दिन पहले'],
        ['weeks', 'Several weeks ago', 'कई सप्ताह पहले'],
      ],
    },
    {
      id: 'chest_character',
      title: 'What does the pain feel like?',
      hi: 'दर्द कैसा महसूस होता है?',
      options: [
        ['pressure', 'Pressure / Tightness', 'दबाव / जकड़न'],
        ['sharp', 'Sharp', 'तेज़ / चुभने वाला'],
        ['burning', 'Burning', 'जलन'],
        ['other', 'Something else', 'कुछ और'],
      ],
    },
    {
      id: 'chest_radiation',
      title: 'Does the pain move anywhere else?',
      hi: 'क्या दर्द कहीं और फैलता है?',
      options: [
        ['none', 'No', 'नहीं'],
        ['left_arm', 'Left arm', 'बायां हाथ'],
        ['back', 'Back', 'पीठ'],
        ['jaw', 'Jaw / Neck', 'जबड़ा / गर्दन'],
      ],
    },
    {
      id: 'chest_breathlessness',
      title: 'Are you having difficulty breathing?',
      hi: 'क्या सांस लेने में तकलीफ हो रही है?',
      options: [
        ['yes', 'Yes', 'हां'],
        ['no', 'No', 'नहीं'],
      ],
      redFlag: true,
    },
  ],

  abdominal_pain: [
    {
      id: 'abdomen_location',
      title: 'Where exactly is the stomach pain?',
      hi: 'पेट में दर्द कहां है?',
      options: [
        ['upper', 'Upper abdomen', 'ऊपरी पेट'],
        ['lower', 'Lower abdomen', 'निचला पेट'],
        ['right', 'Right side', 'दाईं ओर'],
        ['left', 'Left side', 'बाईं ओर'],
        ['all_over', 'All over', 'पूरे पेट में'],
      ],
    },
    {
      id: 'abdomen_relation_food',
      title: 'Does it change after eating?',
      hi: 'क्या खाना खाने के बाद दर्द बदलता है?',
      options: [
        ['worse', 'Gets worse', 'बढ़ जाता है'],
        ['better', 'Gets better', 'कम हो जाता है'],
        ['same', 'No change', 'कोई बदलाव नहीं'],
        ['not_sure', 'Not sure', 'पता नहीं'],
      ],
    },
  ],

  joint_pain: [
    {
      id: 'joint_location',
      title: 'Which joints are affected?',
      hi: 'किन जोड़ों में परेशानी है?',
      options: [
        ['knee', 'Knee', 'घुटना'],
        ['shoulder', 'Shoulder', 'कंधा'],
        ['hip', 'Hip', 'कूल्हा'],
        ['multiple', 'Multiple joints', 'कई जोड़'],
      ],
    },
    {
      id: 'joint_stiffness',
      title: 'Do you feel stiffness?',
      hi: 'क्या जोड़ों में जकड़न महसूस होती है?',
      options: [
        ['morning', 'Mostly in the morning', 'मुख्यतः सुबह'],
        ['all_day', 'Throughout the day', 'पूरे दिन'],
        ['sometimes', 'Sometimes', 'कभी-कभी'],
        ['no', 'No stiffness', 'जकड़न नहीं'],
      ],
    },
  ],
};

const COMMON_QUESTIONS = [
  {
    id: 'symptom_progression',
    title: 'Overall, is the problem getting better or worse?',
    hi: 'कुल मिलाकर आपकी समस्या बेहतर हो रही है या बढ़ रही है?',
    options: [
      ['better', 'Getting better', 'बेहतर हो रही है'],
      ['same', 'About the same', 'लगभग वैसी ही'],
      ['worse', 'Getting worse', 'बढ़ रही है'],
    ],
  },
  {
    id: 'impact',
    title: 'How much is this problem affecting your daily activities?',
    hi: 'यह समस्या आपके रोज़मर्रा के काम को कितना प्रभावित कर रही है?',
    options: [
      ['none', 'Not at all', 'बिल्कुल नहीं'],
      ['some', 'A little', 'थोड़ा'],
      ['moderate', 'Moderately', 'मध्यम'],
      ['major', 'A lot', 'बहुत अधिक'],
    ],
  },
];

const AYUSH_QUESTIONS = [
  {
    id: 'prakriti',
    title: 'What is your natural body constitution?',
    traditional: 'Prakriti (प्रकृति)',
    explanation:
      'Your natural body and mind constitution — how your body has generally been since childhood.',
    hi:
      'आपका प्राकृतिक शरीर और मन का स्वभाव — बचपन से आपका शरीर सामान्यतः कैसा रहा है।',
    options: [
      ['vata', 'Light / active / variable', 'हल्का / सक्रिय / परिवर्तनशील'],
      ['pitta', 'Warm / intense / sharp', 'गर्म / तीव्र / स्पष्ट'],
      ['kapha', 'Steady / strong / calm', 'स्थिर / मजबूत / शांत'],
      ['mixed', 'A combination', 'मिश्रित'],
      ['unknown', 'I am not sure', 'पता नहीं'],
    ],
  },
  {
    id: 'agni',
    title: 'How would you describe your digestion?',
    traditional: 'Agni (पाचन अग्नि)',
    explanation:
      'Digestive strength — whether food generally feels easy or difficult to digest.',
    hi:
      'आपकी पाचन शक्ति — खाना सामान्यतः आसानी से पचता है या परेशानी होती है।',
    options: [
      ['strong', 'Usually digests well', 'आमतौर पर आसानी से पचता है'],
      ['variable', 'Sometimes good, sometimes poor', 'कभी अच्छा, कभी खराब'],
      ['weak', 'Often feels heavy', 'अक्सर भारीपन महसूस होता है'],
      ['irregular', 'Very irregular', 'बहुत अनियमित'],
    ],
  },
  {
    id: 'kostha',
    title: 'How regular are your bowel movements?',
    traditional: 'Koshtha (कोष्ठ)',
    explanation:
      'Bowel habit — how regularly and comfortably you pass stool.',
    hi:
      'पेट साफ होने की आदत — मल त्याग कितनी नियमित और आरामदायक है।',
    options: [
      ['regular', 'Regular and comfortable', 'नियमित और आरामदायक'],
      ['constipation', 'Often constipated', 'अक्सर कब्ज'],
      ['loose', 'Often loose', 'अक्सर दस्त'],
      ['variable', 'Changes frequently', 'अक्सर बदलता रहता है'],
    ],
  },
];

const getQuestionsForSymptoms = (symptoms, isAyush) => {
  const questions = [];

  symptoms.forEach((symptomId) => {
    if (QUESTION_BANK[symptomId]) {
      questions.push(...QUESTION_BANK[symptomId]);
    }
  });

  questions.push(...COMMON_QUESTIONS);

  if (isAyush) {
    questions.push(...AYUSH_QUESTIONS);
  }

  const seen = new Set();

  return questions.filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
};

export const Screen5_FollowUpWizard = () => {
  const {
    sessionData,
    updateSessionData,
    nextScreen,
    prevScreen,
    language,
  } = useKioskStore();

  const isHindi = language === 'hi';
  const isAyush = sessionData.track === 'AYUSH';

  const questions = useMemo(
    () =>
      getQuestionsForSymptoms(
        sessionData.symptoms || [],
        isAyush
      ),
    [sessionData.symptoms, isAyush]
  );

  const existingAnswers = sessionData.followUpAnswers || {};

  const [answers, setAnswers] = useState(existingAnswers);
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(
      sessionData.followUpQuestionIndex || 0,
      Math.max(questions.length - 1, 0)
    )
  );

  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim() || '';

      if (!transcript || !currentQuestion) return;

      const matchedOption = currentQuestion.options.find(
        ([, english, hindi]) =>
          transcript.toLowerCase().includes(english.toLowerCase()) ||
          transcript.includes(hindi)
      );

      if (matchedOption) {
        selectAnswer(matchedOption[0]);
      }
    };

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [isHindi, currentQuestion]);

  const selectAnswer = (value) => {
    if (!currentQuestion) return;

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };

    setAnswers(updatedAnswers);

    updateSessionData({
      followUpAnswers: updatedAnswers,
      followUpQuestionIndex: currentIndex,
    });

    if (currentQuestion.redFlag && value === 'yes') {
      updateSessionData({
        redFlagDetected: true,
        redFlagReason: currentQuestion.title,
      });
    }
  };

  const startVoiceAnswer = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch {
      // Ignore browser duplicate-start error.
    }
  };

  const goNext = () => {
    if (!currentQuestion) {
      nextScreen();
      return;
    }

    if (!answers[currentQuestion.id]) return;

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);

      updateSessionData({
        followUpAnswers: answers,
        followUpQuestionIndex: nextIndex,
      });
    } else {
      updateSessionData({
        followUpAnswers: answers,
        followUpQuestionIndex: questions.length,
        followUpCompleted: true,
      });

      nextScreen();
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
      return;
    }

    prevScreen();
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center">
          <ShieldCheck className="w-14 h-14 mx-auto text-teal-700" />

          <h1 className="text-2xl font-black text-slate-900 mt-4">
            Intake complete
          </h1>

          <p className="text-slate-600 mt-2">
            We have enough information to prepare your health history.
          </p>

          <button
            type="button"
            onClick={nextScreen}
            className="mt-6 min-h-[56px] px-8 rounded-2xl bg-teal-800 text-white font-black"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];

  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  const questionAudioText = isHindi
    ? currentQuestion.hi
    : currentQuestion.title;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          className="min-h-[48px] px-4 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <AudioButton textToRead={questionAudioText} />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-teal-700 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex flex-col justify-center py-8 max-w-4xl w-full mx-auto">
        {currentQuestion.traditional && (
          <div className="inline-flex self-start items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black mb-5">
            <Leaf className="w-4 h-4" />
            {currentQuestion.traditional}
          </div>
        )}

        <div className="flex items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {isHindi
                ? currentQuestion.hi
                : currentQuestion.title}
            </h1>

            {currentQuestion.traditional && (
              <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
                {currentQuestion.explanation}
              </p>
            )}
          </div>

          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 items-center justify-center shrink-0">
            <CircleHelp className="w-7 h-7" />
          </div>
        </div>

        {/* Voice option */}
        <button
          type="button"
          onClick={startVoiceAnswer}
          className={`mt-7 min-h-[76px] rounded-2xl border-2 p-4 flex items-center gap-4 text-left ${
            isListening
              ? 'border-amber-400 bg-amber-50'
              : 'border-teal-100 bg-teal-50 hover:border-teal-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isListening
                ? 'bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-teal-800 text-white'
            }`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="font-black text-slate-900">
              {isListening
                ? 'Listening…'
                : 'Answer by speaking'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Or simply tap one of the answers below.
            </div>
          </div>
        </button>

        {/* Answer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {currentQuestion.options.map(
            ([value, english, hindi]) => {
              const selected = selectedAnswer === value;

              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => selectAnswer(value)}
                  className={`relative min-h-[82px] rounded-2xl border-2 px-5 py-4 text-left transition-all active:scale-[0.99] ${
                    selected
                      ? 'border-teal-700 bg-teal-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-teal-300'
                  }`}
                >
                  {selected && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <div className="font-black text-slate-900 pr-8">
                    {english}
                  </div>

                  {isHindi && (
                    <div className="text-xs text-slate-500 mt-1 pr-8">
                      {hindi}
                    </div>
                  )}
                </button>
              );
            }
          )}
        </div>

        {/* Red flag */}
        {currentQuestion.redFlag &&
          selectedAnswer === 'yes' && (
            <div className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-4 flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />

              <div>
                <div className="font-black text-red-900">
                  Please alert triage staff
                </div>
                <p className="text-sm text-red-800 mt-1">
                  This answer may require priority clinical assessment.
                </p>
              </div>
            </div>
          )}
      </main>

      {/* Bottom */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Clock3 className="w-4 h-4" />
          Take your time. There is no need to rush.
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!selectedAnswer}
          className="ml-auto min-h-[58px] px-7 rounded-2xl bg-teal-800 text-white font-black flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentIndex === questions.length - 1
            ? 'Finish Questions'
            : 'Next Question'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Screen5_FollowUpWizard;