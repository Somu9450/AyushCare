import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const unwrap = (response) => response.data?.data ?? response.data;
const request = async (config) => unwrap(await api(config));

export const kioskApi = {
  verifyPatient: (payload) => request({ method: 'POST', url: '/intake/auth/abha', data: payload }),
  getSession: (sessionId) => request({ method: 'GET', url: `/intake/session/${sessionId}` }),
  updateLanguage: (sessionId, language) => request({ method: 'PUT', url: `/intake/session/${sessionId}/language`, data: { language } }),
  startDialogue: (sessionId) => request({ method: 'POST', url: `/intake/session/${sessionId}/dialogue/start` }),
  dialogueState: (sessionId) => request({ method: 'GET', url: `/intake/session/${sessionId}/dialogue/state` }),
  answer: (sessionId, payload) => request({ method: 'POST', url: `/intake/session/${sessionId}/dialogue/answer`, data: payload }),
  speech: (sessionId, questionId, language, blob) => request({ method: 'POST', url: `/intake/session/${sessionId}/dialogue/speech`, params: { question_id: questionId, language }, data: blob, headers: { 'Content-Type': blob.type || 'audio/wav' } }),
  tts: (sessionId, text, language) => request({ method: 'GET', url: `/intake/session/${sessionId}/dialogue/tts`, params: { text, language } }),
  departments: (pathway, hospitalId) => request({ method: 'GET', url: '/intake/departments', params: { pathway, ...(hospitalId ? { hospital_id: hospitalId } : {}) } }),
  doctors: (departmentId) => request({ method: 'GET', url: `/intake/departments/${departmentId}/doctors` }),
  vitals: (sessionId, payload) => request({ method: 'POST', url: `/intake/session/${sessionId}/vitals`, data: payload }),
  documents: (sessionId) => request({ method: 'GET', url: `/intake/session/${sessionId}/documents` }),
  summaryGenerate: (sessionId, language, includeAyush) => request({ method: 'POST', url: `/intake/session/${sessionId}/summary/generate`, data: { language, include_documents: true, include_ayush: includeAyush } }),
  summary: (sessionId) => request({ method: 'GET', url: `/intake/session/${sessionId}/summary` }),
  consentScopes: (sessionId) => request({ method: 'GET', url: `/intake/session/${sessionId}/consent/scopes` }),
  grantConsent: (sessionId, scopes) => request({ method: 'POST', url: `/intake/session/${sessionId}/consent`, data: scopes }),
  consentReceipt: (sessionId) => request({ method: 'GET', url: `/intake/session/${sessionId}/consent/receipt` }),
  token: (sessionId) => request({ method: 'POST', url: `/intake/session/${sessionId}/token` }),
  complete: (sessionId) => request({ method: 'POST', url: `/intake/session/${sessionId}/complete` }),
  cancel: (sessionId) => request({ method: 'POST', url: `/intake/session/${sessionId}/cancel` }),
  createPairing: (consultationId, kioskId) => request({ method: 'POST', url: '/intake/session', data: { consultationId, kioskId } }),
  mobileDocuments: (pairingSessionId) => request({ method: 'GET', url: `/mobile/kiosk-session/${pairingSessionId}/documents` }),
  mobileSync: (pairingSessionId) => request({ method: 'POST', url: `/mobile/kiosk-session/${pairingSessionId}/sync` }),
};

export const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
export default api;
