import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import { useLanguage } from "../../i18n/translations";

export default function ProfileScreen() {
  const {
    patient,
    session,
    updatePatientProfile,
    logout,
    setScreen,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const activePatient =
    patient || session?.patient || {};

  const [editing, setEditing] =
    useState(false);

  const [form, setForm] = useState({
    name: activePatient?.name || "",
    mobile:
      activePatient?.mobile ||
      activePatient?.phone ||
      "",
    email: activePatient?.email || "",
    dateOfBirth:
      activePatient?.dateOfBirth ||
      activePatient?.dob ||
      "",
  });

  const displayName =
    activePatient?.name ||
    (isHindi ? "मरीज़" : "Patient");

  const patientId =
    activePatient?.patientId ||
    activePatient?.id ||
    "—";

  const authMethod =
    activePatient?.authMethod ||
    activePatient?.authType ||
    "";

  const initials = useMemo(() => {
    const parts = String(displayName)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "P";
    }

    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [displayName]);

  const handleSave = () => {
    if (
      typeof updatePatientProfile ===
      "function"
    ) {
      updatePatientProfile({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        phone: form.mobile.trim(),
        email: form.email.trim(),
        dateOfBirth:
          form.dateOfBirth || null,
        dob: form.dateOfBirth || null,
      });
    }

    setEditing(false);
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
        title={isHindi ? "प्रोफ़ाइल" : "Profile"}
        subtitle={
          isHindi
            ? "अपनी जानकारी और खाता सेटिंग देखें"
            : "Manage your personal information"
        }
      />

      <main className="mx-auto w-full max-w-md px-4 py-5 pb-24">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-teal-800 text-lg font-black text-white">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black text-slate-900">
                {displayName}
              </h1>

              <p className="mt-1 truncate text-xs text-slate-500">
                Patient ID · {patientId}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
              aria-label={
                isHindi
                  ? "प्रोफ़ाइल संपादित करें"
                  : "Edit profile"
              }
            >
              <Edit3 size={17} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-teal-50 p-3">
            <ShieldCheck
              size={17}
              className="shrink-0 text-teal-700"
            />

            <p className="text-xs font-medium leading-5 text-teal-900">
              {authMethod
                ? isHindi
                  ? `${authMethod} से पहचान सत्यापित`
                  : `Identity verified using ${authMethod}`
                : isHindi
                  ? "पहचान सत्यापन उपलब्ध है"
                  : "Identity verification available"}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <SectionTitle
            title={
              isHindi
                ? "व्यक्तिगत जानकारी"
                : "Personal information"
            }
          />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <InfoRow
              icon={User}
              label={
                isHindi ? "पूरा नाम" : "Full name"
              }
              value={displayName}
            />

            <InfoRow
              icon={Phone}
              label={
                isHindi
                  ? "मोबाइल नंबर"
                  : "Mobile number"
              }
              value={
                activePatient?.mobile ||
                activePatient?.phone ||
                "—"
              }
            />

            <InfoRow
              icon={Mail}
              label={isHindi ? "ईमेल" : "Email"}
              value={
                activePatient?.email || "—"
              }
            />

            <InfoRow
              icon={CalendarDays}
              label={
                isHindi
                  ? "जन्म तिथि"
                  : "Date of birth"
              }
              value={
                activePatient?.dateOfBirth ||
                activePatient?.dob ||
                "—"
              }
              last
            />
          </div>
        </section>

        <section className="mt-6">
          <SectionTitle
            title={
              isHindi
                ? "खाता और सुरक्षा"
                : "Account & security"
            }
          />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <ActionRow
              title={
                isHindi
                  ? "गोपनीयता नियंत्रण"
                  : "Privacy controls"
              }
              subtitle={
                isHindi
                  ? "सहमति और डेटा एक्सेस प्रबंधित करें"
                  : "Manage consent and data access"
              }
              onClick={() =>
                setScreen(SCREENS.PRIVACY)
              }
            />

            <ActionRow
              title={
                isHindi
                  ? "सेटिंग्स"
                  : "Settings"
              }
              subtitle={
                isHindi
                  ? "भाषा और पहुंच विकल्प"
                  : "Language and accessibility"
              }
              onClick={() =>
                setScreen(SCREENS.SETTINGS)
              }
              last
            />
          </div>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-sm font-bold text-rose-700 shadow-sm"
        >
          <LogOut size={17} />
          {isHindi ? "लॉग आउट" : "Log out"}
        </button>

        <p className="mt-4 px-3 text-center text-[10px] leading-5 text-slate-400">
          {isHindi
            ? "लॉग आउट करने पर इस डिवाइस की वर्तमान पहचान सत्र समाप्त हो जाएगा।"
            : "Logging out ends the current identity session on this device."}
        </p>
      </main>

      {editing ? (
        <EditProfileModal
          form={form}
          setForm={setForm}
          isHindi={isHindi}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      ) : null}
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

function InfoRow({
  icon: Icon,
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-4 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionRow({
  title,
  subtitle,
  onClick,
  last = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-4 text-left active:bg-slate-50 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-500">
          {subtitle}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-400"
      />
    </button>
  );
}

function EditProfileModal({
  form,
  setForm,
  isHindi,
  onClose,
  onSave,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isHindi
                ? "प्रोफ़ाइल संपादित करें"
                : "Edit profile"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isHindi
                ? "अपनी जानकारी अपडेट करें"
                : "Update your personal details"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-3">
          <Field
            label={
              isHindi ? "पूरा नाम" : "Full name"
            }
            value={form.name}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                name: value,
              }))
            }
          />

          <Field
            label={
              isHindi
                ? "मोबाइल नंबर"
                : "Mobile number"
            }
            type="tel"
            value={form.mobile}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                mobile: value,
              }))
            }
          />

          <Field
            label={
              isHindi ? "ईमेल" : "Email"
            }
            type="email"
            value={form.email}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                email: value,
              }))
            }
          />

          <Field
            label={
              isHindi
                ? "जन्म तिथि"
                : "Date of birth"
            }
            type="date"
            value={form.dateOfBirth}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                dateOfBirth: value,
              }))
            }
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          className="mt-5 w-full rounded-2xl bg-teal-800 px-5 py-3.5 text-sm font-bold text-white"
        >
          {isHindi
            ? "परिवर्तन सहेजें"
            : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}