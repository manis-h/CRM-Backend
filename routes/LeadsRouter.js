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
} from "../Controllers/leads.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Other routes
router.route("/").post(createLead).get(protect, getAllLeads);
// router.route("/allocated").get(protect, admin, allocatedLeads);
router.route("/allocated").get(protect, allocatedLeads);
router.route("/:id").get(getLead).patch(protect, allocateLead);
router.patch("/hold/:id", leadOnHold);
router.get("/hold", getHoldLeads);
router.patch("/reject/:id", leadReject);
router.get("/reject", getRejectedLeads);
router.get("/old-history/:id", internalDedupe);

export default router;
