import { Router } from 'express';
import { pairKioskSession, getUploadUrl, registerDocument, deleteDocument, getKioskDocuments, syncKioskUpload, sendPortalOtp, verifyPortalOtp, getPortalDashboard, getPortalVisits, getAudioSummary, updateKioskSessionLanguage, getPortalDocuments, getPortalDocument, registerPortalDocument, exchangePatientUploadQr, updatePortalPrivacy, getPortalPrivacy } from '../controllers/mobile.controller.js';
import { verifyPatientJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Flow A: zero-login, short-lived kiosk pairing.
router.get('/kiosk-session/pair/:pairing_token', pairKioskSession);
router.post('/kiosk-session/:session_id/upload-url', getUploadUrl);
router.post('/kiosk-session/:session_id/register-document', registerDocument);
router.get('/kiosk-session/:session_id/documents', getKioskDocuments);
router.delete('/kiosk-session/:session_id/documents/:document_id', deleteDocument);
router.put('/kiosk-session/:session_id/language', updateKioskSessionLanguage);
router.post('/kiosk-session/:session_id/sync', syncKioskUpload);

// Patient QR handoff: exchanges a short-lived kiosk-generated token for the same patient JWT used by the normal portal.
router.post('/portal/qr/exchange', exchangePatientUploadQr);

// Flow B: patient portal.
router.post('/portal/auth/send-otp', sendPortalOtp);
router.post('/portal/auth/verify-otp', verifyPortalOtp);
router.get('/portal/dashboard', verifyPatientJWT, getPortalDashboard);
router.get('/portal/visits', verifyPatientJWT, getPortalVisits);
router.get('/portal/audio-summary', verifyPatientJWT, getAudioSummary);
router.get('/portal/documents', verifyPatientJWT, getPortalDocuments);
router.get('/portal/documents/:document_id', verifyPatientJWT, getPortalDocument);
router.post('/portal/documents/upload-url', verifyPatientJWT, getUploadUrl);
router.post('/portal/documents/register', verifyPatientJWT, registerPortalDocument);
router.get('/portal/privacy-settings', verifyPatientJWT, getPortalPrivacy);
router.patch('/portal/privacy-settings', verifyPatientJWT, updatePortalPrivacy);

export default router;
