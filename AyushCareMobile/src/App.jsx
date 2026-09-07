import React, { lazy, Suspense, useEffect } from "react";

import useMobileStore, { SCREENS } from "./store/useMobileStore";

import LanguageSwitcher from "./components/mobile/LanguageSwitcher";

const AuthScreen = lazy(() => import("./pages/mobile/AuthScreen"));
const M1MobileHome = lazy(() => import("./pages/mobile/M1_MobileHome"));
const M2DocumentType = lazy(() => import("./pages/mobile/M2_DocumentType"));
const M3DocumentCapture = lazy(() => import("./pages/mobile/M3_DocumentCapture"));
const M4DocumentReview = lazy(() => import("./pages/mobile/M4_DocumentReview"));
const M5DocumentAnalysis = lazy(() => import("./pages/mobile/M5_DocumentAnalysis"));
const M6ExtractedInformation = lazy(() => import("./pages/mobile/M6_ExtractedInformation"));
const M7MedicalTimeline = lazy(() => import("./pages/mobile/M7_MedicalTimeline"));
const M8HealthSummary = lazy(() => import("./pages/mobile/M8_HealthSummary"));
const M9InformationSent = lazy(() => import("./pages/mobile/M9_InformationSent"));
const AppointmentsScreen = lazy(() => import("./pages/mobile/AppointmentsScreen"));
const MyVisitsScreen = lazy(() => import("./pages/mobile/MyVisitsScreen"));
const VisitDetailsScreen = lazy(() => import("./pages/mobile/VisitDetailsScreen"));
const RecordsScreen = lazy(() => import("./pages/mobile/RecordsScreen"));
const DocumentDetailsScreen = lazy(() => import("./pages/mobile/DocumentDetailsScreen"));
const MoreScreen = lazy(() => import("./pages/mobile/MoreScreen"));
const PrivacyScreen = lazy(() => import("./pages/mobile/PrivacyScreen"));
const ConsentDetailsScreen = lazy(() => import("./pages/mobile/ConsentDetailsScreen"));
const KioskConnectScreen = lazy(() => import("./pages/mobile/KioskConnectScreen"));
const KioskSessionDetailsScreen = lazy(() => import("./pages/mobile/KioskSessionDetailsScreen"));
const ProfileScreen = lazy(() => import("./pages/mobile/ProfileScreen"));
const SettingsScreen = lazy(() => import("./pages/mobile/SettingsScreen"));
const AboutScreen = lazy(() => import("./pages/mobile/AboutScreen"));

const HEADER_SCREENS = new Set([
  SCREENS.M1,
  SCREENS.VISITS,
  SCREENS.VISIT_DETAILS,
  SCREENS.APPOINTMENTS,
  SCREENS.RECORDS,
  SCREENS.DOCUMENT_DETAILS,
  SCREENS.MORE,
  SCREENS.PRIVACY,
  SCREENS.CONSENT_DETAILS,
  SCREENS.PROFILE,
  SCREENS.SETTINGS,
  SCREENS.ABOUT,
]);

function App() {
  const {
    currentScreen,
    isAuthenticated,
    accessibilitySettings,
    kioskSession,
    isSessionExpired,
    timerSecondsRemaining,
    setScreen,
  } = useMobileStore();

  /* ---------------------------------------------------------------------- */
  /* ACCESSIBILITY                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const size = accessibilitySettings?.textSize || "default";

    document.documentElement.setAttribute(
      "data-text-size",
      size
    );

    if (accessibilitySettings?.highContrast) {
      document.documentElement.setAttribute(
        "data-high-contrast",
        "true"
      );
    } else {
      document.documentElement.removeAttribute(
        "data-high-contrast"
      );
    }

    if (accessibilitySettings?.reduceMotion) {
      document.documentElement.setAttribute(
        "data-reduce-motion",
        "true"
      );
    } else {
      document.documentElement.removeAttribute(
        "data-reduce-motion"
      );
    }
  }, [accessibilitySettings]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-mobile-screen", currentScreen);
  }, [currentScreen]);

  /* ---------------------------------------------------------------------- */
  /* QR KIOSK ENTRY                                                         */
  /* ---------------------------------------------------------------------- */

  const urlHasPairingToken =
    typeof window !== "undefined" &&
    new URLSearchParams(
      window.location.search
    ).has("pairing_token");

  /*
   * Keep QR mode alive while the kiosk session is active.
   *
   * This is intentionally independent of patient authentication.
   */
  const activeKioskSession =
    kioskSession?.status === "CONNECTED" &&
    !isSessionExpired &&
    Number(timerSecondsRemaining) > 0;

  const kioskScreens = [
    SCREENS.KIOSK_CONNECT,
    SCREENS.KIOSK_SESSION,
    SCREENS.M2,
    SCREENS.M3,
    SCREENS.M4,
    SCREENS.M5,
    SCREENS.M6,
    SCREENS.M7,
    SCREENS.M8,
    SCREENS.M9,
  ];

  const isKioskDocumentFlow =
    kioskScreens.includes(currentScreen);

  /*
   * A QR-originated session is allowed through the application
   * without Mobile Portal authentication.
   *
   * Normal Mobile screens still require authentication.
   */
  const allowWithoutPatientLogin =
    urlHasPairingToken ||
    activeKioskSession ||
    isKioskDocumentFlow;

  /* ---------------------------------------------------------------------- */
  /* QR URL → CONNECT SCREEN                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(
      window.location.search
    );

    const token =
      params.get("pairing_token");

    if (!token) {
      return;
    }

    /*
     * Always enter the kiosk connection screen when a QR
     * pairing token is present.
     */
    if (
      currentScreen !== SCREENS.KIOSK_CONNECT &&
      !activeKioskSession
    ) {
      setScreen(SCREENS.KIOSK_CONNECT);
    }
  }, [
    currentScreen,
    activeKioskSession,
    setScreen,
  ]);

  /* ---------------------------------------------------------------------- */
  /* KIOSK SESSION EXPIRY                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      !kioskSession ||
      kioskSession.status !== "CONNECTED"
    ) {
      return;
    }

    if (
      isSessionExpired ||
      Number(timerSecondsRemaining) <= 0
    ) {
      return;
    }

    const expiresAt =
      kioskSession.expiresAt;

    if (!expiresAt) {
      return;
    }

    const expiryTime =
      new Date(expiresAt).getTime();

    if (Number.isNaN(expiryTime)) {
      return;
    }

    const remaining =
      expiryTime - Date.now();

    if (remaining <= 0) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        const state =
          useMobileStore.getState();

        if (
          state.kioskSession?.status ===
          "CONNECTED"
        ) {
          state.decrementTimer();
        }
      }, remaining + 50);

    return () =>
      window.clearTimeout(timeout);
  }, [
    kioskSession,
    isSessionExpired,
    timerSecondsRemaining,
  ]);

  /* ---------------------------------------------------------------------- */
  /* SCREEN ROUTER                                                          */
  /* ---------------------------------------------------------------------- */

  const renderScreen = () => {
    if (
      !isAuthenticated &&
      currentScreen !== SCREENS.AUTH &&
      !allowWithoutPatientLogin
    ) {
      return <AuthScreen />;
    }

    switch (currentScreen) {
      case SCREENS.AUTH:
        return <AuthScreen />;
      case SCREENS.M1:
        return <M1MobileHome />;
      case SCREENS.M2:
        return <M2DocumentType />;
      case SCREENS.M3:
        return <M3DocumentCapture />;
      case SCREENS.M4:
        return <M4DocumentReview />;
      case SCREENS.M5:
        return <M5DocumentAnalysis />;
      case SCREENS.M6:
        return <M6ExtractedInformation />;
      case SCREENS.M7:
        return <M7MedicalTimeline />;
      case SCREENS.M8:
        return <M8HealthSummary />;
      case SCREENS.M9:
        return <M9InformationSent />;
      case SCREENS.VISITS:
        return <MyVisitsScreen />;
      case SCREENS.VISIT_DETAILS:
        return <VisitDetailsScreen />;
      case SCREENS.APPOINTMENTS:
        return <AppointmentsScreen />;
      case SCREENS.RECORDS:
        return <RecordsScreen />;
      case SCREENS.DOCUMENT_DETAILS:
        return <DocumentDetailsScreen />;
      case SCREENS.MORE:
        return <MoreScreen />;
      case SCREENS.PRIVACY:
        return <PrivacyScreen />;
      case SCREENS.CONSENT_DETAILS:
        return <ConsentDetailsScreen />;
      case SCREENS.KIOSK_CONNECT:
        return <KioskConnectScreen />;
      case SCREENS.KIOSK_SESSION:
        return <KioskSessionDetailsScreen />;
      case SCREENS.PROFILE:
        return <ProfileScreen />;
      case SCREENS.SETTINGS:
        return <SettingsScreen />;
      case SCREENS.ABOUT:
        return <AboutScreen />;
      default:
        return isAuthenticated ? <M1MobileHome /> : <AuthScreen />;
    }
  };

  return (
    <>
      <Suspense
        fallback={
          <div className="mobile-app-loading">
            <div className="mobile-loading-spinner" />
            <span>Loading AyushCare…</span>
          </div>
        }
      >
        {renderScreen()}
      </Suspense>

      {!HEADER_SCREENS.has(currentScreen) && (
        <LanguageSwitcher floating />
      )}
    </>
  );
}

export default App;
