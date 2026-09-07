import React from 'react';
import { ArrowRight, UserPlus, UserRoundSearch } from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';

export default function Screen2_PatientType() {
  const { updateSession, setScreen } = useKioskStore();
  const choose = (registrationType) => {
    updateSession({ registrationType });
    setScreen(registrationType === 'new' ? 3 : 3);
  };

  return (
    <section className="screen-card patient-type-screen">
      <div className="section-head">
        <div>
          <p className="eyebrow">01 • Patient registration</p>
          <h2>Are you a new or existing patient?</h2>
          <p>Please choose how you want to continue. Existing patients can be found using Patient ID or mobile number.</p>
        </div>
      </div>
      <div className="patient-type-grid">
        <button className="patient-type-card" onClick={() => choose('new')}>
          <span className="patient-type-icon"><UserPlus size={34}/></span>
          <strong>New Patient</strong>
          <span>Register your basic details for a new visit.</span>
          <ArrowRight size={22}/>
        </button>
        <button className="patient-type-card" onClick={() => choose('old')}>
          <span className="patient-type-icon"><UserRoundSearch size={34}/></span>
          <strong>Existing Patient</strong>
          <span>Find your record using Patient ID or mobile number.</span>
          <ArrowRight size={22}/>
        </button>
      </div>
    </section>
  );
}
