import express from "express";
const router = express.Router();
import {
    getForwardedApplications,
    sanctionApprove,
} from "../Controllers/sanction.js";
import { onHold, unHold, getHold } from "../helper/holdUnhold.js";
import { rejected, getRejected } from "../helper/rejected.js";
import { getApplication } from "../Controllers/application.js";
import { sentBack } from "../helper/sentBack.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateSanctionLetter } from "../Controllers/generateSanction.js";

router.get("/recommended", protect, getForwardedApplications);
router.get("/:id", protect, getApplication);
router.patch("/approve/:id", protect, sanctionApprove);
router.patch("/sent-back/:id", protect, sentBack);
router.patch("/unhold/:id", protect, unHold);
router.route("/hold/:id").patch(protect, onHold).get(protect, getHold);
router.route("/reject/:id").patch(protect, rejected).get(protect, getRejected);

router.post("/generateSanctionLetter", generateSanctionLetter);
export default router;
