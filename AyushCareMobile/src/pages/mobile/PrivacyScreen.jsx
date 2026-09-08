import React, { useEffect } from "react";
import { FileText, Layers3, CalendarDays, ShieldCheck } from "lucide-react";
import useMobileStore from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import { useLanguage } from "../../i18n/translations";

function Toggle({ enabled, label }) {
  return (
    <div
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className={`pointer-events-none relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        enabled ? "bg-teal-700 shadow-inner" : "bg-slate-300"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}

export default function PrivacyScreen() {
  const { privacyData, updatePrivacySetting, loadPrivacySettings, prevScreen } = useMobileStore();
  const { isHindi } = useLanguage();
  const settings = privacyData?.serverSettings || {};

  useEffect(() => {
    void loadPrivacySettings?.();
  }, [loadPrivacySettings]);

  const controls = [
    {
      key: "share_previous_departments",
      icon: Layers3,
      en: "Previous departments",
      hi: "पिछले विभाग",
      descEn: "Allow previous department/visit information to be shared with your healthcare team.",
      descHi: "पिछले विभाग और विज़िट की जानकारी डॉक्टर के साथ साझा करें।",
    },
    {
      key: "share_previous_reports",
      icon: FileText,
      en: "Previous reports",
      hi: "पिछली रिपोर्ट",
      descEn: "Allow saved prescriptions and reports to be shown on the doctor portal.",
      descHi: "सहेजी गई दवाइयां और रिपोर्ट डॉक्टर पोर्टल पर दिखाने की अनुमति दें।",
    },
    {
      key: "share_previous_appointments",
      icon: CalendarDays,
      en: "Previous appointments",
      hi: "पिछली अपॉइंटमेंट",
      descEn: "Allow previous appointment/visit history to be shown to doctors.",
      descHi: "पिछली अपॉइंटमेंट और विज़िट इतिहास डॉक्टर को दिखाएं।",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <MobileHeader
        title={isHindi ? "गोपनीयता नियंत्रण" : "Privacy controls"}
        subtitle={isHindi ? "आप तय करें क्या साझा करना है" : "You control what is shared"}
        onBack={prevScreen}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="rounded-3xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-bold text-teal-950">
                {isHindi ? "डेटा साझा करने का नियंत्रण" : "Control your shared data"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-teal-800">
                {isHindi
                  ? "किसी भी समय इन विकल्पों को बंद या चालू करें।"
                  : "Turn each category on or off at any time. Changes sync instantly."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {controls.map(({ key, icon: Icon, en, hi, descEn, descHi }) => {
            const enabled = settings[key] !== false;
            const label = isHindi ? hi : en;
            const desc = isHindi ? descHi : descEn;

            const handleToggle = () => {
              void updatePrivacySetting?.(key, !enabled);
            };

            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggle();
                  }
                }}
                className={`group flex items-center justify-between gap-3.5 rounded-3xl border p-4 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                  enabled
                    ? "border-teal-300 bg-teal-50/25 ring-1 ring-teal-200/60"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200 ${
                      enabled
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={20} strokeWidth={enabled ? 2.3 : 1.9} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 group-hover:text-teal-950">
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {desc}
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={enabled}
                  label={label}
                />
              </div>
            );
          })}
        </section>

        <p className="mt-5 px-1 text-xs leading-5 text-slate-500">
          {isHindi
            ? "बंद की गई पिछली जानकारी सामान्य पोर्टल दृश्य से छिपी रहेगी।"
            : "When a category is off, that previous information stays hidden from the doctor portal view."}
        </p>
      </main>
    </div>
  );
}
