import express from "express";
const router = express.Router();

import {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    allocatedLeads,
    leadOnHold,
    getHoldLeads,
    leadReject,
    getRejectedLeads,
    internalDedupe,
    viewLeadLogs,
} from "../Controllers/leads.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Other routes
router.route("/").post(createLead).get(protect, getAllLeads);
// router.route("/allocated").get(protect, admin, allocatedLeads);
router.route("/allocated").get(protect, allocatedLeads);
router.route("/:id").get(getLead).patch(protect, allocateLead);
router.patch("/hold/:id", protect, leadOnHold);
router.get("/hold", protect, getHoldLeads);
router.patch("/reject/:id", protect, leadReject);
router.get("/reject", protect, getRejectedLeads);
router.get("/old-history/:id", protect, internalDedupe);
router.get("/viewleaadlog/:id", viewLeadLogs);

export default router;
