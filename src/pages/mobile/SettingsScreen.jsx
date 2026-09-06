import React from "react";
import {
  Check,
  ChevronRight,
  Languages,
  LogOut,
  MoveHorizontal,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Type,
  Volume2,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

const TEXT_SIZES = [
  {
    id: "default",
    label: "Default",
    hindi: "सामान्य",
  },
  {
    id: "large",
    label: "Large",
    hindi: "बड़ा",
  },
  {
    id: "x-large",
    label: "Extra large",
    hindi: "बहुत बड़ा",
  },
];

export default function SettingsScreen() {
  const {
    selectedLanguage,
    setSelectedLanguage,
    accessibilitySettings,
    updateAccessibilitySettings,
    logout,
    setScreen,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const accessibility =
    accessibilitySettings || {};

  const updateAccessibility = (
    partialSettings
  ) => {
    if (
      typeof updateAccessibilitySettings ===
      "function"
    ) {
      updateAccessibilitySettings(
        partialSettings
      );
    }
  };

  const toggleLanguage = () => {
    setSelectedLanguage(
      selectedLanguage === "hi"
        ? "en"
        : "hi"
    );
  };

  const resetAccessibility = () => {
    updateAccessibility({
      textSize: "default",
      highContrast: false,
      reduceMotion: false,
      audioAssist: true,
    });
  };

  const handleLogout = async () => {
    if (typeof logout === "function") {
      await logout();
      return;
    }

    setScreen(SCREENS.AUTH);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileHeader
        title={
          isHindi ? "सेटिंग्स" : "Settings"
        }
        subtitle={
          isHindi
            ? "भाषा, पहुंच और ऐप प्राथमिकताएं"
            : "Language, accessibility and preferences"
        }
      />

      <main className="mx-auto w-full max-w-md px-4 py-5 pb-24">
        <section>
          <SectionTitle
            title={
              isHindi ? "भाषा" : "Language"
            }
          />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Languages size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">
                  {isHindi
                    ? "ऐप भाषा"
                    : "App language"}
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedLanguage === "hi"
                    ? "हिन्दी"
                    : "English"}
                </p>
              </div>

              <span className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-600">
                {selectedLanguage === "hi"
                  ? "हिं"
                  : "EN"}
              </span>
            </button>
          </div>
        </section>

        <section className="mt-7">
          <SectionTitle
            title={
              isHindi
                ? "पहुंच"
                : "Accessibility"
            }
          />

          <div className="space-y-3">
            <SettingToggle
              icon={Type}
              title={
                isHindi
                  ? "बड़ा टेक्स्ट"
                  : "Larger text"
              }
              description={
                isHindi
                  ? "स्क्रीन पर टेक्स्ट का आकार बढ़ाएं।"
                  : "Increase the text size across the app."
              }
              enabled={
                accessibility.textSize ===
                "large"
              }
              onChange={(enabled) =>
                updateAccessibility({
                  textSize: enabled
                    ? "large"
                    : "default",
                })
              }
            />

            <SettingToggle
              icon={MoveHorizontal}
              title={
                isHindi
                  ? "बहुत बड़ा टेक्स्ट"
                  : "Extra large text"
              }
              description={
                isHindi
                  ? "कम दृष्टि वाले उपयोगकर्ताओं के लिए और बड़ा टेक्स्ट।"
                  : "Use a larger text size for improved readability."
              }
              enabled={
                accessibility.textSize ===
                "x-large"
              }
              onChange={(enabled) =>
                updateAccessibility({
                  textSize: enabled
                    ? "x-large"
                    : "default",
                })
              }
            />

            <SettingToggle
              icon={ShieldCheck}
              title={
                isHindi
                  ? "उच्च कंट्रास्ट"
                  : "High contrast"
              }
              description={
                isHindi
                  ? "टेक्स्ट और इंटरफेस के बीच कंट्रास्ट बढ़ाएं।"
                  : "Increase contrast between interface elements and text."
              }
              enabled={Boolean(
                accessibility.highContrast
              )}
              onChange={(enabled) =>
                updateAccessibility({
                  highContrast: enabled,
                })
              }
            />

            <SettingToggle
              icon={PlayCircle}
              title={
                isHindi
                  ? "कम मोशन"
                  : "Reduce motion"
              }
              description={
                isHindi
                  ? "एनिमेशन और ट्रांज़िशन कम करें।"
                  : "Reduce animations and transitions."
              }
              enabled={Boolean(
                accessibility.reduceMotion
              )}
              onChange={(enabled) =>
                updateAccessibility({
                  reduceMotion: enabled,
                })
              }
            />

            <SettingToggle
              icon={Volume2}
              title={
                isHindi
                  ? "ऑडियो सहायता"
                  : "Audio assistance"
              }
              description={
                isHindi
                  ? "जहां उपलब्ध हो वहां ऑडियो सहायता का उपयोग करें।"
                  : "Enable audio assistance where available."
              }
              enabled={
                accessibility.audioAssist !==
                false
              }
              onChange={(enabled) =>
                updateAccessibility({
                  audioAssist: enabled,
                })
              }
            />
          </div>
        </section>

        <section className="mt-7">
          <SectionTitle
            title={
              isHindi
                ? "टेक्स्ट आकार"
                : "Text size"
            }
          />

          <div className="rounded-3xl border border-slate-200 bg-white p-2">
            {TEXT_SIZES.map((size) => {
              const active =
                (accessibility.textSize ||
                  "default") === size.id;

              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() =>
                    updateAccessibility({
                      textSize: size.id,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left ${
                    active
                      ? "bg-teal-50 text-teal-950"
                      : "text-slate-700"
                  }`}
                >
                  <span className="text-sm font-bold">
                    {isHindi
                      ? size.hindi
                      : size.label}
                  </span>

                  {active ? (
                    <Check
                      size={17}
                      className="text-teal-700"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7">
          <SectionTitle
            title={
              isHindi
                ? "गोपनीयता"
                : "Privacy"
            }
          />

          <button
            type="button"
            onClick={() =>
              setScreen(SCREENS.PRIVACY)
            }
            className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">
                {isHindi
                  ? "गोपनीयता और डेटा नियंत्रण"
                  : "Privacy & data control"}
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                {isHindi
                  ? "सहमति और डेटा एक्सेस प्रबंधित करें।"
                  : "Manage consent and data access."}
              </p>
            </div>

            <ChevronRight
              size={18}
              className="text-slate-400"
            />
          </button>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-sm font-bold text-rose-700 shadow-sm"
        >
          <LogOut size={17} />
          {isHindi
            ? "लॉग आउट"
            : "Log out"}
        </button>

        <button
          type="button"
          onClick={resetAccessibility}
          className="mx-auto mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-500"
        >
          <RotateCcw size={13} />
          {isHindi
            ? "पहुंच सेटिंग रीसेट करें"
            : "Reset accessibility"}
        </button>
      </main>

      <BottomNavBar />
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="mb-3 px-1 text-xs font-black uppercase tracking-wider text-slate-500">
      {title}
    </h2>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          enabled
            ? "bg-teal-50 text-teal-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-teal-700"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}