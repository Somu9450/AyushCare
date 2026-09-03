import { create } from 'zustand';

/*
 * ---------------------------------------------------------
 * MOCK PATIENT DATA
 * ---------------------------------------------------------
 */

export const MOCK_PATIENTS = {
  abha: {
    abhaNumber: '91-4432-8812-9012',
    abhaAddress: 'rajesh.sharma@abdm',

    name: 'Rajesh Kumar Sharma',
    hindiName: 'राजेश कुमार शर्मा',

    gender: 'Male',
    dob: '1984-06-15',
    age: 42,

    mobile: '+91 98765 43210',

    bloodGroup: 'B+',

    district: 'Central Delhi',
    state: 'Delhi',

    hasAyushHistory: true,
    prakriti: 'Vata-Pitta (वात-पित्त)',
  },

  aadhaar: {
    abhaNumber: '72-8891-2301-4455',
    abhaAddress: 'sunita.devi@abdm',

    name: 'Sunita Devi',
    hindiName: 'सुनीता देवी',

    gender: 'Female',
    dob: '1978-11-20',
    age: 47,

    mobile: '+91 91234 56789',

    bloodGroup: 'O+',

    district: 'Varanasi',
    state: 'Uttar Pradesh',

    hasAyushHistory: false,
    prakriti: 'Kapha-Vata (कफ-वात)',
  },
};

/*
 * ---------------------------------------------------------
 * INITIAL SESSION
 * ---------------------------------------------------------
 */

const createInitialSession = () => ({
  /*
   * Authentication
   */
  authType: 'ABHA',
  identifier: '',
  otp: '',
  isVerified: false,
  patientProfile: null,

  /*
   * Track
   */
  track: null,
  // 'ALLOPATHY' | 'AYUSH'

  /*
   * Department
   */
  selectedDepartment: null,

  /*
   * Doctor routing
   */
  requestedDoctor: null,
  doctorAvailability: null,

  appointmentSlot: null,

  /*
   * Clinical intake
   */
  intakeMode: 'MULTIMODAL',
  // 'VOICE' | 'TOUCH' | 'MULTIMODAL'

  symptoms: [],

  chiefComplaint: '',

  clinicalHistory: {
    hpi: {},
    pastMedicalHistory: [],
    pastSurgicalHistory: [],
    medications: [],
    allergies: [],
    familyHistory: [],
    personalHistory: {},
    reviewOfSystems: {},
  },

  /*
   * Adaptive question engine
   */
  currentQuestion: null,
  questionIndex: 0,
  questionHistory: [],

  /*
   * AYUSH
   */
  ayushHistory: {
    prakriti: null,
    vikriti: null,
    sara: null,
    samhanana: null,
    pramana: null,
    satmya: null,
    sattva: null,
    aharaShakti: null,
    vyayamaShakti: null,
    vaya: null,
    agni: null,
    kostha: null,
    aharaVihara: {},
  },

  /*
   * Documents
   */
  documents: [],

  /*
   * Safety
   */
  redFlags: [],
  redFlagDetected: false,

  /*
   * Vitals
   */
  vitals: {
    bp: '',
    pulse: '',
    temp: '',
    spo2: '',
  },

  /*
   * Session
   */
  sessionToken: null,
  sessionExpiresAt: null,

  /*
   * Completion
   */
  tokenNumber: null,
});

/*
 * ---------------------------------------------------------
 * STORE
 * ---------------------------------------------------------
 */

export const useKioskStore = create((set, get) => ({
  /*
   * Navigation
   */
  currentScreen: 1,

  /*
   * Language
   */
  language: 'en',

  /*
   * Audio / Accessibility
   */
  audioEnabled: true,
  silentMode: false,
  highContrast: false,
  fontSizeMultiplier: 1,

  /*
   * Emergency
   */
  emergencyModalOpen: false,

  /*
   * WebSocket
   */
  socketStatus: 'DISCONNECTED',
  // CONNECTING | CONNECTED | DISCONNECTED | ERROR

  /*
   * Session
   */
  sessionData: createInitialSession(),

  /*
   * -------------------------------------------------------
   * NAVIGATION
   * -------------------------------------------------------
   */

  setScreen: (screen) => {
    const safeScreen = Math.max(
      1,
      Math.min(10, screen)
    );

    set({
      currentScreen: safeScreen,
    });
  },

  nextScreen: () => {
    const current = get().currentScreen;

    if (current < 10) {
      set({
        currentScreen: current + 1,
      });
    }
  },

  prevScreen: () => {
    const current = get().currentScreen;

    if (current > 1) {
      set({
        currentScreen: current - 1,
      });
    }
  },

  /*
   * -------------------------------------------------------
   * LANGUAGE
   * -------------------------------------------------------
   */

  setLanguage: (language) => {
    set({ language });
  },

  /*
   * -------------------------------------------------------
   * AUDIO / ACCESSIBILITY
   * -------------------------------------------------------
   */

  toggleAudio: () => {
    set((state) => {
      const nextValue = !state.audioEnabled;

      return {
        audioEnabled: nextValue,
        silentMode: !nextValue,
      };
    });
  },

  setSilentMode: (enabled) => {
    set({
      silentMode: enabled,
      audioEnabled: !enabled,
    });
  },

  toggleHighContrast: () => {
    set((state) => ({
      highContrast: !state.highContrast,
    }));
  },

  setFontSizeMultiplier: (value) => {
    set({
      fontSizeMultiplier: value,
    });
  },

  /*
   * -------------------------------------------------------
   * EMERGENCY
   * -------------------------------------------------------
   */

  toggleEmergencyModal: (open) => {
    set((state) => ({
      emergencyModalOpen:
        typeof open === 'boolean'
          ? open
          : !state.emergencyModalOpen,
    }));
  },

  /*
   * -------------------------------------------------------
   * SESSION
   * -------------------------------------------------------
   */

  updateSessionData: (payload) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        ...payload,
      },
    }));
  },

  setVerifiedPatient: (
    profile,
    authType,
    identifier
  ) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,

        authType:
          authType ||
          state.sessionData.authType,

        identifier:
          identifier ||
          state.sessionData.identifier,

        isVerified: true,

        patientProfile: profile,
      },
    }));
  },

  /*
   * -------------------------------------------------------
   * TRACK
   * -------------------------------------------------------
   */

  setTrack: (track) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        track,
      },
    }));
  },

  /*
   * -------------------------------------------------------
   * DOCTOR ROUTING
   * -------------------------------------------------------
   */

  setSelectedDepartment: (department) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        selectedDepartment: department,
      },
    }));
  },

  setRequestedDoctor: (doctor) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        requestedDoctor: doctor,
      },
    }));
  },

  setDoctorAvailability: (availability) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        doctorAvailability: availability,
      },
    }));
  },

  /*
   * -------------------------------------------------------
   * CLINICAL INTAKE
   * -------------------------------------------------------
   */

  setIntakeMode: (mode) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        intakeMode: mode,
      },
    }));
  },

  setCurrentQuestion: (question) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        currentQuestion: question,
      },
    }));
  },

  recordQuestionAnswer: (
    question,
    answer
  ) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,

        questionHistory: [
          ...state.sessionData.questionHistory,

          {
            question,
            answer,
            timestamp: new Date().toISOString(),
          },
        ],

        questionIndex:
          state.sessionData.questionIndex + 1,

        currentQuestion: null,
      },
    }));
  },

  setChiefComplaint: (complaint) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        chiefComplaint: complaint,
      },
    }));
  },

  addSymptom: (symptom) => {
    set((state) => {
      const exists =
        state.sessionData.symptoms.some(
          (item) =>
            item.id === symptom.id
        );

      if (exists) {
        return state;
      }

      return {
        sessionData: {
          ...state.sessionData,

          symptoms: [
            ...state.sessionData.symptoms,
            symptom,
          ],
        },
      };
    });
  },

  removeSymptom: (symptomId) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,

        symptoms:
          state.sessionData.symptoms.filter(
            (item) =>
              item.id !== symptomId
          ),
      },
    }));
  },

  /*
   * -------------------------------------------------------
   * RED FLAGS
   * -------------------------------------------------------
   */

  setRedFlags: (flags) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,

        redFlags: flags,

        redFlagDetected:
          flags.length > 0,
      },
    }));
  },

  /*
   * -------------------------------------------------------
   * DOCUMENTS
   * -------------------------------------------------------
   */

  addDocument: (document) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,

        documents: [
          ...state.sessionData.documents,
          document,
        ],
      },
    }));
  },

  removeDocument: (documentId) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,

        documents:
          state.sessionData.documents.filter(
            (document) =>
              document.id !== documentId
          ),
      },
    }));
  },

  /*
   * -------------------------------------------------------
   * WEBSOCKET STATE
   * -------------------------------------------------------
   */

  setSocketStatus: (status) => {
    set({
      socketStatus: status,
    });
  },

  /*
   * -------------------------------------------------------
   * RESET
   * -------------------------------------------------------
   */

  resetSession: () => {
    set({
      currentScreen: 1,
      emergencyModalOpen: false,

      audioEnabled: true,
      silentMode: false,

      socketStatus: 'DISCONNECTED',

      sessionData:
        createInitialSession(),
    });
  },
}));

export default useKioskStore;