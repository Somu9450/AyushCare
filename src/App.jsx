import useMobileStore, { SCREENS } from "./store/useMobileStore";
import AuthScreen from "./pages/mobile/AuthScreen";
import M1_MobileHome from "./pages/mobile/M1_MobileHome";
import MyVisitsScreen from "./pages/mobile/MyVisitsScreen";
import VisitDetailsScreen from "./pages/mobile/VisitDetailsScreen";
import AppointmentsScreen from "./pages/mobile/AppointmentsScreen";
import RecordsScreen from "./pages/mobile/RecordsScreen";
import DocumentDetailsScreen from "./pages/mobile/DocumentDetailsScreen";
import MoreScreen from "./pages/mobile/MoreScreen";
import PrivacyScreen from "./pages/mobile/PrivacyScreen";
import ConsentDetailsScreen from "./pages/mobile/ConsentDetailsScreen";
import KioskConnectScreen from "./pages/mobile/KioskConnectScreen";
import KioskSessionDetailsScreen from "./pages/mobile/KioskSessionDetailsScreen";
import ProfileScreen from "./pages/mobile/ProfileScreen";
import SettingsScreen from "./pages/mobile/SettingsScreen";
import M2_DocumentType from "./pages/mobile/M2_DocumentType";
import M3_DocumentCapture from "./pages/mobile/M3_DocumentCapture";
import M4_DocumentReview from "./pages/mobile/M4_DocumentReview";
import M5_DocumentAnalysis from "./pages/mobile/M5_DocumentAnalysis";
import M6_ExtractedInformation from "./pages/mobile/M6_ExtractedInformation";
import M7_MedicalTimeline from "./pages/mobile/M7_MedicalTimeline";
import M8_HealthSummary from "./pages/mobile/M8_HealthSummary";
import M9_InformationSent from "./pages/mobile/M9_InformationSent";

function App() {
  const { currentScreen, accessibilitySettings } = useMobileStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.AUTH:
        return <AuthScreen />;
      case SCREENS.M1:
        return <M1_MobileHome />;
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
      case SCREENS.M2:
        return <M2_DocumentType />;
      case SCREENS.M3:
        return <M3_DocumentCapture />;
      case SCREENS.M4:
        return <M4_DocumentReview />;
      case SCREENS.M5:
        return <M5_DocumentAnalysis />;
      case SCREENS.M6:
        return <M6_ExtractedInformation />;
      case SCREENS.M7:
        return <M7_MedicalTimeline />;
      case SCREENS.M8:
        return <M8_HealthSummary />;
      case SCREENS.M9:
        return <M9_InformationSent />;
      default:
        return <M1_MobileHome />;
    }
  };

  // Accessibility class modifiers
  const textSizeClass =
    accessibilitySettings?.textSize === "large"
      ? "text-size-large"
      : accessibilitySettings?.textSize === "xlarge"
      ? "text-size-xlarge"
      : "";

  const highContrastClass = accessibilitySettings?.highContrast
    ? "theme-high-contrast"
    : "";

  const reduceMotionClass = accessibilitySettings?.reduceMotion
    ? "theme-reduce-motion"
    : "";

  return (
    <div
      className={`min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans antialiased ${textSizeClass} ${highContrastClass} ${reduceMotionClass}`}
    >
      <div className="flex-1 flex flex-col w-full">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
