'use client';

import React, { useState } from 'react';
import { Patient, PrescriptionItem } from '../types/clinical';
import {
  CheckCircle2,
  AlertTriangle,
  Bot,
  Save,
  Check,
  Plus,
  Trash2,
  FlaskConical,
  Lightbulb,
  X,
  FileText,
} from 'lucide-react';

interface ClinicalWorkspaceProps {
  patient: Patient;
  onUpdatePatient: (updated: Patient) => void;
  onConfirmContinue: () => void;
  onToggleEvidence?: () => void;
  isEvidenceOpen?: boolean;
}

export const ClinicalWorkspace: React.FC<ClinicalWorkspaceProps> = ({
  patient,
  onUpdatePatient,
  onConfirmContinue,
  onToggleEvidence,
  isEvidenceOpen = false,
}) => {
  const [activeTab, setActiveTab] = useState<'Summary' | 'History' | 'Labs' | 'Prescription'>('Summary');
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Editable local state for summary/SOCRATES
  const [editedChiefComplaint, setEditedChiefComplaint] = useState(patient.chiefComplaint);
  const [editedSocrates, setEditedSocrates] = useState(patient.socrates);

  // Modal State for adding prescription
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('500 mg');
  const [newRxFreq, setNewRxFreq] = useState('1-0-1');
  const [newRxDuration, setNewRxDuration] = useState('5 Days');
  const [newRxInstructions, setNewRxInstructions] = useState('Take after food');

  // Sync state if active patient changes
  React.useEffect(() => {
    setEditedChiefComplaint(patient.chiefComplaint);
    setEditedSocrates(patient.socrates);
    setIsEditing(false);
  }, [patient.id]);

  const handleSaveSummary = () => {
    const updatedPatient: Patient = {
      ...patient,
      chiefComplaint: editedChiefComplaint,
      socrates: editedSocrates,
    };
    onUpdatePatient(updatedPatient);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const updateSocratesField = (key: keyof Patient['socrates'], val: string) => {
    setEditedSocrates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: val,
      },
    }));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxName.trim()) return;

    const newRx: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      drugName: newRxName.trim(),
      dosage: newRxDosage,
      frequency: newRxFreq,
      duration: newRxDuration,
      instructions: newRxInstructions,
    };

    onUpdatePatient({
      ...patient,
      prescriptions: [...patient.prescriptions, newRx],
    });

    setNewRxName('');
    setIsRxModalOpen(false);
  };

  // Helper function to render confidence dot
  const renderConfidenceDot = (confidence: 'High' | 'Verify' | 'Critical') => {
    if (confidence === 'High') {
      return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" title="High Confidence" />;
    }
    if (confidence === 'Verify') {
      return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" title="Requires Verification" />;
    }
    return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" title="Critical Review" />;
  };

  // Lab status pill styling
  const getLabStatusBadge = (status: 'High' | 'Normal' | 'Critical' | 'Low') => {
    switch (status) {
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Critical':
        return 'bg-red-50 text-red-800 border-red-200 font-semibold';
      case 'Low':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Normal':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto p-3 sm:p-4 md:p-5 select-none relative">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="absolute top-3 right-4 sm:right-5 z-50 bg-[#054444] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 text-xs border border-teal-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Clinical changes saved successfully to patient chart.</span>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {/* Avatar Container */}
          <div className="w-10 h-10 rounded-full bg-[#064e4b] text-white font-bold text-sm flex items-center justify-center border border-teal-700 shrink-0 shadow-2xs">
            {patient.initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">{patient.name}</h2>
              <span className="text-xs font-medium text-slate-500">
                {patient.age ? `${patient.age}y · ` : ''}{patient.gender}
              </span>
              {patient.abhaLinked && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e0f2fe] text-[#0369a1] border border-sky-200/80">
                  ABHA Linked <Check className="w-3 h-3 text-[#0369a1] ml-0.5" />
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5 flex-wrap gap-y-0.5">
              <span>Token <strong className="text-slate-700 font-semibold">{patient.tokenNumber}</strong></span>
              <span>·</span>
              <span>UHID: <strong className="text-slate-700 font-medium">{patient.uhid}</strong></span>
              <span>·</span>
              <span><strong className="text-slate-700 font-medium">{patient.department}</strong></span>
            </div>
          </div>
        </div>

        {/* Priority Badge & Responsive Reports Toggle */}
        <div className="flex items-center space-x-2 self-start md:self-center flex-wrap gap-y-1">
          {onToggleEvidence && (
            <button
              onClick={onToggleEvidence}
              className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#054444] rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isEvidenceOpen ? 'Hide Reports' : `Reports (${patient.documents.length})`}</span>
            </button>
          )}

          {patient.priority === 'Urgent' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5" />
              Urgent
            </span>
          )}
          {patient.priority === 'Waiting' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Waiting
            </span>
          )}
          {patient.priority === 'History Ready' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              History Ready
            </span>
          )}
          {patient.priority === 'Completed' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Priority Review Alert Banner */}
      {(patient.alertMessage || patient.priority === 'Urgent') && (
        <div className="bg-[#fef2f2] border border-red-200 text-[#991b1b] rounded-lg p-3 my-2.5 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold tracking-wide text-red-900 uppercase">PRIORITY REVIEW</span> -{' '}
            <span>{patient.alertMessage || `${patient.chiefComplaint} — priority clinical review recommended.`}</span>
            <p className="text-[11px] text-red-700/80 mt-0.5">
              AI-flagged triage indicator · Physician verification required · Not a definitive diagnosis
            </p>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-4 sm:space-x-6 border-b border-slate-200/90 my-2 px-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'Summary', label: 'Clinical Summary' },
          { id: 'History', label: 'Medical History' },
          { id: 'Labs', label: 'Lab Results' },
          { id: 'Prescription', label: 'Prescription' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'border-b-2 border-[#064e4b] text-[#064e4b] font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: CLINICAL SUMMARY */}
      {activeTab === 'Summary' && (
        <div className="space-y-3.5 my-1">
          {/* AI Draft Notice Bar */}
          <div className="bg-[#ecfdf5] border border-emerald-200 text-[#065f46] text-xs px-3 py-1.5 rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-[#065f46] shrink-0" />
              <span className="font-medium text-xs">
                AI-generated draft — Physician verification required
              </span>
            </div>
            {isEditing ? (
              <button
                onClick={handleSaveSummary}
                className="text-[#064e4b] hover:underline font-semibold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#064e4b] hover:underline font-semibold text-xs cursor-pointer"
              >
                Edit All
              </button>
            )}
          </div>

          {/* Chief Complaint Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">
                Chief Complaint
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#064e4b] hover:underline font-semibold text-xs cursor-pointer"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedChiefComplaint}
                  onChange={(e) => setEditedChiefComplaint(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 p-2 bg-[#f8fafc] border border-slate-300 rounded focus:ring-1 focus:ring-[#064e4b]"
                />
              ) : (
                <p className="text-xs font-medium text-slate-800">{patient.chiefComplaint}</p>
              )}

              {!isEditing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  High Confidence
                </span>
              )}
            </div>
          </div>

          {/* History of Present Illness · SOCRATES Framework Grid */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900">
                History of Present Illness · SOCRATES
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#064e4b] hover:underline font-semibold text-xs cursor-pointer"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Site */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">SITE</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.site.value}
                      onChange={(e) => updateSocratesField('site', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.site.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.site.confidence)}</div>
              </div>

              {/* Onset */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">ONSET</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.onset.value}
                      onChange={(e) => updateSocratesField('onset', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.onset.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.onset.confidence)}</div>
              </div>

              {/* Character */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">CHARACTER</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.character.value}
                      onChange={(e) => updateSocratesField('character', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.character.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.character.confidence)}</div>
              </div>

              {/* Radiation */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">RADIATION</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.radiation.value}
                      onChange={(e) => updateSocratesField('radiation', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.radiation.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.radiation.confidence)}</div>
              </div>

              {/* Associated */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">ASSOCIATED</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.associated.value}
                      onChange={(e) => updateSocratesField('associated', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.associated.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.associated.confidence)}</div>
              </div>

              {/* Timing */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">TIMING</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.timing.value}
                      onChange={(e) => updateSocratesField('timing', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.timing.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.timing.confidence)}</div>
              </div>

              {/* Aggravating */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">AGGRAVATING</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.aggravating.value}
                      onChange={(e) => updateSocratesField('aggravating', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.aggravating.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.aggravating.confidence)}</div>
              </div>

              {/* Relieving */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">RELIEVING</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.relieving.value}
                      onChange={(e) => updateSocratesField('relieving', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.relieving.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.relieving.confidence)}</div>
              </div>

              {/* Severity */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">SEVERITY</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSocrates.severity.value}
                      onChange={(e) => updateSocratesField('severity', e.target.value)}
                      className="text-xs font-semibold text-slate-900 bg-white border px-1.5 py-0.5 rounded w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-900">{patient.socrates.severity.value}</span>
                  )}
                </div>
                <div>{renderConfidenceDot(patient.socrates.severity.confidence)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MEDICAL HISTORY */}
      {activeTab === 'History' && (
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-4 my-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Patient Medical History & Conditions
          </h3>
          {patient.medicalHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No previous chronic medical history or allergies recorded for this patient.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Condition / Event</th>
                    <th className="p-2.5">Diagnosis Year</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {patient.medicalHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-medium text-slate-500">{item.category}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{item.condition}</td>
                      <td className="p-2.5">{item.since}</td>
                      <td className="p-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.status === 'Active'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : item.status === 'Chronic'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{item.notes || 'Recorded in patient profile'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: LAB RESULTS */}
      {activeTab === 'Labs' && (
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3 my-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <FlaskConical className="w-4 h-4 text-[#064e4b]" />
              <span>Laboratory & Diagnostic Panel</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Last updated: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Current Visit'}
            </span>
          </div>

          {patient.labs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No laboratory or diagnostic panel investigations recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-2.5">Investigation</th>
                    <th className="p-2.5">Result</th>
                    <th className="p-2.5">Reference Range</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.labs.map((lab, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-semibold text-slate-900">{lab.investigation}</td>
                      <td className="p-2.5 font-bold text-slate-800">{lab.result}</td>
                      <td className="p-2.5 text-slate-500">{lab.reference}</td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getLabStatusBadge(
                            lab.status
                          )}`}
                        >
                          {lab.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{lab.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: PRESCRIPTION */}
      {activeTab === 'Prescription' && (
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-4 my-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Doctor e-Prescription (Rx) Order Sheet
            </h3>
            <button
              onClick={() => setIsRxModalOpen(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#054444] hover:bg-[#064e4b] text-white text-xs rounded-md font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>

          {patient.prescriptions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No medications prescribed yet. Click &apos;Add Medication&apos; to add a prescription.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-2.5">Medication Name</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Instructions</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-bold text-[#064e4b]">{rx.drugName}</td>
                      <td className="p-2.5 font-medium">{rx.dosage}</td>
                      <td className="p-2.5">{rx.frequency}</td>
                      <td className="p-2.5">{rx.duration}</td>
                      <td className="p-2.5 text-slate-600">{rx.instructions}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            const filtered = patient.prescriptions.filter((p) => p.id !== rx.id);
                            onUpdatePatient({ ...patient, prescriptions: filtered });
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confidence Legend Box */}
      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-600 flex items-center flex-wrap gap-x-3 gap-y-1 mt-4 mb-3">
        <div className="flex items-center space-x-1 font-semibold text-slate-700">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Confidence Key:</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span><strong className="font-semibold text-slate-800">High</strong> — extracted clearly.</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span><strong className="font-semibold text-slate-800">Verify</strong> — patient description was vague.</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span><strong className="font-semibold text-slate-800">Critical</strong> — requires immediate clinical attention.</span>
        </div>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="sticky bottom-0 bg-[#f8fafc] pt-1 pb-1 mt-auto">
        <div className="flex items-center space-x-3 bg-white p-2 border-t border-slate-200/80 rounded-lg">
          <button
            onClick={handleSaveSummary}
            className="flex-1 py-2.5 bg-[#054444] hover:bg-[#064e4b] text-white font-semibold text-xs rounded-lg shadow-2xs transition-all text-center cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={onConfirmContinue}
            className="flex-1 py-2.5 border border-[#054444] text-[#054444] hover:bg-teal-50/50 font-semibold text-xs rounded-lg shadow-2xs transition-all text-center cursor-pointer"
          >
            Confirm & Continue
          </button>
        </div>
      </div>

      {/* Modal for Adding Medication dynamically */}
      {isRxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-sm font-bold text-slate-900">Add e-Prescription Medication</h4>
              <button
                onClick={() => setIsRxModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tab. Paracetamol / Syp. Amoxicillin"
                  value={newRxName}
                  onChange={(e) => setNewRxName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={newRxDosage}
                    onChange={(e) => setNewRxDosage(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Frequency</label>
                  <select
                    value={newRxFreq}
                    onChange={(e) => setNewRxFreq(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                  >
                    <option value="1-0-1">1-0-1 (Twice Daily)</option>
                    <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                    <option value="1-0-0">1-0-0 (Morning)</option>
                    <option value="0-0-1">0-0-1 (Bedtime)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={newRxDuration}
                    onChange={(e) => setNewRxDuration(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Instructions</label>
                  <input
                    type="text"
                    value={newRxInstructions}
                    onChange={(e) => setNewRxInstructions(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#054444]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRxModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#054444] hover:bg-[#064e4b] text-white rounded-lg font-medium shadow-2xs cursor-pointer"
                >
                  Add to Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
