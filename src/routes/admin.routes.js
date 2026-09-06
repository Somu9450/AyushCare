import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/role.middleware.js';
import { getDoctorsList, getVisitAnalytics, overrideQueue } from '../controllers/admin.controller.js';

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/doctors").get(getDoctorsList);
router.route("/analytics/visits").get(getVisitAnalytics);
router.route("/queue/override").post(overrideQueue);

export default router;