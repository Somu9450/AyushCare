import React, { useState } from 'react';
import { ArrowRight, Loader2, MapPin, Search, UserRound, UserRoundSearch, UserPlus } from 'lucide-react';
import { kioskApi, getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import KioskInput from '../components/common/KioskInput';

const cleanDigits = (v) => String(v || '').replace(/\D/g, '');
const normalizePatient = (p = {}) => ({
  ...p,
  patientId: p.patientId || p.patient_id || p.patient_code || p.code || '',
  full_name: p.full_name || p.fullName || p.name || '',
  age: p.age ?? '',
  mobileNumber: p.mobileNumber || p.mobile_number || p.mobile || '',
  address: p.address || p.address_line || '',
  gender: p.gender || '',
  aadhaar: p.aadhaar || p.aadhaar_number || '',
  abha: p.abha || p.abha_number || p.abhaNumber || '',
  pathway: p.pathway || p.intake_pathway || 'allopathy',
});

export default function Screen2_Auth() {
  const { sessionData, updateSession, setScreen } = useKioskStore();
  const isOld = sessionData.registrationType === 'old';

  const [oldPatientId, setOldPatientId] = useState('');
  const [oldMobile, setOldMobile] = useState('');
  const [name, setName] = useState(sessionData.patientProfile?.full_name || '');
  const [age, setAge] = useState(sessionData.patientProfile?.age ? String(sessionData.patientProfile.age) : '');
  const [mobile, setMobile] = useState(sessionData.patientProfile?.mobileNumber || '');
  const [aadhaar, setAadhaar] = useState(sessionData.patientProfile?.aadhaar || '');
  const [abha, setAbha] = useState(sessionData.patientProfile?.abha || '');
  const [address, setAddress] = useState(sessionData.patientProfile?.address || '');
  const [gender, setGender] = useState(sessionData.patientProfile?.gender || '');
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const newValid = Boolean(
    name.trim() &&
    age && Number(age) > 0 && Number(age) <= 120 &&
    cleanDigits(mobile).length === 10 &&
    gender &&
    address.trim() &&
    (!aadhaar || cleanDigits(aadhaar).length === 12) &&
    (!abha || cleanDigits(abha).length === 14)
  );

  const oldValid = Boolean(
    oldPatientId.trim().length === 6 || cleanDigits(oldMobile).length === 10
  );

  const selectOldPatient = (raw) => {
    const patient = normalizePatient(raw);
    setSelected(patient);
    setName(patient.full_name);
    setAge(String(patient.age || ''));
    setMobile(cleanDigits(patient.mobileNumber));
    setAddress(patient.address);
    setGender(patient.gender);
    setAadhaar(cleanDigits(patient.aadhaar));
    setAbha(cleanDigits(patient.abha));
    updateSession({
      patientProfile: patient,
      patientId: patient.patientId,
      pathway: patient.pathway || sessionData.pathway || 'allopathy',
      identifier: cleanDigits(patient.mobileNumber),
      isVerified: true,
    });
  };

  const lookup = async () => {
    if (!oldValid) return;
    setLoading(true);
    setError('');
    setMatches([]);
    setSelected(null);

    try {
      const data = await kioskApi.lookupPatients({
        patientId: oldPatientId.trim().toUpperCase(),
        mobileNumber: cleanDigits(oldMobile),
      });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.patients)
          ? data.patients
          : data?.patient
            ? [data.patient]
            : [];

      if (!list.length) {
        setError('No patient record was found. Please check the Patient ID or mobile number.');
        return;
      }

      const normalized = list.map(normalizePatient);
      setMatches(normalized);
      if (normalized.length === 1) selectOldPatient(normalized[0]);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const continueNew = () => {
    if (!newValid) return;
    const profile = normalizePatient({
      full_name: name.trim(),
      age: Number(age),
      mobileNumber: cleanDigits(mobile),
      aadhaar: cleanDigits(aadhaar),
      abha: cleanDigits(abha),
      address: address.trim(),
      gender,
      patientId: sessionData.patientId || '',
      pathway: sessionData.pathway || 'allopathy',
    });
    updateSession({
      authType: 'Mobile',
      identifier: profile.mobileNumber,
      isVerified: true,
      patientProfile: profile,
      pathway: profile.pathway,
      consultationId: null,
      aiSessionId: null,
      pairingSession: null,
    });
    setScreen(4);
  };

  const continueOld = () => {
    if (!selected?.patientId) return;
    updateSession({
      registrationType: 'old',
      authType: 'Mobile',
      identifier: cleanDigits(selected.mobileNumber),
      isVerified: true,
      patientProfile: selected,
      patientId: selected.patientId,
      pathway: selected.pathway || 'allopathy',
      consultationId: null,
      aiSessionId: null,
      pairingSession: null,
    });
    setScreen(4);
  };

  return (
    <section className="screen-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">02 • {isOld ? 'Existing patient' : 'New patient registration'}</p>
          <h2>{isOld ? 'Find your patient record' : 'Patient details'}</h2>
          <p>
            {isOld
              ? 'Enter Patient ID or mobile number. If several records use the same mobile number, choose the correct patient.'
              : 'Enter the basic details needed to create your patient record.'}
          </p>
        </div>
        {isOld ? <UserRoundSearch size={42} /> : <UserPlus size={42} />}
      </div>

      {isOld ? (
        <>
          <div className="lookup-row">
            <label className="lookup-input-label">
              <span>Patient ID <small>(optional)</small></span>
              <KioskInput
                id="old-patient-id"
                value={oldPatientId}
                onChange={(v) => setOldPatientId(v.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase())}
                maxLength={6}
                label="Patient ID"
                placeholder="6 characters"
              />
            </label>
            <label className="lookup-input-label lookup-grow">
              <span>Mobile number <small>(optional)</small></span>
              <KioskInput
                id="old-patient-mobile"
                value={oldMobile}
                onChange={(v) => setOldMobile(cleanDigits(v).slice(0, 10))}
                type="tel"
                maxLength={10}
                label="Mobile number"
                placeholder="10 digit mobile"
              />
            </label>
            <button className="primary-btn lookup-btn" disabled={!oldValid || loading} onClick={lookup}>
              {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />} Find Patient
            </button>
          </div>

          <p className="lookup-note">Enter either field, or both for an exact match. Multiple patients on the same mobile number will be shown for selection.</p>

          {matches.length > 1 && (
            <div className="patient-match-list">
              <h3>Multiple patients found</h3>
              {matches.map((p) => (
                <button
                  key={p.patientId}
                  className={`patient-match ${selected?.patientId === p.patientId ? 'selected' : ''}`}
                  onClick={() => selectOldPatient(p)}
                >
                  <span>
                    <strong>{p.full_name || 'Patient'}</strong>
                    <small>ID: {p.patientId} · Age {p.age || '—'} · {p.gender || '—'}</small>
                    <small>{p.mobileNumber || '—'}</small>
                  </span>
                  <ArrowRight size={19} />
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="selected-patient-card">
              <div>
                <span className="eyebrow">Selected patient</span>
                <h3>{selected.full_name}</h3>
                <p>ID <strong>{selected.patientId}</strong> · {selected.age || '—'} years · {selected.gender || '—'}</p>
                <p>{selected.mobileNumber || '—'} · {selected.address || 'Address unavailable'}</p>
              </div>
              <button className="primary-btn" disabled={loading} onClick={continueOld}>
                <ArrowRight size={18} /> Continue
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="form-grid">
            <label><span>Name</span><KioskInput id="patient-name" value={name} onChange={setName} label="Patient name" placeholder="Full name" /></label>
            <label><span>Age</span><KioskInput id="patient-age" value={age} onChange={(v) => setAge(cleanDigits(v).slice(0, 3))} type="number" maxLength={3} label="Age" placeholder="Years" /></label>
            <label><span>Mobile number</span><KioskInput id="patient-mobile" value={mobile} onChange={(v) => setMobile(cleanDigits(v).slice(0, 10))} type="tel" maxLength={10} label="Mobile number" placeholder="10 digit mobile" /></label>
            <label><span>Aadhaar <small>(optional)</small></span><KioskInput id="patient-aadhaar" value={aadhaar} onChange={(v) => setAadhaar(cleanDigits(v).slice(0, 12))} type="tel" maxLength={12} label="Aadhaar number" placeholder="12 digit Aadhaar" /></label>
            <label><span>ABHA <small>(optional)</small></span><KioskInput id="patient-abha" value={abha} onChange={(v) => setAbha(cleanDigits(v).slice(0, 14))} type="tel" maxLength={14} label="ABHA number" placeholder="14 digit ABHA" /></label>
            <label><span>Gender</span><select value={gender} onChange={(e) => setGender(e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label className="full-span"><span>Address</span><KioskInput id="patient-address" value={address} onChange={setAddress} label="Address" placeholder="House / street / locality" /></label>
          </div>

          <div className="pathway-inline">
            <button type="button" className={(sessionData.pathway || 'allopathy') === 'allopathy' ? 'selected' : ''} onClick={() => updateSession({ pathway: 'allopathy' })}>
              Allopathy<span>Modern clinical care</span>
            </button>
            <button type="button" className={sessionData.pathway === 'ayurveda' ? 'selected' : ''} onClick={() => updateSession({ pathway: 'ayurveda' })}>
              Ayurveda<span>Ayurvedic assessment and care</span>
            </button>
          </div>

          <div className="info-strip"><MapPin size={20} /><span>Patient ID will be generated by the backend and printed on the token. Keep it for future visits.</span></div>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn wide" disabled={!newValid} onClick={continueNew}><ArrowRight size={18} /> Continue</button>
        </>
      )}

      {isOld && error && <div className="error-box">{error}</div>}
    </section>
  );
}
