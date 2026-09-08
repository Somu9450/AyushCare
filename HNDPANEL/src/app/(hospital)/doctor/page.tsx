'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { doctorService } from '../../../services/doctor.service';
import { ConsultationQueueItem, ClinicalSummary, UploadedDocument } from '../../../types/api';
import { Patient } from '../../../types/clinical';
import { mapQueueItemToPatient } from '../../../lib/adapters';
import { subscribeToQueueEvents } from '../../../lib/socket';
import { TopNavbar } from '../../../components/TopNavbar';
import { QueueSidebar } from '../../../components/QueueSidebar';
import { ClinicalWorkspace } from '../../../components/ClinicalWorkspace';
import { EvidenceDrawer } from '../../../components/EvidenceDrawer';
import { Stethoscope, AlertCircle, RefreshCw } from 'lucide-react';

export default function DoctorWorkspacePage() {
  const [rawQueue, setRawQueue] = useState<ConsultationQueueItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);

  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<ClinicalSummary | null>(null);
  const [activeReports, setActiveReports] = useState<UploadedDocument[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Responsive Drawer States
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(true);
  const [isQueueSidebarOpen, setIsQueueSidebarOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);

  // 1. Fetch initial queue from backend
  const fetchQueue = useCallback(async (selectFirst = true) => {
    setLoadingQueue(true);
    setQueueError(null);
    try {
      const queueItems = await doctorService.getQueue();
      const validItems = Array.isArray(queueItems) ? queueItems : [];
      setRawQueue(validItems);

      if (validItems.length > 0) {
        setSelectedConsultationId((prev) => {
          if (prev && validItems.some((item) => item.id === prev)) {
            return prev;
          }
          return selectFirst ? validItems[0].id : null;
        });
      } else {
        setSelectedConsultationId(null);
        setPatients([]);
      }
    } catch (err: any) {
      setQueueError(err.message || 'Failed to load OPD queue. Please check server connectivity.');
      setRawQueue([]);
      setPatients([]);
      setSelectedConsultationId(null);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(true);

    // 2. Real-time socket updates for queue arrival & triage red flags
    const unsubscribe = subscribeToQueueEvents(
      () => fetchQueue(false),
      () => fetchQueue(false),
      () => fetchQueue(false),
      () => fetchQueue(false)
    );

    return () => unsubscribe();
  }, [fetchQueue]);

  // 3. Load active patient clinical summary and reports whenever selected ID changes
  useEffect(() => {
    if (!selectedConsultationId) {
      setActiveSummary(null);
      setActiveReports([]);
      return;
    }

    let isMounted = true;
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const [summary, reports] = await Promise.all([
          doctorService.getPatientSummary(selectedConsultationId).catch(() => null),
          doctorService.getPatientReports(selectedConsultationId).catch(() => []),
        ]);

        if (isMounted) {
          setActiveSummary(summary);
          setActiveReports(Array.isArray(reports) ? reports : []);
        }
      } catch {
        if (isMounted) {
          setActiveSummary(null);
          setActiveReports([]);
        }
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedConsultationId]);

  // 4. Map raw queue items to frontend Patient UI models
  useEffect(() => {
    if (rawQueue.length > 0) {
      const mapped = rawQueue.map((item) =>
        item.id === selectedConsultationId
          ? mapQueueItemToPatient(item, activeSummary, activeReports)
          : mapQueueItemToPatient(item)
      );
      setPatients(mapped);
    } else {
      setPatients([]);
    }
  }, [rawQueue, selectedConsultationId, activeSummary, activeReports]);

  // Active selected patient
  const selectedPatient = useMemo(() => {
    if (!selectedConsultationId || patients.length === 0) return null;
    return patients.find((p) => p.id === selectedConsultationId) || patients[0] || null;
  }, [patients, selectedConsultationId]);

  // Update patient status & clinical notes in backend
  const handleUpdatePatient = async (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      await doctorService.updateConsultationStatus(updated.id, 'in_queue');
    } catch {
      // Retain optimistic local state
    }
  };

  // Sign off & confirm consultation
  const handleConfirmContinue = async () => {
    if (!selectedConsultationId) return;

    try {
      const remarksText = selectedPatient?.prescriptions?.length
        ? `Prescribed: ${selectedPatient.prescriptions.map((p) => `${p.drugName} (${p.dosage}, ${p.frequency})`).join('; ')}`
        : 'Consultation completed and prescription sign-off verified.';

      await doctorService.signOffConsultation(selectedConsultationId, remarksText);
    } catch {
      // Local state fallback
    }

    // Refresh queue from server to remove completed token
    await fetchQueue(true);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafc] flex flex-col font-sans text-slate-900 antialiased select-none">
      {/* 1. Top Navbar with Responsive Drawer Toggles */}
      <TopNavbar
        onToggleQueue={() => setIsQueueSidebarOpen((prev) => !prev)}
        onToggleEvidence={() => setIsEvidenceDrawerOpen((prev) => !prev)}
        queueCount={patients.length}
        evidenceCount={selectedPatient?.documents?.length || 0}
        isEvidenceOpen={isEvidenceDrawerOpen}
      />

      {/* Error Notification Banner */}
      {queueError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{queueError}</span>
          </div>
          <button
            onClick={() => fetchQueue(true)}
            className="flex items-center gap-1 font-semibold text-red-800 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Main 3-Column Split Workspace with Responsive Drawers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Live OPD Queue (Docked on lg, Drawer on tablet/mobile) */}
        <QueueSidebar
          patients={patients}
          selectedPatientId={selectedConsultationId || ''}
          onSelectPatient={setSelectedConsultationId}
          isLoading={loadingQueue}
          isOpenMobile={isQueueSidebarOpen}
          onCloseMobile={() => setIsQueueSidebarOpen(false)}
        />

        {/* Middle Column: Clinical Workspace */}
        {loadingDetails ? (
          <div className="flex-1 bg-[#f8fafc] flex flex-col items-center justify-center text-xs text-slate-400 gap-3">
            <span className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#054444] border-t-transparent" />
            <span>Loading patient clinical summary & EHR records...</span>
          </div>
        ) : selectedPatient ? (
          <ClinicalWorkspace
            patient={selectedPatient}
            onUpdatePatient={handleUpdatePatient}
            onConfirmContinue={handleConfirmContinue}
            onToggleEvidence={() => setIsEvidenceDrawerOpen((prev) => !prev)}
            isEvidenceOpen={isEvidenceDrawerOpen}
          />
        ) : (
          <div className="flex-1 bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Stethoscope className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Active Consultation Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Select an OPD token from the queue to inspect patient chief complaint, AI history draft, and medical investigations.
            </p>
          </div>
        )}

        {/* Right Column: Collapsible Evidence Drawer (Docked rail/drawer on lg, slide-out drawer on tablet/mobile) */}
        {selectedPatient && (
          <EvidenceDrawer
            patient={selectedPatient}
            isOpen={isEvidenceDrawerOpen}
            onToggle={() => setIsEvidenceDrawerOpen((prev) => !prev)}
            onClose={() => setIsEvidenceDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
