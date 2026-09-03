import React, { Suspense, lazy } from 'react';

import { useKioskStore } from './store/useKioskStore';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import EmergencyModal from './components/kiosk/EmergencyModal';
import StepProgressIndicator from './components/kiosk/StepProgressIndicator';
import { KeyboardProvider } from './context/KeyboardContext';
import OnscreenKeyboard from './components/common/OnscreenKeyboard';
import { KioskPageSkeleton } from './components/common/KioskSkeleton';

const Screen1_Welcome = lazy(() => import('./pages/Screen1_Welcome'));
const Screen2_Auth = lazy(() => import('./pages/Screen2_Auth'));
const Screen3_DepartmentSelector = lazy(() => import('./pages/Screen3_DepartmentSelector'));
const Screen4_SymptomIntake = lazy(() => import('./pages/Screen4_SymptomIntake'));
const Screen5_FollowUpWizard = lazy(() => import('./pages/Screen5_FollowUpWizard'));
const Screen6_HealthHistory = lazy(() => import('./pages/Screen6_HealthHistory'));
const Screen7_PreparingSession = lazy(() => import('./pages/Screen7_PreparingSession'));
const Screen8_QRUpload = lazy(() => import('./pages/Screen8_QRUpload'));
const Screen9_ReviewSubmission = lazy(() => import('./pages/Screen9_ReviewSubmission'));
const Screen10_TokenSuccess = lazy(() => import('./pages/Screen10_TokenSuccess'));

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
    <KeyboardProvider>
      <div className={appClasses}>

        <Navbar />

        <StepProgressIndicator />

        <main className="kiosk-main">
          <Suspense fallback={<KioskPageSkeleton />}>
            {renderScreen()}
          </Suspense>
        </main>

        <Footer
          showContinue={canContinue()}
          onContinue={nextScreen}
          continueLabel="Continue"
          continueDisabled={!canContinue()}
        />

        <EmergencyModal />
        <OnscreenKeyboard />

      </div>
    </KeyboardProvider>
  );
};

export default App;