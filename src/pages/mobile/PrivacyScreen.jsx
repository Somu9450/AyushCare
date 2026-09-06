import React from "react";
import {
  ChevronRight,
  Clock3,
  FileLock2,
  History,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
  UserCheck,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

function formatDate(value, isHindi) {
  if (!value) {
    return isHindi ? "उपलब्ध नहीं" : "Unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(
    isHindi ? "hi-IN" : "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function PrivacyScreen() {
  const {
    privacyData,
    healthHistorySharing,
    isHealthHistoryLocked,
    activeSessions,
    consentHistory,
    accessHistory,
    setScreen,
    toggleHealthHistorySharing,
    endKioskSession,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const sharingEnabled =
    healthHistorySharing !== false &&
    !isHealthHistoryLocked;

  const activeConsents = Array.isArray(
    privacyData?.activeConsents
  )
    ? privacyData.activeConsents.filter(
        (consent) =>
          String(consent?.status || "").toUpperCase() !==
          "WITHDRAWN"
      )
    : [];

  const activeSessionList = Array.isArray(
    activeSessions
  )
    ? activeSessions
    : Array.isArray(privacyData?.activeSessions)
      ? privacyData.activeSessions
      : [];

  const recentAccesses = Array.isArray(
    accessHistory
  )
    ? accessHistory.slice(0, 5)
    : Array.isArray(privacyData?.accessHistory)
      ? privacyData.accessHistory.slice(0, 5)
      : [];

  const recentConsents = Array.isArray(
    consentHistory
  )
    ? consentHistory.slice(0, 5)
    : Array.isArray(privacyData?.consentHistory)
      ? privacyData.consentHistory.slice(0, 5)
      : [];

  const handleToggleSharing = () => {
    if (typeof toggleHealthHistorySharing === "function") {
      toggleHealthHistorySharing();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileHeader
        title={
          isHindi
            ? "गोपनीयता और डेटा नियंत्रण"
            : "Privacy & Data Control"
        }
        subtitle={
          isHindi
            ? "अपने स्वास्थ्य डेटा के उपयोग को नियंत्रित करें"
            : "Control how your health information is used"
        }
      />

      <main className="mx-auto w-full max-w-md px-4 py-5 pb-24">
        <section
          className={`rounded-3xl p-5 shadow-sm ${
            sharingEnabled
              ? "bg-teal-900 text-white"
              : "bg-amber-50 text-amber-950 ring-1 ring-amber-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                sharingEnabled
                  ? "bg-teal-800"
                  : "bg-amber-100"
              }`}
            >
              {sharingEnabled ? (
                <ShieldCheck size={22} />
              ) : (
                <Lock size={22} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-[10px] font-black uppercase tracking-wider ${
                  sharingEnabled
                    ? "text-teal-200"
                    : "text-amber-700"
                }`}
              >
                {isHindi
                  ? "स्वास्थ्य इतिहास"
                  : "Health history"}
              </p>

              <h1 className="mt-1 text-lg font-black">
                {sharingEnabled
                  ? isHindi
                    ? "साझाकरण सक्षम है"
                    : "Sharing is enabled"
                  : isHindi
                    ? "साझाकरण प्रतिबंधित है"
                    : "Sharing is restricted"}
              </h1>

              <p
                className={`mt-2 text-xs leading-5 ${
                  sharingEnabled
                    ? "text-teal-100"
                    : "text-amber-800"
                }`}
              >
                {sharingEnabled
                  ? isHindi
                    ? "आपकी अनुमति के अनुसार स्वास्थ्य इतिहास संबंधित सेवाओं के साथ साझा किया जा सकता है।"
                    : "Your health history may be shared with relevant services according to your permissions."
                  : isHindi
                    ? "स्वास्थ्य इतिहास साझा करने की सुविधा वर्तमान में बंद है।"
                    : "Health-history sharing is currently turned off."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleSharing}
            className={`mt-5 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold transition active:scale-[0.99] ${
              sharingEnabled
                ? "bg-white text-teal-950"
                : "bg-amber-900 text-white"
            }`}
          >
            {sharingEnabled
              ? isHindi
                ? "साझाकरण बंद करें"
                : "Turn off sharing"
              : isHindi
                ? "साझाकरण सक्षम करें"
                : "Enable sharing"}
          </button>
        </section>

        <section className="mt-6">
          <SectionTitle
            title={
              isHindi ? "अनुमतियां" : "Permissions"
            }
          />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <PrivacyRow
              icon={UserCheck}
              title={
                isHindi
                  ? "सक्रिय सहमतियां"
                  : "Active consents"
              }
              subtitle={
                isHindi
                  ? `${activeConsents.length} सक्रिय अनुमति`
                  : `${activeConsents.length} active permission${
                      activeConsents.length === 1
                        ? ""
                        : "s"
                    }`
              }
              onClick={() =>
                setScreen(SCREENS.CONSENT_DETAILS)
              }
            />

            <PrivacyRow
              icon={History}
              title={
                isHindi
                  ? "सहमति इतिहास"
                  : "Consent history"
              }
              subtitle={
                isHindi
                  ? `${recentConsents.length} हाल की प्रविष्टियां`
                  : `${recentConsents.length} recent entr${
                      recentConsents.length === 1
                        ? "y"
                        : "ies"
                    }`
              }
              onClick={() =>
                setScreen(SCREENS.CONSENT_DETAILS)
              }
            />

            <PrivacyRow
              icon={Clock3}
              title={
                isHindi
                  ? "डेटा एक्सेस इतिहास"
                  : "Access history"
              }
              subtitle={
                isHindi
                  ? `${recentAccesses.length} हाल की गतिविधियां`
                  : `${recentAccesses.length} recent activit${
                      recentAccesses.length === 1
                        ? "y"
                        : "ies"
                    }`
              }
              onClick={() =>
                setScreen(SCREENS.CONSENT_DETAILS)
              }
              last
            />
          </div>
        </section>

        <section className="mt-6">
          <SectionTitle
            title={
              isHindi
                ? "सक्रिय डिवाइस सत्र"
                : "Active device sessions"
            }
          />

          {activeSessionList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <Smartphone
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-600">
                {isHindi
                  ? "कोई सक्रिय डिवाइस सत्र नहीं है।"
                  : "No active device sessions."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeSessionList.map(
                (session, index) => (
                  <ActiveSessionCard
                    key={
                      session?.id ||
                      session?.sessionId ||
                      `session-${index}`
                    }
                    session={session}
                    isHindi={isHindi}
                    onEnd={() =>
                      endKioskSession?.(
                        session?.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        <section className="mt-6">
          <SectionTitle
            title={
              isHindi
                ? "गोपनीयता नियंत्रण"
                : "Privacy controls"
            }
          />

          <div className="space-y-2.5">
            <ControlCard
              icon={FileLock2}
              title={
                isHindi
                  ? "सहमति प्रबंधित करें"
                  : "Manage consents"
              }
              description={
                isHindi
                  ? "देखें कि किन सेवाओं को आपकी जानकारी तक अनुमति मिली है।"
                  : "Review which services have permission to access your information."
              }
              onClick={() =>
                setScreen(SCREENS.CONSENT_DETAILS)
              }
            />

            <ControlCard
              icon={KeyRound}
              title={
                isHindi
                  ? "डेटा एक्सेस देखें"
                  : "Review data access"
              }
              description={
                isHindi
                  ? "आपके डेटा तक हाल में किस प्रकार पहुंच हुई, देखें।"
                  : "Review recent activity involving your data."
              }
              onClick={() =>
                setScreen(SCREENS.CONSENT_DETAILS)
              }
            />
          </div>
        </section>

        <div className="mt-6 rounded-2xl bg-slate-100 p-4">
          <p className="text-[11px] leading-5 text-slate-500">
            {isHindi
              ? "गोपनीयता सेटिंग बदलने से रिकॉर्ड साझा करने और कुछ सुविधाओं की उपलब्धता पर असर पड़ सकता है।"
              : "Changing privacy settings may affect record sharing and the availability of some features."}
          </p>
        </div>
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

function PrivacyRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  last = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-slate-50 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-500">
          {subtitle}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-slate-400"
      />
    </button>
  );
}

function ActiveSessionCard({
  session,
  isHindi,
  onEnd,
}) {
  const isActive =
    String(session?.status || "").toUpperCase() ===
    "ACTIVE";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Smartphone size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">
            {session?.deviceName ||
              session?.kioskName ||
              session?.name ||
              (isHindi
                ? "कनेक्टेड डिवाइस"
                : "Connected device")}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-500">
            {session?.device ||
              session?.terminalId ||
              session?.location ||
              (isHindi ? "डिवाइस" : "Device")}
          </p>

          {session?.startedAt ? (
            <p className="mt-1 text-[10px] text-slate-400">
              {isHindi ? "शुरू: " : "Started: "}
              {formatDate(
                session.startedAt,
                isHindi
              )}
            </p>
          ) : null}
        </div>

        {isActive ? (
          <button
            type="button"
            onClick={onEnd}
            className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700"
          >
            {isHindi ? "समाप्त" : "End"}
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
            {session?.status || "—"}
          </span>
        )}
      </div>
    </div>
  );
}

function ControlCard({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-slate-400"
      />
    </button>
  );
}