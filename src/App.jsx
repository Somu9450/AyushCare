import React, { lazy, Suspense, useEffect } from "react";

import useMobileStore, { SCREENS } from "./store/useMobileStore";

import LanguageSwitcher from "./components/mobile/LanguageSwitcher";
import { exchangePatientQrToken } from "./services/authService";

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
    setScreen,
    setDocumentUploadContext,
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
  /* PATIENT QR ENTRY                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = new URLSearchParams(window.location.search).get("qr_token");
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const result = await exchangePatientQrToken(token);
        if (cancelled) return;
        const patient = result.patient || result.user || null;
        useMobileStore.getState().setVerifiedPatient(patient, "QR");
        setDocumentUploadContext({
          consultationId: result.consultation_id || null,
          source: "patient_qr",
        });
        useMobileStore.setState({ documentProcessingConsent: Boolean(result.document_processing_consent) });
        await useMobileStore.getState().loadPortalData?.();
        useMobileStore.getState().setScreen(SCREENS.M2);
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        console.error("Patient QR login failed:", error);
        useMobileStore.getState().setScreen(SCREENS.AUTH);
      }
    })();
    return () => { cancelled = true; };
  }, [setDocumentUploadContext]);

  /* ---------------------------------------------------------------------- */
  /* SCREEN ROUTER                                                          */
  /* ---------------------------------------------------------------------- */

  const renderScreen = () => {
    if (!isAuthenticated && currentScreen !== SCREENS.AUTH) {
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
