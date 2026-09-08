import React from "react";
import {
  UserRound,
  ShieldCheck,
  Settings,
  Info,
  CalendarDays,
  ClipboardList,
  ChevronRight,
  LogOut,
  Smartphone,
  Globe2,
  Accessibility,
} from "lucide-react";

import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import useLanguage from "../../i18n/translations";

const MenuItem = ({
  icon: Icon,
  title,
  description,
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition active:scale-[0.99] cursor-pointer ${
      danger
        ? "bg-rose-50 border-rose-200 hover:border-rose-300"
        : "bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        danger
          ? "bg-rose-100 text-rose-700"
          : "bg-teal-50 text-teal-800"
      }`}
    >
      <Icon className="w-4.5 h-4.5" />
    </div>

    <div className="min-w-0 flex-1">
      <p
        className={`text-sm font-black ${
          danger ? "text-rose-900" : "text-slate-900"
        }`}
      >
        {title}
      </p>

      <p
        className={`text-[11px] mt-0.5 leading-relaxed ${
          danger ? "text-rose-700/80" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>

    <ChevronRight
      className={`w-4.5 h-4.5 shrink-0 ${
        danger ? "text-rose-400" : "text-slate-400"
      }`}
    />
  </button>
);

export const MoreScreen = () => {
  const {
    patient,
    session,
    logoutPatient,
    setScreen,
    prevScreen,
  } = useMobileStore();

  const { t, isHindi } = useLanguage();

  const displayName = isHindi
    ? patient?.hindiName || patient?.name || "मरीज़"
    : patient?.name || "Patient";

  const maskedMobile =
    patient?.maskedMobile ||
    patient?.mobile ||
    (isHindi ? "उपलब्ध नहीं" : "Not provided");

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 select-none">
      <MobileHeader
        title={t("more_title")}
        showBack={true}
        onBack={prevScreen}
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Profile summary */}
        <section className="p-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-black shrink-0">
              {displayName.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black truncate">
                {displayName}
              </h1>

              <p className="text-xs text-teal-100 mt-0.5">
                {maskedMobile}
              </p>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] font-bold text-teal-100">
                  <Smartphone className="w-3 h-3" />
                  {isHindi ? "मोबाइल ऐप" : "Mobile App"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-2.5">
          <div className="px-1">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "खाता" : "Account"}
            </h2>
          </div>

          <MenuItem
            icon={UserRound}
            title={t("profile_title")}
            description={
              isHindi
                ? "व्यक्तिगत जानकारी और पहचान विवरण देखें"
                : "View personal information and identity details"
            }
            onClick={() => setScreen(SCREENS.PROFILE)}
          />

          <MenuItem
            icon={CalendarDays}
            title={t("appointments_title")}
            description={
              isHindi
                ? "आगामी परामर्श और अपॉइंटमेंट देखें"
                : "View upcoming consultations and appointments"
            }
            onClick={() => setScreen(SCREENS.APPOINTMENTS)}
          />

          <MenuItem
            icon={ClipboardList}
            title={t("visits_title")}
            description={
              isHindi
                ? "पिछली अस्पताल मुलाकातों का इतिहास देखें"
                : "View your previous healthcare visits"
            }
            onClick={() => setScreen(SCREENS.VISITS)}
          />
        </section>

        {/* Privacy */}
        <section className="space-y-2.5">
          <div className="px-1">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "गोपनीयता और डेटा" : "Privacy & Data"}
            </h2>
          </div>

          <MenuItem
            icon={ShieldCheck}
            title={t("privacy_title")}
            description={
              isHindi
                ? "स्वास्थ्य इतिहास, सहमति और सक्रिय सत्र नियंत्रित करें"
                : "Manage health-history sharing, consent and active sessions"
            }
            onClick={() => setScreen(SCREENS.PRIVACY)}
          />
        </section>

        {/* Preferences */}
        <section className="space-y-2.5">
          <div className="px-1">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "प्राथमिकताएं" : "Preferences"}
            </h2>
          </div>

          <MenuItem
            icon={Settings}
            title={t("settings_title")}
            description={
              isHindi
                ? "भाषा, पहुंच और ऐप प्राथमिकताएं बदलें"
                : "Manage language, accessibility and app preferences"
            }
            onClick={() => setScreen(SCREENS.SETTINGS)}
          />

          <MenuItem
            icon={Accessibility}
            title={
              isHindi
                ? "पहुंच सुविधाएं"
                : "Accessibility"
            }
            description={
              isHindi
                ? "टेक्स्ट, ऑडियो और उपयोग संबंधी सुविधाएं"
                : "Text, audio and usability preferences"
            }
            onClick={() => setScreen(SCREENS.SETTINGS)}
          />

          <MenuItem
            icon={Globe2}
            title={
              isHindi
                ? "भाषा"
                : "Language"
            }
            description={
              isHindi
                ? "हिंदी या अंग्रेज़ी इंटरफ़ेस चुनें"
                : "Choose Hindi or English interface"
            }
            onClick={() => setScreen(SCREENS.SETTINGS)}
          />
        </section>

        {/* About */}
        <section className="space-y-2.5">
          <div className="px-1">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "ऐप के बारे में" : "About"}
            </h2>
          </div>

          <MenuItem
            icon={Info}
            title={t("about_title")}
            description={
              isHindi
                ? "AyushCare मोबाइल साथी के बारे में जानकारी"
                : "Learn about the AyushCare mobile companion"
            }
            onClick={() => setScreen(SCREENS.ABOUT)}
          />
        </section>

        {/* Session information */}
        {session && (
          <section className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />

              <div className="min-w-0">
                <p className="text-xs font-black text-slate-700">
                  {isHindi
                    ? "वर्तमान मोबाइल सत्र"
                    : "Current mobile session"}
                </p>

                <p className="text-[11px] text-slate-500 mt-1 break-words">
                  {session.sessionId ||
                    session.id ||
                    (isHindi
                      ? "डेमो सत्र"
                      : "Demo session")}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Logout */}
        <section className="pt-1 pb-6">
          <button
            type="button"
            onClick={() => logoutPatient()}
            className="w-full min-h-[48px] rounded-2xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm font-black cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-2.5 leading-relaxed">
            {isHindi
              ? "लॉग आउट करने से इस डिवाइस पर आपका सक्रिय ऐप सत्र समाप्त हो जाएगा।"
              : "Logging out ends the active app session on this device."}
          </p>
        </section>
      </main>
    </div>
  );
};

export default MoreScreen;