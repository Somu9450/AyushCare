import { ApiError } from '../utilities/ApiError.js';

const baseUrl = () => (process.env.MEDIKIOSK_AI_BASE_URL || '').replace(/\/$/, '');

const request = async (path, options = {}) => {
    const base = baseUrl();
    if (!base) throw new ApiError(503, 'MediKiosk AI service is not configured');
    const headers = { ...(options.headers || {}) };
    if (process.env.MEDIKIOSK_AI_API_KEY) headers.Authorization = `Bearer ${process.env.MEDIKIOSK_AI_API_KEY}`;
    let response;
    try {
        response = await fetch(`${base}${path}`, { ...options, headers });
    } catch (error) {
        throw new ApiError(502, 'Unable to reach MediKiosk AI service', [error.message]);
    }
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!response.ok) throw new ApiError(response.status >= 500 ? 502 : response.status, data?.message || data?.detail || 'MediKiosk AI request failed', [data]);
    return data;
};

const json = (path, body, method = 'POST') => request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
});

const AiServiceGateway = {
    createSession: (patientId, facilityId = 'unassigned', language = 'en', intakePathway = 'general') =>
        json('/api/v1/sessions', { patient_id: patientId, facility_id: facilityId, language, intake_pathway: intakePathway }),
    getSession: (sessionId) => request(`/api/v1/sessions/${sessionId}`),
    deleteSession: (sessionId) => request(`/api/v1/sessions/${sessionId}`, { method: 'DELETE' }),
    updateLanguage: (sessionId, language) => json(`/api/v1/sessions/${sessionId}/language`, { language }, 'PUT'),
    startConversation: (sessionId, intakePathway) => json(`/api/v1/sessions/${sessionId}/conversation/start`, { intake_pathway: intakePathway }),
    getConversationState: (sessionId) => request(`/api/v1/sessions/${sessionId}/conversation/state`),
    submitConversationAnswer: (sessionId, questionId, answer, inputMode = 'text', confidence = 1) =>
        json(`/api/v1/sessions/${sessionId}/conversation/answer`, { question_id: questionId, answer, input_mode: inputMode, confidence }),
    submitSpeech: async (sessionId, questionId, language, buffer, mimeType = 'audio/wav') => {
        const form = new FormData();
        form.append('audio', new Blob([buffer], { type: mimeType }), 'speech.wav');
        return request(`/api/v1/sessions/${sessionId}/conversation/speech?question_id=${encodeURIComponent(questionId)}&language=${encodeURIComponent(language)}`, { method: 'POST', body: form });
    },
    tts: (sessionId, text, language = 'en') => request(`/api/v1/sessions/${sessionId}/conversation/tts?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}`),
    uploadDocument: async (sessionId, buffer, mimeType, fileName, documentType = 'medical_document') => {
        const form = new FormData();
        form.append('file', new Blob([buffer], { type: mimeType }), fileName);
        form.append('document_type', documentType);
        return request(`/api/v1/sessions/${sessionId}/documents/upload`, { method: 'POST', body: form });
    },
    listDocuments: (sessionId) => request(`/api/v1/sessions/${sessionId}/documents`),
    verifyDocumentEntity: (sessionId, documentId, entityId, status = 'verified') => request(`/api/v1/sessions/${sessionId}/documents/${documentId}/entities/${entityId}/verify?status=${encodeURIComponent(status)}`, { method: 'PUT' }),
    generateSummary: (sessionId, language = 'en', includeDocuments = true, includeAyush = false) => json(`/api/v1/sessions/${sessionId}/summary/generate`, { language, include_documents: includeDocuments, include_ayush: includeAyush }),
    getSummary: (sessionId) => request(`/api/v1/sessions/${sessionId}/summary`),
    editSummarySection: (sessionId, sectionId, editedBody, editReason) => json(`/api/v1/sessions/${sessionId}/summary/sections/${sectionId}`, { edited_body: editedBody, edit_reason: editReason }, 'PUT'),
    getConsentScopes: (sessionId) => request(`/api/v1/sessions/${sessionId}/consent/scopes`),
    grantConsent: (sessionId, scopes) => json(`/api/v1/sessions/${sessionId}/consent`, scopes),
    grantConsent: (sessionId, scopes) => json(`/api/v1/sessions/${sessionId}/consent`, scopes),
    getConsentReceipt: (sessionId) => request(`/api/v1/sessions/${sessionId}/consent/receipt`),
    withdrawConsent: (sessionId, scopeId) => json(`/api/v1/sessions/${sessionId}/consent/withdraw`, { scope_id: scopeId }),
    fhirPreview: (sessionId) => request(`/api/v1/sessions/${sessionId}/fhir/preview`)
};

export default AiServiceGateway;
