import { Router } from 'express';
import {
    pairKioskSession, getUploadUrl, registerDocument, deleteDocument, syncKioskUpload,
    sendPortalOtp, verifyPortalOtp, getPortalDashboard, getAudioSummary, getPortalDocuments, getPortalPrivacy, updatePortalPrivacy
} from '../controllers/mobile.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route("/kiosk-session/pair/:pairing_token").get(pairKioskSession);
router.route("/kiosk-session/:session_id/upload-url").post(getUploadUrl);
router.route("/kiosk-session/:session_id/register-document").post(registerDocument);
router.route("/kiosk-session/:session_id/documents/:document_id").delete(deleteDocument);
router.route("/kiosk-session/:session_id/sync").post(syncKioskUpload);

router.route("/portal/auth/send-otp").post(sendPortalOtp);
router.route("/portal/auth/verify-otp").post(verifyPortalOtp);

router.route("/portal/dashboard").get(verifyJWT, getPortalDashboard);
router.route("/portal/audio-summary").get(verifyJWT, getAudioSummary);
router.route("/portal/documents").get(verifyJWT, getPortalDocuments);
router.route("/portal/documents/upload-url").post(verifyJWT, getUploadUrl);
router.route("/portal/privacy-settings").get(verifyJWT, getPortalPrivacy).patch(verifyJWT, updatePortalPrivacy);

export default router;