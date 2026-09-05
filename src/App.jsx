import useMobileStore, { SCREENS } from "./store/useMobileStore";
import M1_MobileHome from "./pages/mobile/M1_MobileHome";
import M2_DocumentType from "./pages/mobile/M2_DocumentType";
import M3_DocumentCapture from "./pages/mobile/M3_DocumentCapture";
import M4_DocumentReview from "./pages/mobile/M4_DocumentReview";
import M5_DocumentAnalysis from "./pages/mobile/M5_DocumentAnalysis";
import M6_ExtractedInformation from "./pages/mobile/M6_ExtractedInformation";
import M7_MedicalTimeline from "./pages/mobile/M7_MedicalTimeline";
import M8_HealthSummary from "./pages/mobile/M8_HealthSummary";
import M9_InformationSent from "./pages/mobile/M9_InformationSent";

function App() {
  const { currentScreen } = useMobileStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.M1:
        return <M1_MobileHome />;
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

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <div className="flex-1 flex flex-col w-full">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
