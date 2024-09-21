import express from "express";
const router = express.Router();

import {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    allocatedLeads,
    // particularEmployeeAllocatedLeads,
} from "../Controllers/leads.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Other routes
router.route("/").post(createLead).get(protect, getAllLeads);
// router.route("/allocated").get(protect, admin, allocatedLeads);
router.route("/allocated").get(protect, allocatedLeads);
router.route("/:id").get(getLead).patch(protect, allocateLead);

export default router;
