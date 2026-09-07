import React, { useEffect, useState } from 'react';
import { Leaf, Loader2, ShieldCheck, Stethoscope } from 'lucide-react';
import { kioskApi, getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Screen3_DepartmentSelector() {
  const { sessionData, language, updateSession, setScreen } = useKioskStore();
  const { t } = useTranslation();
  const pathway = sessionData.pathway || 'allopathy';

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dept, setDept] = useState(sessionData.selectedDepartment?.id || '');
  const [doctor, setDoctor] = useState(sessionData.requestedDoctor?.id || '');
  const [clinicalIntake, setClinicalIntake] = useState(Boolean(sessionData.consent?.clinical_intake));
  const [documentProcessing, setDocumentProcessing] = useState(sessionData.consent?.document_processing !== false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    kioskApi.departments(pathway)
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setDepartments(list);
        setDept(sessionData.selectedDepartment?.id || list[0]?.id || '');
      })
      .catch((e) => alive && setError(getErrorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [pathway, sessionData.selectedDepartment?.id]);

  useEffect(() => {
    if (!dept) { setDoctors([]); return; }
    kioskApi.doctors(dept)
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setDoctors([]));
  }, [dept]);

  const startSession = async () => {
    if (!dept || !clinicalIntake || !sessionData.patientProfile) {
      setError(!clinicalIntake ? 'Explicit clinical intake consent is required.' : 'Please complete the patient details first.');
      return;
    }

    const selected = departments.find((d) => d.id === dept) || null;
    const selectedDoctor = doctors.find((d) => d.id === doctor) || null;
    const profile = sessionData.patientProfile || {};

    setSaving(true);
    setError('');

    try {
      // Session creation intentionally happens only after the patient has
      // explicitly selected the required clinical-intake consent.
      const d = await kioskApi.verifyPatient({
        registrationType: sessionData.registrationType || 'new',
        patientId: sessionData.patientId || profile.patientId || undefined,
        mobileNumber: String(profile.mobileNumber || '').replace(/\D/g, ''),
        aadhaar: String(profile.aadhaar || '').replace(/\D/g, ''),
        abhaNumber: String(profile.abha || '').replace(/\D/g, ''),
        fullName: profile.full_name || profile.name || '',
        age: Number(profile.age) || undefined,
        address: profile.address || '',
        gender: profile.gender || '',
        consent: true,
        language,
        intakePathway: pathway,
        departmentId: selected?.id,
        department: selected?.name,
        doctorId: selectedDoctor?.id,
        doctor: selectedDoctor?.name,
        kioskId: import.meta.env.VITE_KIOSK_ID || 'KIOSK-MAIN-01',
      });

      const consultationId = d?.session_id || d?.consultation_id || d?.id;
      if (!consultationId) throw new Error('The backend did not return a consultation session ID.');

      const patient = { ...profile, ...(d?.patient || {}) };
      const patientId = patient.patient_code || patient.patient_id || patient.patientId || sessionData.patientId || '';
      const consent = {
        clinical_intake: true,
        document_processing: documentProcessing,
        his_abdm_sharing: false,
      };

      // Keep the explicit consent receipt in the session. If the auth/session
      // endpoint already recorded consent, this grant call simply synchronizes
      // the final scope selection including document processing.
      let receipt = null;
      try {
        receipt = await kioskApi.grantConsent(consultationId, consent);
      } catch (consentError) {
        // Do not proceed if the backend cannot persist consent. This is a
        // safety boundary for the clinical interview.
        throw consentError;
      }

      updateSession({
        patientProfile: patient,
        patientId,
        consultationId,
        aiSessionId: d?.ai_session_id,
        pairingSession: d?.pairing_session,
        selectedDepartment: selected,
        requestedDoctor: selectedDoctor,
        consent,
        consentReceipt: receipt,
        isVerified: true,
      });

      // Navigate to language selection screen (screen 5) before AI interview.
      setScreen(5);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="screen-card">
      <p className="eyebrow">03 • {t('department')}</p>
      <h2>{t('department')}</h2>
      <p>{pathway === 'ayurveda' ? t('ayurveda') : t('allopathy')} pathway is selected. Choose where you would like to be routed.</p>

      <div className="pathway-banner">
        {pathway === 'ayurveda' ? <Leaf /> : <Stethoscope />}
        <strong>{pathway === 'ayurveda' ? t('ayurveda') : t('allopathy')}</strong>
        <span>{pathway === 'ayurveda' ? t('ayurvedaDesc') : t('allopathyDesc')}</span>
      </div>

      <div className="form-grid compact">
        <label>
          <span>{t('department')}</span>
          <select value={dept} onChange={(e) => setDept(e.target.value)} disabled={loading}>
            <option value="">{loading ? 'Loading…' : 'Select department'}</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label>
          <span>{t('doctor')}</span>
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
            <option value="">{t('anyDoctor')}</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      </div>

      <div className="consent-card department-consent-card">
        <div className="consent-card-heading">
          <ShieldCheck size={26} />
          <div>
            <h3>Privacy & Clinical Consent</h3>
            <p>Please provide consent before we create your clinical intake session and start the AI-assisted health interview.</p>
          </div>
        </div>

        <label className="consent-line">
          <input type="checkbox" checked={clinicalIntake} onChange={(e) => { setClinicalIntake(e.target.checked); if (e.target.checked) setError(''); }} />
          <span>I consent to clinical intake and processing of the information I provide for my healthcare consultation. <strong>Required</strong></span>
        </label>

        <label className="consent-line">
          <input type="checkbox" checked={documentProcessing} onChange={(e) => setDocumentProcessing(e.target.checked)} />
          <span>I consent to processing of medical documents that I choose to upload during this session.</span>
        </label>
      </div>

      {error && <div className="error-box">{error}</div>}
      <button className="primary-btn wide" disabled={!dept || !clinicalIntake || loading || saving} onClick={startSession}>
        {saving ? <><Loader2 className="spin" /> Starting secure session…</> : t('continue')}
      </button>
    </section>
  );
}
