import { create } from "zustand";
import {
  mockSession,
  mockExtractedData,
  mockTimeline,
  mockHealthSummary,
  mockDefaultDocument,
} from "../data/mockData";
import { analyzeDocumentOCR } from "../services/documentService";
import { sendSummaryToDoctor } from "../services/summaryService";

export const SCREENS = {
  M1: "M1", // Active Session / Mobile Home
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
  SCREENS.M1,
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
  currentScreen: SCREENS.M1,
  screenHistory: [SCREENS.M1],

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
  /* DOCUMENT SELECTION & CAPTURE                                               */
  /* -------------------------------------------------------------------------- */
  selectedDocumentType: "prescription",
  capturedDocument: { ...mockDefaultDocument },
  
  setSelectedDocumentType: (typeId) => {
    set({ selectedDocumentType: typeId });
  },

  setCapturedDocument: (doc) => {
    set({
      capturedDocument: {
        ...mockDefaultDocument,
        ...doc,
        documentType: get().selectedDocumentType || "prescription",
      },
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
    // Mark all as verified
    set((state) => ({
      extractedData: {
        ...state.extractedData,
        medicines: state.extractedData.medicines.map((m) => ({
          ...m,
          needsVerification: false,
        })),
        diagnosis: {
          ...state.extractedData.diagnosis,
          needsVerification: false,
        },
      },
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

  resetMobileSession: () => {
    set({
      currentScreen: SCREENS.M1,
      screenHistory: [SCREENS.M1],
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
