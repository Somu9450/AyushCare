import React from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Welcome', hi: 'स्वागत' },
  { id: 2, title: 'Auth & ABHA', hi: 'सत्यापन' },
  { id: 3, title: 'Track & Dept', hi: 'विभाग' },
  { id: 4, title: 'Symptoms', hi: 'लक्षण' },
  { id: 5, title: 'Wizard', hi: 'विवरण' },
  { id: 6, title: 'History', hi: 'इतिहास' },
  { id: 7, title: 'Vitals', hi: 'तैयारी' },
  { id: 8, title: 'QR Scan', hi: 'क्यूआर' },
  { id: 9, title: 'Review', hi: 'समीक्षा' },
  { id: 10, title: 'Token', hi: 'टोकन' },
];

export const StepProgressIndicator = () => {
  const { currentScreen, language, setScreen } = useKioskStore();

  if (currentScreen === 1) return null; // Screen 1 is welcome/landing screen

  return (
    <div className="w-full bg-teal-950/20 backdrop-blur-sm border-b border-teal-800/40 py-3 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        {STEPS.map((step) => {
          const isCompleted = currentScreen > step.id;
          const isCurrent = currentScreen === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 cursor-pointer select-none transition-all duration-200 shrink-0 ${
                isCurrent ? 'opacity-100 scale-105' : isCompleted ? 'opacity-90' : 'opacity-40'
              }`}
              onClick={() => {
                // Allow navigating backwards or jumping to already completed steps
                if (step.id <= currentScreen) {
                  setScreen(step.id);
                }
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-amber-400 text-teal-950 ring-4 ring-amber-400/30 font-black'
                    : 'bg-teal-900/60 text-teal-200 border border-teal-700/50'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>

              <div className="hidden lg:block text-left">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent ? 'text-amber-300 font-bold' : isCompleted ? 'text-teal-100' : 'text-teal-300/60'
                  }`}
                >
                  {language === 'hi' ? step.hi : step.title}
                </p>
              </div>

              {step.id < STEPS.length && (
                <div
                  className={`hidden sm:block w-3 md:w-6 h-0.5 rounded-full ml-1 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-teal-800/50'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressIndicator;
