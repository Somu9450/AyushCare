import React from 'react';
import { useKioskStore } from './store/useKioskStore';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import EmergencyModal from './components/kiosk/EmergencyModal';
import StepProgressIndicator from './components/kiosk/StepProgressIndicator';

// Screen components
import Screen1_Welcome from './pages/Screen1_Welcome';
import Screen2_Auth from './pages/Screen2_Auth';
import Screen3_DepartmentSelector from './pages/Screen3_DepartmentSelector';
import Screen4_SymptomIntake from './pages/Screen4_SymptomIntake';
import Screen5_FollowUpWizard from './pages/Screen5_FollowUpWizard';
import Screen6_HealthHistory from './pages/Screen6_HealthHistory';
import Screen7_PreparingSession from './pages/Screen7_PreparingSession';
import Screen8_QRUpload from './pages/Screen8_QRUpload';
import Screen9_ReviewSubmission from './pages/Screen9_ReviewSubmission';
import Screen10_TokenSuccess from './pages/Screen10_TokenSuccess';

function App() {
  const { currentScreen, highContrast, sessionData, nextScreen } = useKioskStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return <Screen1_Welcome />;
      case 2:
        return <Screen2_Auth />;
      case 3:
        return <Screen3_DepartmentSelector />;
      case 4:
        return <Screen4_SymptomIntake />;
      case 5:
        return <Screen5_FollowUpWizard />;
      case 6:
        return <Screen6_HealthHistory />;
      case 7:
        return <Screen7_PreparingSession />;
      case 8:
        return <Screen8_QRUpload />;
      case 9:
        return <Screen9_ReviewSubmission />;
      case 10:
        return <Screen10_TokenSuccess />;
      default:
        return <Screen1_Welcome />;
    }
  };

  // Determine whether Footer displays a Continue button for the current screen
  const canContinueFromFooter = () => {
    if (currentScreen === 2) {
      return sessionData.isVerified;
    }
    if (currentScreen === 3) {
      return Boolean(sessionData.selectedDepartment);
    }
    return false;
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${highContrast ? 'kiosk-high-contrast' : ''}`}>
      {/* Top Navbar */}
      <Navbar />

      {/* 10-Step Kiosk Progress Indicator */}
      <StepProgressIndicator />

      {/* Dynamic Screen Viewport */}
      <main className="flex-1 flex flex-col">
        {renderScreen()}
      </main>

      {/* Global Kiosk Emergency Alert Modal */}
      <EmergencyModal />

      {/* Bottom Kiosk Footer */}
      <Footer
        showContinue={canContinueFromFooter()}
        onContinue={nextScreen}
        continueLabel="Continue"
      />
    </div>
  );
}

export default App;
