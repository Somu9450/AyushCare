import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  History,
  Info,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  XCircle,
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

export default function ConsentDetailsScreen() {
  const {
    privacyData,
    consentHistory,
    accessHistory,
    setScreen,
    withdrawConsent,
    regrantConsent,
    toggleConsent,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const [expandedConsent, setExpandedConsent] =
    useState(null);

  const activeConsents = Array.isArray(
    privacyData?.activeConsents
  )
    ? privacyData.activeConsents
    : [];

  const history = Array.isArray(consentHistory)
    ? consentHistory
    : Array.isArray(privacyData?.consentHistory)
      ? privacyData.consentHistory
      : [];

  const accesses = Array.isArray(accessHistory)
    ? accessHistory
    : Array.isArray(privacyData?.accessHistory)
      ? privacyData.accessHistory
      : [];

  const handleWithdraw = (consent) => {
    const id =
      consent?.id ||
      consent?.consentId ||
      consent?.key;

    if (!id) return;

    if (typeof withdrawConsent === "function") {
      withdrawConsent(id);
      return;
    }

    if (typeof toggleConsent === "function") {
      toggleConsent(id);
    }
  };

  const handleRegrant = (consent) => {
    const id =
      consent?.id ||
      consent?.consentId ||
      consent?.key;

    if (!id) return;

    if (typeof regrantConsent === "function") {
      regrantConsent(id);
      return;
    }

    if (typeof toggleConsent === "function") {
      toggleConsent(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileHeader
        title={
          isHindi
            ? "सहमति विवरण"
            : "Consent Details"
        }
        subtitle={
          isHindi
            ? "डेटा उपयोग की अनुमतियां प्रबंधित करें"
            : "Manage permissions for data use"
        }
      />

      <main className="mx-auto w-full max-w-md px-4 py-5 pb-24">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h1 className="text-base font-black text-slate-900">
                {isHindi
                  ? "आपकी सहमति आपके नियंत्रण में है"
                  : "Your consent stays under your control"}
              </h1>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {isHindi
                  ? "किसी अनुमति को वापस लेने पर संबंधित डेटा-साझाकरण सुविधा प्रतिबंधित हो सकती है।"
                  : "Withdrawing a permission may restrict the related data-sharing feature."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <SectionTitle
            icon={UserCheck}
            title={
              isHindi
                ? "सक्रिय सहमतियां"
                : "Active consents"
            }
          />

          {activeConsents.length === 0 ? (
            <EmptyCard
              icon={UserCheck}
              text={
                isHindi
                  ? "कोई सक्रिय सहमति नहीं है।"
                  : "There are no active consents."
              }
            />
          ) : (
            <div className="space-y-3">
              {activeConsents.map(
                (consent, index) => {
                  const id =
                    consent?.id ||
                    consent?.consentId ||
                    consent?.key ||
                    `consent-${index}`;

                  const expanded =
                    expandedConsent === id;

                  const withdrawn =
                    String(
                      consent?.status || ""
                    ).toUpperCase() ===
                    "WITHDRAWN";

                  return (
                    <ConsentCard
                      key={id}
                      consent={consent}
                      expanded={expanded}
                      withdrawn={withdrawn}
                      isHindi={isHindi}
                      onToggle={() =>
                        setExpandedConsent(
                          expanded ? null : id
                        )
                      }
                      onWithdraw={() =>
                        handleWithdraw(consent)
                      }
                      onRegrant={() =>
                        handleRegrant(consent)
                      }
                    />
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="mt-7">
          <SectionTitle
            icon={History}
            title={
              isHindi
                ? "सहमति इतिहास"
                : "Consent history"
            }
          />

          {history.length === 0 ? (
            <EmptyCard
              icon={History}
              text={
                isHindi
                  ? "सहमति इतिहास उपलब्ध नहीं है।"
                  : "No consent history available."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {history.map((item, index) => {
                const status = String(
                  item?.status ||
                    item?.action ||
                    ""
                ).toUpperCase();

                const withdrawn =
                  status.includes("WITHDRAW") ||
                  status.includes("REVOK");

                return (
                  <div
                    key={
                      item?.id ||
                      item?.consentId ||
                      `history-${index}`
                    }
                    className={`p-4 ${
                      index < history.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {withdrawn ? (
                        <XCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-rose-600"
                        />
                      ) : (
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">
                          {item?.purpose ||
                            item?.title ||
                            item?.scope ||
                            (isHindi
                              ? "डेटा अनुमति"
                              : "Data permission")}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-500">
                          {item?.action ||
                            item?.status ||
                            (isHindi
                              ? "स्थिति उपलब्ध नहीं"
                              : "Status unavailable")}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatDate(
                            item?.timestamp ||
                              item?.createdAt ||
                              item?.updatedAt ||
                              item?.grantedAt ||
                              item?.withdrawnAt,
                            isHindi
                          )}
                        </p>
                      </div>
                    </div>

                    {withdrawn ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleRegrant(item)
                        }
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-2 text-[10px] font-bold text-teal-800"
                      >
                        <RotateCcw size={13} />
                        {isHindi
                          ? "फिर अनुमति दें"
                          : "Re-grant"}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-7">
          <SectionTitle
            icon={Clock3}
            title={
              isHindi
                ? "डेटा एक्सेस इतिहास"
                : "Data access history"
            }
          />

          {accesses.length === 0 ? (
            <EmptyCard
              icon={Clock3}
              text={
                isHindi
                  ? "अभी कोई एक्सेस गतिविधि नहीं है।"
                  : "No access activity available."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {accesses.map((item, index) => (
                <div
                  key={
                    item?.id ||
                    item?.accessId ||
                    `access-${index}`
                  }
                  className={`p-4 ${
                    index < accesses.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        {item?.actor ||
                          item?.service ||
                          item?.accessedBy ||
                          (isHindi
                            ? "सेवा"
                            : "Service")}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item?.purpose ||
                          item?.action ||
                          (isHindi
                            ? "डेटा एक्सेस"
                            : "Data access")}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(
                          item?.timestamp ||
                            item?.createdAt ||
                            item?.accessedAt,
                          isHindi
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() =>
            setScreen(SCREENS.PRIVACY)
          }
          className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white"
        >
          {isHindi
            ? "गोपनीयता पर वापस जाएं"
            : "Back to privacy"}
        </button>
      </main>

      <BottomNavBar />
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <Icon size={15} className="text-slate-500" />

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
        {title}
      </h2>
    </div>
  );
}

function ConsentCard({
  consent,
  expanded,
  withdrawn,
  isHindi,
  onToggle,
  onWithdraw,
  onRegrant,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <UserCheck size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-800">
            {consent?.title ||
              consent?.purpose ||
              consent?.scope ||
              (isHindi
                ? "डेटा उपयोग की अनुमति"
                : "Data-use permission")}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {consent?.status ||
              (isHindi ? "सक्रिय" : "Active")}
          </p>
        </div>

        {expanded ? (
          <ChevronUp
            size={18}
            className="shrink-0 text-slate-400"
          />
        ) : (
          <ChevronDown
            size={18}
            className="shrink-0 text-slate-400"
          />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 p-3.5">
            <div className="flex items-start gap-2">
              <Info
                size={15}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <p className="text-xs leading-5 text-slate-600">
                {consent?.description ||
                  consent?.details ||
                  (isHindi
                    ? "यह अनुमति स्वास्थ्य जानकारी के निर्धारित उपयोग की अनुमति देती है।"
                    : "This permission allows the stated use of your health information.")}
              </p>
            </div>
          </div>

          {withdrawn ? (
            <button
              type="button"
              onClick={onRegrant}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-50 text-xs font-bold text-teal-800"
            >
              <RotateCcw size={15} />
              {isHindi
                ? "फिर अनुमति दें"
                : "Re-grant consent"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onWithdraw}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-50 text-xs font-bold text-rose-700"
            >
              <XCircle size={15} />
              {isHindi
                ? "सहमति वापस लें"
                : "Withdraw consent"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function EmptyCard({
  icon: Icon,
  text,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-7 text-center">
      <Icon
        size={28}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 text-xs font-semibold text-slate-500">
        {text}
      </p>
    </div>
  );
}