import React, { Suspense, lazy } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { useKioskStore } from './store/useKioskStore';
import './App.css';

const Screen1_Welcome = lazy(() => import('./pages/Screen1_Welcome'));
const Screen2_Auth = lazy(() => import('./pages/Screen2_Auth'));
const Screen3_DepartmentSelector = lazy(() => import('./pages/Screen3_DepartmentSelector'));
const Screen4_Consent = lazy(() => import('./pages/Screen4_Consent'));
const Screen4_SymptomIntake = lazy(() => import('./pages/Screen4_SymptomIntake'));
const Screen6_HealthHistory = lazy(() => import('./pages/Screen6_HealthHistory'));
const Screen8_QRUpload = lazy(() => import('./pages/Screen8_QRUpload'));
const Screen9_ReviewSubmission = lazy(() => import('./pages/Screen9_ReviewSubmission'));
const Screen10_TokenSuccess = lazy(() => import('./pages/Screen10_TokenSuccess'));

function ScreenLoader() {
  return (
    <div className="screen-loading" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <span>Loading</span>
    </div>
  );
}

export default function App() {
  const { currentScreen, highContrast } = useKioskStore();

  const screen = {
    1: <Screen1_Welcome />,
    2: <Screen2_Auth />,
    3: <Screen3_DepartmentSelector />,
    4: <Screen4_Consent />,
    5: <Screen4_SymptomIntake />,
    6: <Screen6_HealthHistory />,
    7: <Screen8_QRUpload />,
    8: <Screen9_ReviewSubmission />,
    9: <Screen10_TokenSuccess />,
  }[currentScreen] || <Screen1_Welcome />;

  return (
    <div className={`kiosk-app ${highContrast ? 'high-contrast' : ''}`}>
      <Navbar />
      <main className="kiosk-main" aria-label="AyushCare patient kiosk">
        <div className="kiosk-main-scroll">
          <Suspense fallback={<ScreenLoader />}>
            {screen}
          </Suspense>
        </div>
      </main>
      {currentScreen < 9 && <Footer showContinue={false} />}
    </div>
  );
}
