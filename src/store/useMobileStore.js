import { create } from "zustand";
import {
  mockSession,
  mockExtractedData,
  mockTimeline,
  mockHealthSummary,
  mockDefaultDocument,
  mockMedicalRecords,
  mockPrivacyData,
} from "../data/mockData.js";
import { analyzeDocumentOCR } from "../services/documentService.js";
import { sendSummaryToDoctor } from "../services/summaryService.js";

export const SCREENS = {
  AUTH: "AUTH", // Patient Authentication (ABHA / Aadhaar / Mobile OTP)
  M1: "M1", // Active Session / Mobile Home
  VISITS: "VISITS", // My Healthcare Visits History (Allopathy / AYUSH)
  VISIT_DETAILS: "VISIT_DETAILS", // Single Encounter Details
  APPOINTMENTS: "APPOINTMENTS", // Consultations & Appointments (Upcoming, Past, Details)
  RECORDS: "RECORDS", // Medical Records Home & Document Repository
  DOCUMENT_DETAILS: "DOCUMENT_DETAILS", // Document Details & Extracted Info
  MORE: "MORE", // ABHA Card, Profile, Settings & Logout
  PRIVACY: "PRIVACY", // Privacy & Data Control (Prompt 4)
  CONSENT_DETAILS: "CONSENT_DETAILS", // Consent Details & Revocation (Prompt 4)
  KIOSK_CONNECT: "KIOSK_CONNECT", // Scan Kiosk QR / Demo Auto-Connect (Prompt 5)
  KIOSK_SESSION: "KIOSK_SESSION", // Active Kiosk Session Details & Disconnect (Prompt 5)
  PROFILE: "PROFILE", // Patient Identity & Demographics with Masked Identifiers (Prompt 5)
  SETTINGS: "SETTINGS", // Settings, Language & Accessibility Preferences (Prompt 5)
  M2: "M2", // Select Document Type
  M3: "M3", // Document Capture
  M4: "M4", // Image Quality Review
  M5: "M5", // Analysing Document
  M6: "M6", // Extracted Information
  M7: "M7", // Medical Timeline
  M8: "M8", // Health Summary
  M9: "M9", // Information Sent (Return to Kiosk)
};

const SCREEN_ORDER = [
  SCREENS.AUTH,
  SCREENS.M1,
  SCREENS.VISITS,
  SCREENS.VISIT_DETAILS,
  SCREENS.APPOINTMENTS,
  SCREENS.RECORDS,
  SCREENS.DOCUMENT_DETAILS,
  SCREENS.MORE,
  SCREENS.PRIVACY,
  SCREENS.CONSENT_DETAILS,
  SCREENS.KIOSK_CONNECT,
  SCREENS.KIOSK_SESSION,
  SCREENS.PROFILE,
  SCREENS.SETTINGS,
  SCREENS.M2,
  SCREENS.M3,
  SCREENS.M4,
  SCREENS.M5,
  SCREENS.M6,
  SCREENS.M7,
  SCREENS.M8,
  SCREENS.M9,
];

export const useMobileStore = create((set, get) => ({
  /* -------------------------------------------------------------------------- */
  /* SCREEN NAVIGATION                                                          */
  /* -------------------------------------------------------------------------- */
  currentScreen: SCREENS.AUTH,
  screenHistory: [SCREENS.AUTH],
  isAuthenticated: false,
  activeNavTab: "home",

  setActiveNavTab: (tab) => set({ activeNavTab: tab }),

  selectedAppointment: null,
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),

  /* Healthcare Visits State */
  selectedVisit: null,
  setSelectedVisit: (visit) => set({ selectedVisit: visit }),
  visitFilter: "ALL", // "ALL" | "ALLOPATHY" | "AYUSH"
  setVisitFilter: (filter) => set({ visitFilter: filter }),

  /* Medical Records State (Prompt 3) */
  medicalRecords: [...mockMedicalRecords],
  selectedMedicalRecord: null,
  setSelectedMedicalRecord: (doc) => set({ selectedMedicalRecord: doc }),
  selectedRecordCategory: "ALL", // "ALL" | "prescription" | "lab_report" | "discharge_summary" | "other"
  setSelectedRecordCategory: (cat) => set({ selectedRecordCategory: cat }),

  addMedicalRecord: (newRecord) =>
    set((state) => ({
      medicalRecords: [newRecord, ...state.medicalRecords],
    })),

  updateMedicalRecord: (id, updatedFields) =>
    set((state) => ({
      medicalRecords: state.medicalRecords.map((r) =>
        r.id === id ? { ...r, ...updatedFields } : r
      ),
    })),

  updateRecordExtraction: (docId, updatedEntity) => {
    set((state) => ({
      medicalRecords: state.medicalRecords.map((doc) => {
        if (doc.id !== docId) return doc;
        if (updatedEntity.type === "medicine") {
          return {
            ...doc,
            extractedInformation: {
              ...doc.extractedInformation,
              medicines: doc.extractedInformation.medicines.map((m) =>
                m.id === updatedEntity.data.id
                  ? { ...m, ...updatedEntity.data, needsVerification: false }
                  : m
              ),
            },
          };
        } else if (updatedEntity.type === "diagnosis") {
          return {
            ...doc,
            extractedInformation: {
              ...doc.extractedInformation,
              diagnosis: doc.extractedInformation.diagnosis.map((d) =>
                d.id === updatedEntity.data.id || d.value === updatedEntity.data.oldValue
                  ? { ...d, value: updatedEntity.data.value, needsVerification: false }
                  : d
              ),
            },
          };
        }
        return doc;
      }),
    }));
  },

  setVerifiedPatient: (patient) => {
    set((state) => ({
      isAuthenticated: true,
      activeNavTab: "home",
      session: {
        ...state.session,
        patient: {
          ...state.session.patient,
          ...patient,
        },
      },
    }));
  },

  setScreen: (screen) => {
    if (!SCREEN_ORDER.includes(screen)) return;
    set((state) => ({
      currentScreen: screen,
      screenHistory: [...state.screenHistory, screen],
    }));
  },

  nextScreen: () => {
    const { currentScreen } = get();
    const currentIndex = SCREEN_ORDER.indexOf(currentScreen);
    if (currentIndex < SCREEN_ORDER.length - 1) {
      const next = SCREEN_ORDER[currentIndex + 1];
      set((state) => ({
        currentScreen: next,
        screenHistory: [...state.screenHistory, next],
      }));
    }
  },

  prevScreen: () => {
    const { currentScreen, screenHistory } = get();
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const prev = newHistory[newHistory.length - 1];
      set({
        currentScreen: prev,
        screenHistory: newHistory,
      });
    } else {
      const currentIndex = SCREEN_ORDER.indexOf(currentScreen);
      if (currentIndex > 0) {
        set({
          currentScreen: SCREEN_ORDER[currentIndex - 1],
          screenHistory: [SCREEN_ORDER[currentIndex - 1]],
        });
      }
    }
  },

  /* -------------------------------------------------------------------------- */
  /* SESSION STATE                                                              */
  /* -------------------------------------------------------------------------- */
  session: { ...mockSession },
  timerSecondsRemaining: 300, // 05:00
  isSessionExpired: false,

  decrementTimer: () => {
    set((state) => {
      if (state.timerSecondsRemaining <= 1) {
        return {
          timerSecondsRemaining: 0,
          isSessionExpired: true,
        };
      }
      return {
        timerSecondsRemaining: state.timerSecondsRemaining - 1,
      };
    });
  },

  /* -------------------------------------------------------------------------- */
  /* DOCUMENT SELECTION, CAPTURE & SET CLUSTERING                               */
  /* -------------------------------------------------------------------------- */
  selectedDocumentType: "prescription",
  capturedDocument: { ...mockDefaultDocument },
  capturedDocuments: [{ ...mockDefaultDocument }],

  // Document Sets / Clusters: group pages into sets (e.g., Blood Report - 3 pages, CT Scan - 4 pages)
  documentSets: [
    {
      id: "set_default",
      title: "Prescription / OPD Slip",
      type: "prescription",
      pages: [{ ...mockDefaultDocument, id: "page_init_01", pageNumber: 1, parentSetId: "set_default", parentSetTitle: "Prescription / OPD Slip" }],
    },
  ],
  activeSetId: "set_default",
  retargetPageForRetake: null, // { setId, pageId, pageIndex, pageTitle }

  setActiveSetId: (id) => set({ activeSetId: id }),
  setRetargetPageForRetake: (target) => set({ retargetPageForRetake: target }),

  createDocumentSet: (title = "New Document Report", type = "lab_report") => {
    const newId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newSet = {
      id: newId,
      title,
      type,
      pages: [],
    };
    set((state) => ({
      documentSets: [...state.documentSets, newSet],
      activeSetId: newId,
    }));
    return newId;
  },

  deleteDocumentSet: (setId) => {
    set((state) => {
      if (state.documentSets.length <= 1) {
        const resetSet = {
          id: "set_default",
          title: "Prescription / OPD Slip",
          type: "prescription",
          pages: [],
        };
        return {
          documentSets: [resetSet],
          activeSetId: "set_default",
          capturedDocuments: [],
          capturedDocument: { ...mockDefaultDocument },
        };
      }
      const remaining = state.documentSets.filter((s) => s.id !== setId);
      const allPages = remaining.flatMap((s) => s.pages);
      return {
        documentSets: remaining,
        activeSetId: remaining[0]?.id || "set_default",
        capturedDocuments: allPages,
        capturedDocument: allPages[0] || { ...mockDefaultDocument },
      };
    });
  },

  updateDocumentSetTitle: (setId, newTitle, newType) => {
    set((state) => ({
      documentSets: state.documentSets.map((s) =>
        s.id === setId
          ? {
              ...s,
              title: newTitle || s.title,
              type: newType || s.type,
              pages: s.pages.map((p) => ({ ...p, parentSetTitle: newTitle || s.title })),
            }
          : s
      ),
    }));
  },

  addPageToSet: (setId, pageData) => {
    set((state) => {
      const targetSetId = setId || state.activeSetId || state.documentSets[0]?.id;
      const updatedSets = state.documentSets.map((s) => {
        if (s.id !== targetSetId) return s;
        const pageNumber = s.pages.length + 1;
        const formattedPage = {
          ...mockDefaultDocument,
          ...pageData,
          id: pageData.id || `page_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          pageNumber,
          parentSetId: s.id,
          parentSetTitle: s.title,
          documentType: s.type || state.selectedDocumentType || "prescription",
        };
        return {
          ...s,
          pages: [...s.pages, formattedPage],
        };
      });
      const allPages = updatedSets.flatMap((s) => s.pages);
      return {
        documentSets: updatedSets,
        capturedDocuments: allPages,
        capturedDocument: allPages[0] || { ...mockDefaultDocument },
      };
    });
  },

  replacePageInSet: (setId, pageId, newPageData) => {
    set((state) => {
      const updatedSets = state.documentSets.map((s) => {
        if (s.id !== setId) return s;
        return {
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId
              ? {
                  ...p,
                  ...newPageData,
                  id: p.id,
                  pageNumber: p.pageNumber,
                  parentSetId: s.id,
                  parentSetTitle: s.title,
                }
              : p
          ),
        };
      });
      const allPages = updatedSets.flatMap((s) => s.pages);
      return {
        documentSets: updatedSets,
        capturedDocuments: allPages,
        capturedDocument: allPages[0] || { ...mockDefaultDocument },
        retargetPageForRetake: null, // Clear retarget state
      };
    });
  },

  removePageFromSet: (setId, pageId) => {
    set((state) => {
      const updatedSets = state.documentSets.map((s) => {
        if (s.id !== setId) return s;
        const remainingPages = s.pages
          .filter((p) => p.id !== pageId)
          .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
        return {
          ...s,
          pages: remainingPages,
        };
      });
      const allPages = updatedSets.flatMap((s) => s.pages);
      return {
        documentSets: updatedSets,
        capturedDocuments: allPages,
        capturedDocument: allPages[0] || { ...mockDefaultDocument },
      };
    });
  },

  movePageBetweenSets: (fromSetId, toSetId, pageId) => {
    set((state) => {
      const fromSet = state.documentSets.find((s) => s.id === fromSetId);
      const targetPage = fromSet?.pages.find((p) => p.id === pageId);
      if (!targetPage) return state;

      const updatedSets = state.documentSets.map((s) => {
        if (s.id === fromSetId) {
          return {
            ...s,
            pages: s.pages
              .filter((p) => p.id !== pageId)
              .map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
          };
        }
        if (s.id === toSetId) {
          const newPage = {
            ...targetPage,
            pageNumber: s.pages.length + 1,
            parentSetId: s.id,
            parentSetTitle: s.title,
          };
          return {
            ...s,
            pages: [...s.pages, newPage],
          };
        }
        return s;
      });
      const allPages = updatedSets.flatMap((s) => s.pages);
      return {
        documentSets: updatedSets,
        capturedDocuments: allPages,
        capturedDocument: allPages[0] || { ...mockDefaultDocument },
      };
    });
  },
  
  setSelectedDocumentType: (typeId) => {
    set({ selectedDocumentType: typeId });
  },

  setCapturedDocument: (doc) => {
    const formatted = {
      ...mockDefaultDocument,
      ...doc,
      documentType: get().selectedDocumentType || "prescription",
    };
    set({
      capturedDocument: formatted,
      capturedDocuments: [formatted],
    });
  },

  setCapturedDocuments: (docs) => {
    if (!docs || docs.length === 0) {
      set({
        capturedDocuments: [],
        capturedDocument: { ...mockDefaultDocument },
      });
      return;
    }
    const formattedList = docs.map((doc, idx) => ({
      ...mockDefaultDocument,
      ...doc,
      id: doc.id || `doc_${Date.now()}_${idx}`,
      documentType: get().selectedDocumentType || "prescription",
    }));
    set({
      capturedDocuments: formattedList,
      capturedDocument: formattedList[0],
    });
  },

  addCapturedDocument: (doc) => {
    const formatted = {
      ...mockDefaultDocument,
      ...doc,
      id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      documentType: get().selectedDocumentType || "prescription",
    };
    set((state) => ({
      capturedDocuments: [...state.capturedDocuments, formatted],
      capturedDocument: formatted,
    }));
  },

  removeCapturedDocument: (id) => {
    set((state) => {
      const remaining = state.capturedDocuments.filter((d) => d.id !== id);
      return {
        capturedDocuments: remaining,
        capturedDocument: remaining[0] || { ...mockDefaultDocument },
      };
    });
  },

  clearCapturedDocuments: () => {
    set({
      capturedDocuments: [],
      capturedDocument: { ...mockDefaultDocument },
      documentSets: [
        {
          id: "set_default",
          title: "Prescription / OPD Slip",
          type: "prescription",
          pages: [],
        },
      ],
      activeSetId: "set_default",
      retargetPageForRetake: null,
    });
  },

  /* -------------------------------------------------------------------------- */
  /* DOCUMENT ANALYSIS (M5 SIMULATION)                                          */
  /* -------------------------------------------------------------------------- */
  isAnalyzing: false,
  analysisStep: 0, // 0 to 4

  setAnalysisStep: (step) => {
    set({ analysisStep: step });
  },

  runAnalysisSimulation: async (onComplete) => {
    set({ isAnalyzing: true, analysisStep: 0 });
    
    // Call service layer simulation
    await analyzeDocumentOCR(get().capturedDocument.id, (currentStep) => {
      set({ analysisStep: currentStep });
    });

    set({ isAnalyzing: false });
    if (onComplete) {
      onComplete();
    }
  },

  /* -------------------------------------------------------------------------- */
  /* EXTRACTED INFORMATION (M6)                                                 */
  /* -------------------------------------------------------------------------- */
  extractedData: JSON.parse(JSON.stringify(mockExtractedData)),

  updateMedicine: (id, updatedFields) => {
    set((state) => ({
      extractedData: {
        ...state.extractedData,
        medicines: state.extractedData.medicines.map((med) =>
          med.id === id ? { ...med, ...updatedFields, needsVerification: false } : med
        ),
      },
    }));
  },

  updateDiagnosis: (updatedDiagnosis) => {
    set((state) => ({
      extractedData: {
        ...state.extractedData,
        diagnosis: {
          ...state.extractedData.diagnosis,
          ...updatedDiagnosis,
          needsVerification: false,
        },
      },
    }));
  },

  confirmExtractedInformation: () => {
    const state = get();
    // Mark all as verified
    const verifiedMedicines = state.extractedData.medicines.map((m) => ({
      ...m,
      needsVerification: false,
      confidence: "HIGH",
    }));
    const verifiedDiagnosis = {
      ...state.extractedData.diagnosis,
      needsVerification: false,
      confidence: "HIGH",
    };

    // Auto-create persistent medical record entries for all captured document sets
    const setsWithPages = (state.documentSets || []).filter((s) => s.pages && s.pages.length > 0);
    let newRecords = [];

    if (setsWithPages.length > 0) {
      setsWithPages.forEach((docSet) => {
        const setPages = docSet.pages;
        const setRecords = setPages.map((doc, idx) => {
          const newDocId = `DOC-${Date.now().toString().slice(-4)}-${docSet.id.slice(-4)}-${idx + 1}`;
          const pageSuffix = setPages.length > 1 ? ` (Page ${idx + 1} of ${setPages.length})` : "";
          const typeLabel =
            docSet.type === "lab_report"
              ? "Lab Report"
              : docSet.type === "discharge_summary"
              ? "Discharge Summary"
              : docSet.type === "other"
              ? "Other Medical Record"
              : "Prescription";

          return {
            id: newDocId,
            type: docSet.type || state.selectedDocumentType || "prescription",
            typeLabel,
            title: `${docSet.title}${pageSuffix}.pdf`,
            date: new Date().toISOString().split("T")[0],
            displayDate: doc.date || "Today",
            monthGroup: "RECENT",
            source: doc.clinic || "Civil Hospital OPD",
            doctor: doc.doctor || "Consulting Physician",
            clinic: doc.clinic || "OPD Desk",
            status: "CONFIRMED",
            statusLabel: "Confirmed",
            visitId: "VISIT-001",
            sessionId: state.session.sessionId,
            fileSize: doc.fileSize || "1.4 MB",
            dataUrl: doc.dataUrl,
            pageNumber: idx + 1,
            totalPages: setPages.length,
            documentSetName: docSet.title,
            extractedInformation: {
              medicines: verifiedMedicines,
              diagnosis: [verifiedDiagnosis],
              prescriptionDate:
                state.extractedData.prescriptionDate || doc.date || "Today",
            },
          };
        });
        newRecords.push(...setRecords);
      });
    } else {
      const docList =
        state.capturedDocuments && state.capturedDocuments.length > 0
          ? state.capturedDocuments
          : [state.capturedDocument];

      newRecords = docList.map((doc, idx) => {
        const newDocId = `DOC-${Date.now().toString().slice(-4)}${docList.length > 1 ? `-${idx + 1}` : ""}`;
        const pageSuffix = docList.length > 1 ? ` (Page ${idx + 1} of ${docList.length})` : "";
        return {
          id: newDocId,
          type: state.selectedDocumentType || "prescription",
          typeLabel:
            state.selectedDocumentType === "lab_report"
              ? "Lab Report"
              : state.selectedDocumentType === "discharge_summary"
              ? "Discharge Summary"
              : state.selectedDocumentType === "other"
              ? "Other Medical Record"
              : "Prescription",
          title: doc.fileName ? `${doc.fileName.replace(/\.[^/.]+$/, "")}${pageSuffix}.pdf` : `Document${pageSuffix}.pdf`,
          date: new Date().toISOString().split("T")[0],
          displayDate: doc.date || "Today",
          monthGroup: "RECENT",
          source: doc.clinic || "Civil Hospital OPD",
          doctor: doc.doctor || "Consulting Physician",
          clinic: doc.clinic || "OPD Desk",
          status: "CONFIRMED",
          statusLabel: "Confirmed",
          visitId: "VISIT-001",
          sessionId: state.session.sessionId,
          fileSize: doc.fileSize || "1.4 MB",
          dataUrl: doc.dataUrl,
          pageNumber: idx + 1,
          totalPages: docList.length,
          extractedInformation: {
            medicines: verifiedMedicines,
            diagnosis: [verifiedDiagnosis],
            prescriptionDate:
              state.extractedData.prescriptionDate || doc.date || "Today",
          },
        };
      });
    }

    const primaryRecord = newRecords[0];
    const totalSetsCount = setsWithPages.length;
    const totalPagesCount = newRecords.length;

    // Auto-create medical timeline entry
    const newTimelineEntry = {
      id: `tl_${Date.now()}`,
      year: "2026",
      timeLabel: "TODAY",
      title:
        totalSetsCount > 1
          ? `${totalSetsCount} Document Sets Processed (${totalPagesCount} pages)`
          : `${primaryRecord.typeLabel} processed${totalPagesCount > 1 ? ` (${totalPagesCount} pages)` : ""}`,
      subtitle:
        totalSetsCount > 1
          ? setsWithPages.map((s) => `${s.title} (${s.pages.length}p)`).join(", ")
          : `${primaryRecord.title} · ${verifiedDiagnosis.name || "Medical record"}`,
      source: primaryRecord.typeLabel,
      sourceType: "DOCUMENT",
      badgeColor: "teal",
      isLatest: true,
    };

    set((prev) => ({
      extractedData: {
        ...prev.extractedData,
        medicines: verifiedMedicines,
        diagnosis: verifiedDiagnosis,
      },
      medicalRecords: [...newRecords, ...prev.medicalRecords],
      timeline: [newTimelineEntry, ...prev.timeline],
    }));
  },

  /* -------------------------------------------------------------------------- */
  /* TIMELINE & SUMMARY (M7 & M8)                                              */
  /* -------------------------------------------------------------------------- */
  timeline: [...mockTimeline],
  healthSummary: JSON.parse(JSON.stringify(mockHealthSummary)),
  isHindiSpeechPlaying: false,

  setIsHindiSpeechPlaying: (isPlaying) => {
    set({ isHindiSpeechPlaying: isPlaying });
  },

  /* -------------------------------------------------------------------------- */
  /* MODALS                                                                     */
  /* -------------------------------------------------------------------------- */
  isOriginalDocModalOpen: false,
  setOriginalDocModalOpen: (open) => {
    set({ isOriginalDocModalOpen: open });
  },

  editingEntity: null, // { type: 'medicine' | 'diagnosis', data: ... }
  setEditingEntity: (entity) => {
    set({ editingEntity: entity });
  },

  /* -------------------------------------------------------------------------- */
  /* PRIVACY & DATA CONTROL STATE (Prompt 4)                                    */
  /* -------------------------------------------------------------------------- */
  privacyData: JSON.parse(JSON.stringify(mockPrivacyData)),
  isHealthHistoryLocked: false,
  selectedConsent: null,
  setSelectedConsent: (consent) => set({ selectedConsent: consent }),

  // Set health history access locked state
  setHealthHistoryLocked: (locked) => {
    // TODO: Replace mock privacy state with backend API.
    // TODO: Integrate with ABDM consent/access mechanisms when backend is available.
    set((state) => ({
      isHealthHistoryLocked: locked,
      privacyData: {
        ...state.privacyData,
        healthHistoryAccess: {
          ...state.privacyData.healthHistoryAccess,
          locked,
          updatedAt:
            new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }) +
            `, ${new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
        },
      },
    }));
  },

  toggleHealthHistoryAccess: () => {
    get().setHealthHistoryLocked(!get().isHealthHistoryLocked);
  },

  // Withdraw active consent
  withdrawConsent: (consentId) => {
    // TODO: Fetch active consents from consent service / replace with backend consent API.
    set((state) => {
      const targetConsent = state.privacyData.activeConsents.find((c) => c.id === consentId);
      const nowFormatted =
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ` · ${new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;

      const updatedActiveConsents = state.privacyData.activeConsents.map((c) =>
        c.id === consentId ? { ...c, status: "WITHDRAWN", withdrawnAt: nowFormatted } : c
      );

      const existingInHistory = state.privacyData.consentHistory.find((h) => h.id === consentId);
      let updatedHistory;
      if (existingInHistory) {
        updatedHistory = state.privacyData.consentHistory.map((h) =>
          h.id === consentId ? { ...h, status: "WITHDRAWN", withdrawnAt: nowFormatted } : h
        );
      } else if (targetConsent) {
        updatedHistory = [
          {
            id: targetConsent.id,
            title: targetConsent.title,
            purpose: targetConsent.purpose,
            status: "WITHDRAWN",
            grantedAt: targetConsent.grantedAt,
            withdrawnAt: nowFormatted,
            notes: "Access withdrawn by patient via mobile companion",
          },
          ...state.privacyData.consentHistory,
        ];
      } else {
        updatedHistory = state.privacyData.consentHistory;
      }

      // Add to access history audit trail as a revocation event
      const newAuditEvent = {
        id: `acc-withdrawn-${Date.now()}`,
        organization: "Patient Privacy Control",
        department: "Mobile Companion",
        accessedByRole: "Patient (Self)",
        informationAccessed: targetConsent?.title || "Consent Permissions",
        purpose: "Patient consent withdrawal",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "WITHDRAWN",
        details: `Access permission '${targetConsent?.title || consentId}' was withdrawn by the patient.`,
      };

      return {
        privacyData: {
          ...state.privacyData,
          activeConsents: updatedActiveConsents,
          consentHistory: updatedHistory,
          accessHistory: [newAuditEvent, ...state.privacyData.accessHistory],
        },
        selectedConsent:
          state.selectedConsent?.id === consentId
            ? { ...state.selectedConsent, status: "WITHDRAWN", withdrawnAt: nowFormatted }
            : state.selectedConsent,
      };
    });
  },

  // End active connected healthcare session
  endSession: (sessionId) => {
    // TODO: Replace mock session termination with backend API.
    set((state) => {
      const targetSession = state.privacyData.activeSessions.find((s) => s.id === sessionId);
      const updatedSessions = state.privacyData.activeSessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "ENDED",
              endedAt: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : s
      );

      const newAuditEvent = {
        id: `acc-session-${Date.now()}`,
        organization: targetSession?.name || "Connected Healthcare Device",
        department: "Hospital OPD",
        accessedByRole: "Patient (Self)",
        informationAccessed: "Connected Healthcare Session Token",
        purpose: "Session Disconnection",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "ENDED",
        details: `Connected session '${targetSession?.name || sessionId}' was terminated by patient.`,
      };

      return {
        privacyData: {
          ...state.privacyData,
          activeSessions: updatedSessions,
          accessHistory: [newAuditEvent, ...state.privacyData.accessHistory],
        },
      };
    });
  },

  /* -------------------------------------------------------------------------- */
  /* DOCTOR HANDOFF & RESET (M9)                                                */
  /* -------------------------------------------------------------------------- */
  isSendingToDoctor: false,

  submitToDoctor: async () => {
    set({ isSendingToDoctor: true });
    await sendSummaryToDoctor(get().session.sessionId, {
      extracted: get().extractedData,
      timeline: get().timeline,
    });
    set({ isSendingToDoctor: false, currentScreen: SCREENS.M9 });
  },

  /* -------------------------------------------------------------------------- */
  /* KIOSK ↔ MOBILE COMPANION SESSION STATE (Prompt 5)                          */
  /* -------------------------------------------------------------------------- */
  kioskSession: {
    id: "kiosk-session-001",
    sessionToken: "MK-2026-0905-ABC123",
    kioskName: "Hospital OPD Kiosk",
    terminalId: "KIOSK-DELHI-OPD-03",
    hospitalName: "MediKiosk Demo Hospital",
    department: "General OPD",
    location: "Civil Hospital Waiting Lobby, Ground Floor",
    status: "CONNECTED", // "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "EXPIRED" | "ENDED" | "ERROR"
    startedAt: "05 Sep 2026 · 10:24 AM",
    connectedAt: "05 Sep 2026 · 10:30 AM",
    expiresAt: "05 Sep 2026 · 11:00 AM",
    expiresInSeconds: 1800,
  },

  connectKioskSession: (sessionData, patientData) => {
    // TODO: Connect to real hospital kiosk session service.
    // TODO: Replace mock kiosk session validation with backend API.
    const now = new Date();
    const timeFormatted =
      now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const updatedSession = {
      ...get().kioskSession,
      ...sessionData,
      status: "CONNECTED",
      connectedAt: timeFormatted,
    };

    set((state) => {
      // Sync into activeSessions list for Privacy & Data Control
      const existingIdx = state.privacyData.activeSessions.findIndex(
        (s) => s.id === updatedSession.id || s.name.includes("Hospital Kiosk")
      );
      let newActiveSessions = [...state.privacyData.activeSessions];

      const kioskSessionEntry = {
        id: updatedSession.id,
        name: updatedSession.kioskName,
        purpose: "Patient OPD consultation & self-service",
        startedAt: updatedSession.startedAt || timeFormatted,
        device: `${updatedSession.kioskName} (${updatedSession.terminalId})`,
        location: updatedSession.location,
        status: "ACTIVE",
      };

      if (existingIdx >= 0) {
        newActiveSessions[existingIdx] = kioskSessionEntry;
      } else {
        newActiveSessions = [kioskSessionEntry, ...newActiveSessions];
      }

      // Add audit history
      const newAudit = {
        id: `acc-kiosk-${Date.now()}`,
        organization: updatedSession.hospitalName,
        department: updatedSession.department,
        accessedByRole: "Patient Kiosk QR Auto-Connect",
        informationAccessed: "Session Linkage Token",
        purpose: "Kiosk companion synchronization",
        date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        status: "ALLOWED",
        details: `Linked to ${updatedSession.kioskName} via short-lived QR token.`,
      };

      return {
        isAuthenticated: true, // Path B Auto-login
        kioskSession: updatedSession,
        session: patientData
          ? { ...state.session, patient: { ...state.session.patient, ...patientData } }
          : state.session,
        privacyData: {
          ...state.privacyData,
          activeSessions: newActiveSessions,
          accessHistory: [newAudit, ...state.privacyData.accessHistory],
        },
      };
    });
  },

  disconnectKioskSession: () => {
    // TODO: Connect to real hospital kiosk session service for teardown.
    const currentKiosk = get().kioskSession;
    set((state) => {
      const updatedActiveSessions = state.privacyData.activeSessions.map((s) =>
        s.id === currentKiosk.id || s.name.includes("Hospital Kiosk")
          ? {
              ...s,
              status: "ENDED",
              endedAt: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : s
      );

      return {
        kioskSession: {
          ...state.kioskSession,
          status: "ENDED",
        },
        privacyData: {
          ...state.privacyData,
          activeSessions: updatedActiveSessions,
        },
      };
    });
  },

  setKioskSessionStatus: (status) => {
    set((state) => ({
      kioskSession: {
        ...state.kioskSession,
        status,
      },
    }));
  },

  /* -------------------------------------------------------------------------- */
  /* PATIENT PROFILE MANAGEMENT (Prompt 5)                                      */
  /* -------------------------------------------------------------------------- */
  updatePatientProfile: (updatedFields) => {
    // TODO: Persist profile changes through patient profile API.
    set((state) => ({
      session: {
        ...state.session,
        patient: {
          ...state.session.patient,
          ...updatedFields,
        },
      },
    }));
  },

  /* -------------------------------------------------------------------------- */
  /* LANGUAGE PREFERENCE (Prompt 5)                                             */
  /* -------------------------------------------------------------------------- */
  selectedLanguage: (() => {
    try {
      return localStorage.getItem("ayushcare_language") || "en";
    } catch {
      return "en";
    }
  })(),

  setSelectedLanguage: (lang) => {
    // TODO: Expand supported languages and connect to backend/patient language preference.
    try {
      localStorage.setItem("ayushcare_language", lang);
    } catch (e) {
      // ignore
    }
    set({ selectedLanguage: lang });
  },

  /* -------------------------------------------------------------------------- */
  /* ACCESSIBILITY PREFERENCES (Prompt 5)                                       */
  /* -------------------------------------------------------------------------- */
  accessibilitySettings: (() => {
    try {
      const saved = localStorage.getItem("ayushcare_accessibility");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      textSize: "default", // "default" | "large" | "xlarge"
      highContrast: false,
      audioAssistance: true,
      reduceMotion: false,
    };
  })(),

  updateAccessibilitySettings: (partialSettings) => {
    set((state) => {
      const updated = {
        ...state.accessibilitySettings,
        ...partialSettings,
      };
      try {
        localStorage.setItem("ayushcare_accessibility", JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return { accessibilitySettings: updated };
    });
  },

  /* -------------------------------------------------------------------------- */
  /* SAFE LOGOUT (Prompt 5)                                                     */
  /* -------------------------------------------------------------------------- */
  logoutPatient: () => {
    // Important: Logout clears authentication state & temporary kiosk session,
    // but PRESERVES medical records, visits, appointments, documents, and privacy history.
    set((state) => ({
      isAuthenticated: false,
      currentScreen: SCREENS.AUTH,
      screenHistory: [SCREENS.AUTH],
      activeNavTab: "home",
      kioskSession: {
        ...state.kioskSession,
        status: "DISCONNECTED",
      },
      selectedAppointment: null,
      selectedVisit: null,
      selectedMedicalRecord: null,
    }));
  },

  resetMobileSession: () => {
    set({
      currentScreen: SCREENS.M1,
      screenHistory: [SCREENS.M1],
      activeNavTab: "home",
      selectedAppointment: null,
      selectedVisit: null,
      visitFilter: "ALL",
      timerSecondsRemaining: 300,
      isSessionExpired: false,
      selectedDocumentType: "prescription",
      capturedDocument: { ...mockDefaultDocument },
      isAnalyzing: false,
      analysisStep: 0,
      extractedData: JSON.parse(JSON.stringify(mockExtractedData)),
      timeline: [...mockTimeline],
      isHindiSpeechPlaying: false,
      isOriginalDocModalOpen: false,
      editingEntity: null,
      isSendingToDoctor: false,
    });
  },
}));

export default useMobileStore;
