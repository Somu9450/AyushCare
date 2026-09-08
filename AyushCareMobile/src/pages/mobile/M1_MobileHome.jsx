import React, {
  useEffect,
} from "react";

import {
  UploadCloud,
  FileHeart,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
  Stethoscope,
  FileText,
  Activity,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";


import MobileHeader from "../../components/mobile/MobileHeader";
import AppointmentDetailsModal from "../../components/mobile/AppointmentDetailsModal";

import { useLanguage } from "../../i18n/translations";

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const getLatestItem = (
  items
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  return items[0];
};

const formatTimer = (
  seconds
) => {
  const safeSeconds =
    Math.max(
      0,
      Number(seconds) || 0
    );

  const mins =
    Math.floor(
      safeSeconds / 60
    );

  const secs =
    safeSeconds % 60;

  return `${String(
    mins
  ).padStart(
    2,
    "0"
  )}:${String(
    secs
  ).padStart(
    2,
    "0"
  )}`;
};

/* ========================================================================== */
/* HOME                                                                       */
/* ========================================================================== */

export const M1_MobileHome =
  () => {
    const {
      patient,
      session,

      appointments,
      visits,
      medicalRecords,

      setScreen,
      setActiveNavTab,

      setSelectedAppointment,
      setSelectedVisit,
      setSelectedMedicalRecord,
    } = useMobileStore();

    const {
      t,
      isHindi,
    } = useLanguage();

    /* ---------------------------------------------------------------------- */
    /* PATIENT                                                                 */
    /* ---------------------------------------------------------------------- */

    const resolvedPatient =
      patient ||
      session?.patient ||
      {};

    const displayName =
      isHindi
        ? resolvedPatient.hindiName ||
          resolvedPatient.name ||
          "मरीज़"
        : resolvedPatient.name ||
          "Patient";

    /* ---------------------------------------------------------------------- */
    /* APPOINTMENT                                                             */
    /* ---------------------------------------------------------------------- */

    const todayAppointment =
      getLatestItem(
        appointments
      ) ||
      null ||
      null;

    const openAppointment =
      () => {
        if (
          !todayAppointment
        ) {
          setScreen(
            SCREENS.APPOINTMENTS
          );
          return;
        }

        setSelectedAppointment(
          todayAppointment
        );
      };

    /* ---------------------------------------------------------------------- */
    /* VISIT                                                                   */
    /* ---------------------------------------------------------------------- */

    const latestVisit =
      getLatestItem(
        visits
      ) ||
      getLatestItem(
        []
      );

    const openVisit =
      () => {
        if (!latestVisit) {
          setScreen(
            SCREENS.VISITS
          );
          return;
        }

        setSelectedVisit(
          latestVisit
        );

        setScreen(
          SCREENS.VISIT_DETAILS
        );
      };

    /* ---------------------------------------------------------------------- */
    /* RECORD                                                                  */
    /* ---------------------------------------------------------------------- */

    const latestRecord =
      getLatestItem(
        medicalRecords
      );

    const openRecord =
      () => {
        if (!latestRecord) {
          setScreen(
            SCREENS.RECORDS
          );
          return;
        }

        setSelectedMedicalRecord(
          latestRecord
        );

        setScreen(
          SCREENS.DOCUMENT_DETAILS
        );
      };

    /* ---------------------------------------------------------------------- */
    /* NAVIGATION HELPERS                                                      */
    /* ---------------------------------------------------------------------- */

    const goHome =
      () => {
        setActiveNavTab(
          "home"
        );

        setScreen(
          SCREENS.M1
        );
      };

    const goVisits =
      () => {
        setActiveNavTab(
          "visits"
        );

        setScreen(
          SCREENS.VISITS
        );
      };

    const goRecords =
      () => {
        setActiveNavTab(
          "records"
        );

        setScreen(
          SCREENS.RECORDS
        );
      };

    const goAppointments =
      () => {
        setActiveNavTab(
          "visits"
        );

        setScreen(
          SCREENS.APPOINTMENTS
        );
      };

    const startUpload =
      () => {
        /*
         * M2 starts a NEW upload document.
         *
         * The store's documentDraft is
         * cleared/created by the document
         * workflow itself.
         */
        setScreen(
          SCREENS.M2
        );
      };

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                  */
    /* ---------------------------------------------------------------------- */

    return (
      <div className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <MobileHeader
          showBack={false}
        />

        <main
          className="
            flex-1
            w-full
            max-w-md
            md:max-w-3xl
            lg:max-w-4xl
            mx-auto
            px-4
            sm:px-6
            py-4
            sm:py-6
            space-y-5
          "
        >
          {/* ================================================================ */
          /* PATIENT GREETING                                                  */
          /* ================================================================ */}

          <section
            aria-label={
              isHindi
                ? "रोगी जानकारी"
                : "Patient information"
            }
            className="
              flex
              items-center
              justify-between
              gap-3
              px-1
            "
          >
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">
                {t(
                  "home_welcome_back"
                )}
              </p>

              <h1
                className="
                  text-xl
                  sm:text-2xl
                  font-black
                  text-slate-900
                  leading-tight
                  truncate
                "
              >
                {displayName}
              </h1>
            </div>

            <div className="shrink-0 text-right">
              <span
                className="
                  text-[11px]
                  font-bold
                  text-teal-800
                  bg-teal-50
                  px-2.5
                  py-1
                  rounded-full
                  border
                  border-teal-200
                  inline-block
                "
              >
                {isHindi
                  ? "आभा:"
                  : "ABHA:"}{" "}
                {resolvedPatient.abhaNumber ||
                  (
                    isHindi
                      ? "उपलब्ध नहीं"
                      : "Not Linked"
                  )}
              </span>
              {(resolvedPatient.patient_code || resolvedPatient.patientId || resolvedPatient.patient_id) && (
                <span className="mt-1 inline-block text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                  {isHindi ? "रोगी ID:" : "Patient ID:"} {resolvedPatient.patient_code || resolvedPatient.patientId || resolvedPatient.patient_id}
                </span>
              )}
            </div>
          </section>
          {/* ================================================================ */}
          {/* TODAY'S APPOINTMENT                                               */}
          {/* ================================================================ */}

          {todayAppointment && (
            <section
              aria-label={
                isHindi
                  ? "आज की अपॉइंटमेंट"
                  : "Today's appointment"
              }
              className="
                p-4
                sm:p-5
                rounded-3xl
                bg-teal-900
                text-white
                shadow-md
                space-y-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                  border-b
                  border-white/15
                  pb-3
                "
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-300" />

                  <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                    {t(
                      "home_today_consultation"
                    )}
                  </span>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
                  {t(
                    "home_in_queue"
                  )}
                </span>
              </div>

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wide">
                    {t(
                      "home_your_opd_token"
                    )}
                  </p>

                  <p className="text-3xl font-black font-mono tracking-tight">
                    {todayAppointment.tokenNumber ||
                      "—"}
                  </p>

                  <p className="text-sm font-bold text-teal-100 mt-1">
                    {isHindi
                      ? todayAppointment.hindiDoctorName ||
                        todayAppointment.doctorName ||
                        "डॉक्टर"
                      : todayAppointment.doctorName ||
                        "Doctor"}
                  </p>

                  <p className="text-xs text-teal-200/80">
                    {isHindi
                      ? todayAppointment.hindiSpecialty ||
                        todayAppointment.specialty ||
                        "चिकित्सा"
                      : todayAppointment.specialty ||
                        "General Medicine"}
                  </p>
                </div>

                <div className="text-right shrink-0 bg-white/10 p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-teal-200 uppercase">
                    {t(
                      "home_room_no"
                    )}
                  </p>

                  <p className="text-base font-black">
                    {todayAppointment.room ||
                      "—"}
                  </p>

                  <p className="text-[10px] text-teal-200 mt-0.5">
                    {todayAppointment.timeSlot ||
                      "Today"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-amber-300" />

                  <span className="font-semibold">
                    {todayAppointment.queuePosition ||
                      0}{" "}
                    {t(
                      "home_patients_ahead"
                    )}
                  </span>
                </div>

                <span className="text-teal-200 font-bold">
                  {t(
                    "home_estimated_wait"
                  )}{" "}
                  ~
                  {todayAppointment.estimatedWaitTime ||
                    "—"}
                </span>
              </div>

              <button
                type="button"
                onClick={
                  openAppointment
                }
                className="
                  w-full
                  h-11
                  rounded-2xl
                  bg-white
                  text-teal-950
                  font-bold
                  text-xs
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  hover:bg-teal-50
                  active:scale-[0.99]
                "
              >
                {t(
                  "home_btn_view_apt_details"
                )}

                <ChevronRight className="w-4 h-4" />
              </button>
            </section>
          )}

          {/* ================================================================ */
          /* RECENT VISIT                                                      */
          /* ================================================================ */}

          <section
            aria-label={
              isHindi
                ? "हाल की मुलाकात"
                : "Recent visit"
            }
            className="
              p-4
              sm:p-5
              rounded-3xl
              bg-white
              border
              border-slate-200
              shadow-sm
              space-y-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                pb-2.5
              "
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-800" />

                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {t(
                    "home_recent_visit"
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  goVisits
                }
                className="text-xs font-bold text-teal-800 hover:text-teal-950"
              >
                {t(
                  "home_all_visits"
                )}
              </button>
            </div>

            {latestVisit ? (
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400">
                    {latestVisit.date ||
                      "Recent visit"}
                  </span>

                  <h3 className="text-base font-black text-slate-900 truncate">
                    {isHindi
                      ? latestVisit.hindiDoctor ||
                        latestVisit.doctor ||
                        "डॉक्टर"
                      : latestVisit.doctor ||
                        "Doctor"}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium truncate">
                    {isHindi
                      ? latestVisit.hindiDepartment ||
                        latestVisit.department ||
                        "चिकित्सा विभाग"
                      : latestVisit.department ||
                        "General Medicine"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    openVisit
                  }
                  className="
                    px-3.5
                    py-2
                    rounded-xl
                    bg-teal-50
                    hover:bg-teal-100
                    text-teal-800
                    font-bold
                    text-xs
                    flex
                    items-center
                    gap-1
                    border
                    border-teal-200
                    shrink-0
                  "
                >
                  {t(
                    "view_details"
                  )}

                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  goVisits
                }
                className="
                  w-full
                  p-3
                  rounded-2xl
                  bg-slate-50
                  text-left
                  text-sm
                  text-slate-600
                  font-medium
                "
              >
                {isHindi
                  ? "अपनी पिछली मुलाकातें देखें"
                  : "View your previous visits"}
              </button>
            )}
          </section>

          {/* ================================================================ */
          /* RECENT RECORD                                                     */
          /* ================================================================ */}

          <section
            aria-label={
              isHindi
                ? "हालिया रिकॉर्ड"
                : "Recent medical record"
            }
            className="
              p-4
              sm:p-5
              rounded-3xl
              bg-white
              border
              border-slate-200
              shadow-sm
              space-y-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                pb-2.5
              "
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800" />

                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {isHindi
                    ? "हालिया दस्तावेज़"
                    : "Recent Document"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  goRecords
                }
                className="text-xs font-bold text-teal-800 hover:text-teal-950"
              >
                {isHindi
                  ? "सभी रिकॉर्ड्स →"
                  : "All Records →"}
              </button>
            </div>

            {latestRecord ? (
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400">
                    {latestRecord.displayDate ||
                      latestRecord.date ||
                      "Recent"}{" "}
                    ·{" "}
                    {latestRecord.typeLabel ||
                      "Medical Record"}
                  </span>

                  <h3 className="text-base font-black text-slate-900 truncate">
                    {latestRecord.title ||
                      "Medical Record"}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium truncate">
                    {latestRecord.source ||
                      "Patient Record"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    openRecord
                  }
                  className="
                    px-3.5
                    py-2
                    rounded-xl
                    bg-teal-50
                    hover:bg-teal-100
                    text-teal-800
                    font-bold
                    text-xs
                    flex
                    items-center
                    gap-1
                    border
                    border-teal-200
                    shrink-0
                  "
                >
                  {t(
                    "view_details"
                  )}

                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  goRecords
                }
                className="
                  w-full
                  p-3
                  rounded-2xl
                  bg-slate-50
                  text-left
                  text-sm
                  text-slate-600
                  font-medium
                "
              >
                {isHindi
                  ? "अपने मेडिकल रिकॉर्ड देखें"
                  : "View your medical records"}
              </button>
            )}
          </section>

          {/* ================================================================ */
          /* QUICK ACTIONS                                                     */
          /* ================================================================ */}

          <section
            aria-label={
              isHindi
                ? "त्वरित कार्य"
                : "Quick actions"
            }
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t(
                  "home_quick_actions"
                )}
              </h2>

              <button
                type="button"
                onClick={
                  goAppointments
                }
                className="text-xs font-bold text-teal-800 hover:text-teal-950"
              >
                {isHindi
                  ? "अपॉइंटमेंट →"
                  : "Appointments →"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Upload */}
              <button
                type="button"
                onClick={
                  startUpload
                }
                className="
                  w-full
                  p-4
                  sm:p-5
                  rounded-3xl
                  border-2
                  border-teal-700
                  bg-white
                  hover:bg-teal-50
                  shadow-sm
                  text-left
                  flex
                  items-start
                  justify-between
                  gap-3
                  group
                  active:scale-[0.99]
                "
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-teal-50
                      text-teal-800
                      flex
                      items-center
                      justify-center
                      shrink-0
                      group-hover:bg-teal-800
                      group-hover:text-white
                    "
                  >
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      {t(
                        "home_upload_docs"
                      )}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {t(
                        "home_upload_docs_sub"
                      )}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-3" />
              </button>

              {/* Health Summary */}
              <button
                type="button"
                onClick={() =>
                  setScreen(
                    SCREENS.M8
                  )
                }
                className="
                  w-full
                  p-4
                  sm:p-5
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  hover:bg-slate-50
                  shadow-sm
                  text-left
                  flex
                  items-start
                  justify-between
                  gap-3
                  active:scale-[0.99]
                "
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <FileHeart className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      {t(
                        "home_health_summary"
                      )}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {t(
                        "home_health_summary_sub"
                      )}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-3" />
              </button>
            </div>
          </section>

          {/* ================================================================ */
          /* PRIVACY / SAFETY                                                  */
          /* ================================================================ */}

          <div
            className="
              p-3
              rounded-2xl
              bg-slate-100
              border
              border-slate-200
              flex
              items-start
              gap-2.5
              text-xs
              text-slate-600
            "
          >
            <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />

            <p className="leading-snug">
              {isHindi
                ? "आपके दस्तावेज़ और स्वास्थ्य जानकारी आपके नियंत्रण में हैं। साझा करने से पहले अपनी गोपनीयता सेटिंग जांचें।"
                : "Your documents and health information remain under your control. Check your privacy settings before sharing."}
            </p>
          </div>
        </main>



        {/* ================================================================== */
        /* APPOINTMENT MODAL                                                    */
        /* ================================================================== */}

        <AppointmentDetailsModal />
      </div>
    );
  };

export default M1_MobileHome;