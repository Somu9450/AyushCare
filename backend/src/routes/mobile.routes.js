import { Router } from 'express';
import {
    pairKioskSession,
    getUploadUrl,
    registerDocument,
    syncKioskUpload,
    sendPortalOtp,
    verifyPortalOtp,
    getPortalDashboard,
    getAudioSummary,
    getPortalDocuments,
    updatePortalPrivacy,
    getPortalPrivacy
} from '../controllers/mobile.controller.js';
import { verifyPatientJWT } from '../middleware/auth.middleware.js';

const router = Router();

// --- Flow A: Zero-Login QR Upload ---
router.route("/kiosk-session/pair/:pairing_token").get(pairKioskSession);
router.route("/kiosk-session/:session_id/upload-url").post(getUploadUrl);
router.route("/kiosk-session/:session_id/register-document").post(registerDocument);
// router.route("/kiosk-session/:session_id/documents/:document_id").delete(deleteDocument); 
router.route("/kiosk-session/:session_id/sync").post(syncKioskUpload);


router.route("/portal/auth/send-otp").post(sendPortalOtp);
router.route("/portal/auth/verify-otp").post(verifyPortalOtp);

router.route("/portal/dashboard").get(verifyPatientJWT, getPortalDashboard);
router.route("/portal/audio-summary").get(verifyPatientJWT, getAudioSummary);
router.route("/portal/documents").get(verifyPatientJWT, getPortalDocuments);
router.route("/portal/documents/upload-url").post(verifyPatientJWT, getUploadUrl); 

router.route("/portal/privacy-settings")
    .get(verifyPatientJWT, getPortalPrivacy)
    .patch(verifyPatientJWT, updatePortalPrivacy);

export default router;