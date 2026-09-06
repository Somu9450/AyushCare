import React, {
  useEffect,
} from "react";

import useMobileStore, {
  SCREENS,
} from "./store/useMobileStore";

import AuthScreen from "./pages/mobile/AuthScreen";

import M1MobileHome from "./pages/mobile/M1_MobileHome";
import M2DocumentType from "./pages/mobile/M2_DocumentType";
import M3DocumentCapture from "./pages/mobile/M3_DocumentCapture";
import M4DocumentReview from "./pages/mobile/M4_DocumentReview";
import M5DocumentAnalysis from "./pages/mobile/M5_DocumentAnalysis";
import M6ExtractedInformation from "./pages/mobile/M6_ExtractedInformation";
import M7MedicalTimeline from "./pages/mobile/M7_MedicalTimeline";
import M8HealthSummary from "./pages/mobile/M8_HealthSummary";
import M9InformationSent from "./pages/mobile/M9_InformationSent";

import AppointmentsScreen from "./pages/mobile/AppointmentsScreen";
import MyVisitsScreen from "./pages/mobile/MyVisitsScreen";
import VisitDetailsScreen from "./pages/mobile/VisitDetailsScreen";

import RecordsScreen from "./pages/mobile/RecordsScreen";
import DocumentDetailsScreen from "./pages/mobile/DocumentDetailsScreen";

import MoreScreen from "./pages/mobile/MoreScreen";
import PrivacyScreen from "./pages/mobile/PrivacyScreen";
import ConsentDetailsScreen from "./pages/mobile/ConsentDetailsScreen";

import KioskConnectScreen from "./pages/mobile/KioskConnectScreen";
import KioskSessionDetailsScreen from "./pages/mobile/KioskSessionDetailsScreen";

import ProfileScreen from "./pages/mobile/ProfileScreen";
import SettingsScreen from "./pages/mobile/SettingsScreen";
import AboutScreen from "./pages/mobile/AboutScreen";

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

  /* ------------------------------------------------------------------------ */
  /* ACCESSIBILITY                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const size =
      accessibilitySettings
        ?.textSize ||
      "default";

    document.documentElement.setAttribute(
      "data-text-size",
      size
    );

    if (
      accessibilitySettings
        ?.highContrast
    ) {
      document.documentElement.setAttribute(
        "data-high-contrast",
        "true"
      );
    } else {
      document.documentElement.removeAttribute(
        "data-high-contrast"
      );
    }

    if (
      accessibilitySettings
        ?.reduceMotion
    ) {
      document.documentElement.setAttribute(
        "data-reduce-motion",
        "true"
      );
    } else {
      document.documentElement.removeAttribute(
        "data-reduce-motion"
      );
    }
  }, [
    accessibilitySettings,
  ]);

  /* ------------------------------------------------------------------------ */
  /* KIOSK EXPIRY SAFETY                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !kioskSession ||
      kioskSession.status !==
        "CONNECTED"
    ) {
      return;
    }

    if (
      isSessionExpired ||
      Number(
        timerSecondsRemaining
      ) <= 0
    ) {
      return;
    }

    const expiresAt =
      kioskSession.expiresAt;

    if (!expiresAt) {
      return;
    }

    const expiryTime =
      new Date(
        expiresAt
      ).getTime();

    if (
      Number.isNaN(expiryTime)
    ) {
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
          state.kioskSession
            ?.status ===
          "CONNECTED"
        ) {
          /*
           * Let the store's timer lifecycle perform the final transition.
           */
          state.decrementTimer();
        }
      }, remaining + 50);

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [
    kioskSession,
    isSessionExpired,
    timerSecondsRemaining,
  ]);

  /* ------------------------------------------------------------------------ */
  /* AUTH GUARD                                                              */
  /* ------------------------------------------------------------------------ */

  if (
    !isAuthenticated &&
    currentScreen !==
      SCREENS.AUTH
  ) {
    return <AuthScreen />;
  }

  /* ------------------------------------------------------------------------ */
  /* SCREEN ROUTER                                                            */
  /* ------------------------------------------------------------------------ */

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
      return (
        <KioskSessionDetailsScreen />
      );

    case SCREENS.PROFILE:
      return <ProfileScreen />;

    case SCREENS.SETTINGS:
      return <SettingsScreen />;

    case SCREENS.ABOUT:
      return <AboutScreen />;

    default:
      setScreen(
        isAuthenticated
          ? SCREENS.M1
          : SCREENS.AUTH
      );

      return isAuthenticated ? (
        <M1MobileHome />
      ) : (
        <AuthScreen />
      );
  }
}

export default App;