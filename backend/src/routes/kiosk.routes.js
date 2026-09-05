import { Router } from 'express';
import { performAbhaRegister, nextDialogue, uploadIntakeDoc } from '../controllers/kiosk.controller.js';

const router = Router();

router.route("/auth/abha").post(performAbhaRegister);
router.route("/dialogue/next").post(nextDialogue);
router.route("/upload").post(uploadIntakeDoc);

export default router;