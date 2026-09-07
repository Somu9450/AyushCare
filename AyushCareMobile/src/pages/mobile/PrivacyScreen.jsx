import React, { useEffect } from "react";
import { FileText, Layers3, CalendarDays, ShieldCheck, Loader2 } from "lucide-react";
import useMobileStore from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

function Toggle({ enabled, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={enabled} aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${enabled ? "bg-teal-700" : "bg-slate-300"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? "left-7" : "left-1"}`} />
    </button>
  );
}

export default function PrivacyScreen() {
  const { privacyData, updatePrivacySetting, loadPrivacySettings } = useMobileStore();
  const { isHindi } = useLanguage();
  const settings = privacyData?.serverSettings || {};

  useEffect(() => { void loadPrivacySettings?.(); }, [loadPrivacySettings]);

  const controls = [
    { key: "share_previous_departments", icon: Layers3, en: "Previous departments", hi: "पिछले विभाग", descEn: "Allow previous department/visit information to be shared.", descHi: "पिछले विभाग और विज़िट की जानकारी साझा करें।" },
    { key: "share_previous_reports", icon: FileText, en: "Previous reports", hi: "पिछली रिपोर्ट", descEn: "Allow saved prescriptions and reports to be shown.", descHi: "सहेजी गई दवाइयां और रिपोर्ट दिखाने की अनुमति दें।" },
    { key: "share_previous_appointments", icon: CalendarDays, en: "Previous appointments", hi: "पिछली अपॉइंटमेंट", descEn: "Allow previous appointment/visit history to be shown.", descHi: "पिछली अपॉइंटमेंट और विज़िट इतिहास दिखाएं।" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <MobileHeader title={isHindi ? "गोपनीयता नियंत्रण" : "Privacy controls"} subtitle={isHindi ? "आप तय करें क्या साझा करना है" : "You control what is shared"} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
          <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700"><ShieldCheck size={21}/></div><div><h2 className="font-bold text-teal-950">{isHindi ? "डेटा साझा करने का नियंत्रण" : "Control your shared data"}</h2><p className="mt-1 text-xs leading-5 text-teal-800">{isHindi ? "किसी भी समय इन विकल्पों को बंद या चालू करें।" : "Turn each category on or off at any time."}</p></div></div>
        </section>
        <section className="mt-5 space-y-3">
          {controls.map(({ key, icon: Icon, en, hi, descEn, descHi }) => {
            const enabled = settings[key] !== false;
            return <div key={key} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${enabled ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}><Icon size={20}/></div>
              <div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{isHindi ? hi : en}</p><p className="mt-1 text-xs leading-5 text-slate-500">{isHindi ? descHi : descEn}</p></div>
              <Toggle enabled={enabled} label={isHindi ? hi : en} onChange={(value) => void updatePrivacySetting?.(key, value)} />
            </div>;
          })}
        </section>
        <p className="mt-5 px-1 text-xs leading-5 text-slate-500">{isHindi ? "बंद की गई पिछली जानकारी सामान्य पोर्टल दृश्य से छिपी रहेगी।" : "When a category is off, that previous information stays hidden from the portal view."}</p>
      </main>
      <BottomNavBar />
    </div>
  );
}
