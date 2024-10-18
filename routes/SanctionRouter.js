import express from "express";
const router = express.Router();
import {
    getRecommendedApplications,
    sanctionApprove,
    sanctionPreview,
} from "../Controllers/sanction.js";
import { rejected } from "../helper/rejected.js";
import { getApplication } from "../Controllers/application.js";
import { sentBack } from "../helper/sentBack.js";
import { protect } from "../middleware/authMiddleware.js";

router.get("/recommended", protect, getRecommendedApplications);
router.get("/:id", protect, getApplication);
router.get("/preview/:id", protect, sanctionPreview);
router.patch("/approve/:id", protect, sanctionApprove);
router.patch("/sent-back/:id", protect, sentBack);
router.route("/reject/:id").patch(protect, rejected);

export default router;
