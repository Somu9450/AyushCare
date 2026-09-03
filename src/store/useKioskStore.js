import { create } from 'zustand';

// Simulated mock patient data matching NHA ABDM schema
export const MOCK_PATIENTS = {
  abha: {
    abhaNumber: "91-4432-8812-9012",
    abhaAddress: "rajesh.sharma@abdm",
    name: "Rajesh Kumar Sharma",
    hindiName: "राजेश कुमार शर्मा",
    gender: "Male",
    dob: "1984-06-15",
    age: 42,
    mobile: "+91 98765 43210",
    bloodGroup: "B+",
    district: "Central Delhi",
    state: "Delhi",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    hasAyushHistory: true,
    prakriti: "Vata-Pitta (वात-पित्त)"
  },
  aadhaar: {
    abhaNumber: "72-8891-2301-4455",
    abhaAddress: "sunita.devi@abdm",
    name: "Sunita Devi",
    hindiName: "सुनीता देवी",
    gender: "Female",
    dob: "1978-11-20",
    age: 47,
    mobile: "+91 91234 56789",
    bloodGroup: "O+",
    district: "Varanasi",
    state: "Uttar Pradesh",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    hasAyushHistory: false,
    prakriti: "Kapha-Vata (कफ-वात)"
  }
};

const initialSession = {
  authType: 'ABHA', // 'ABHA' | 'Aadhaar' | 'Mobile'
  identifier: '',
  otp: '',
  isVerified: false,
  patientProfile: null,
  track: 'AYUSH', // 'AYUSH' | 'ALLOPATHY'
  selectedDepartment: null, // Department object
  requestedDoctor: null, // Doctor object or null for 'General Duty'
  appointmentSlot: 'Today - Morning (10:30 AM - 11:30 AM)',
  symptoms: [],
  vitals: {
    bp: '120/80',
    pulse: '74',
    temp: '98.4',
    spo2: '98%'
  },
  tokenNumber: 'AY-OPD-108'
};

export const useKioskStore = create((set, get) => ({
  // Screen routing (1 to 10)
  currentScreen: 1,
  
  // Instant multi-language support (en, hi, pa, bn)
  language: 'en',
  
  // Accessibility and Audio states
  audioEnabled: false,
  emergencyModalOpen: false,
  highContrast: false,
  fontSizeMultiplier: 1.0, // 1.0 = normal, 1.15 = large

  // Active Session state
  sessionData: { ...initialSession },

  // Navigation actions
  setScreen: (screenNum) => {
    const clamped = Math.max(1, Math.min(10, screenNum));
    set({ currentScreen: clamped });
  },

  nextScreen: () => {
    const current = get().currentScreen;
    if (current < 10) {
      set({ currentScreen: current + 1 });
    }
  },

  prevScreen: () => {
    const current = get().currentScreen;
    if (current > 1) {
      set({ currentScreen: current - 1 });
    }
  },

  // Language update - strictly does NOT clear current session data or screen progress
  setLanguage: (lang) => {
    set({ language: lang });
  },

  // Accessibility actions
  toggleAudio: () => {
    set((state) => ({ audioEnabled: !state.audioEnabled }));
  },

  toggleEmergencyModal: (open) => {
    set((state) => ({ 
      emergencyModalOpen: typeof open === 'boolean' ? open : !state.emergencyModalOpen 
    }));
  },

  toggleHighContrast: () => {
    set((state) => ({ highContrast: !state.highContrast }));
  },

  setFontSizeMultiplier: (multiplier) => {
    set({ fontSizeMultiplier: multiplier });
  },

  // Session data mutations
  updateSessionData: (payload) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        ...payload
      }
    }));
  },

  // Direct patient verification helper
  setVerifiedPatient: (profile, authType, identifier) => {
    set((state) => ({
      sessionData: {
        ...state.sessionData,
        authType: authType || state.sessionData.authType,
        identifier: identifier || state.sessionData.identifier,
        isVerified: true,
        patientProfile: profile
      }
    }));
  },

  // Complete reset to initial kiosk state (for new user after completion or timeout)
  resetSession: () => {
    set({
      currentScreen: 1,
      emergencyModalOpen: false,
      sessionData: { ...initialSession }
    });
  }
}));
