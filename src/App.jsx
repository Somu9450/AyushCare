import React from 'react';

import { useKioskStore } from './store/useKioskStore';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import EmergencyModal from './components/kiosk/EmergencyModal';
import StepProgressIndicator from './components/kiosk/StepProgressIndicator';

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

const App = () => {
  const {
    currentScreen,
    highContrast,
    audioEnabled,
    sessionData,
    nextScreen,
  } = useKioskStore();

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

  const canContinue = () => {
    switch (currentScreen) {
      case 2:
        return Boolean(
          sessionData.isVerified &&
          sessionData.patientProfile
        );

      case 3:
        return Boolean(
          sessionData.selectedDepartment
        );

      default:
        return false;
    }
  };

  const appClasses = [
    'kiosk-app',
    highContrast ? 'kiosk-high-contrast' : '',
    !audioEnabled ? 'kiosk-silent-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={appClasses}>

      <Navbar />

      <StepProgressIndicator />

      <main className="kiosk-main">
        {renderScreen()}
      </main>

      <Footer
        showContinue={canContinue()}
        onContinue={nextScreen}
        continueLabel="Continue"
        continueDisabled={!canContinue()}
      />

      <EmergencyModal />

    </div>
  );
};

export default App;