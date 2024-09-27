import express from "express";
const router = express.Router();

import {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    addDocsInLead,
    getDocsFromLead,
    allocatedLeads,
    leadOnHold,
    unHoldLead,
    getHoldLeads,
    leadReject,
    getRejectedLeads,
    internalDedupe,
    viewLeadLogs,
    approveLead,
} from "../Controllers/leads.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

// Define the fields you want to upload
const uploadFields = upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
]);

// Other routes
router.route("/").post(createLead).get(protect, getAllLeads);
// router.route("/allocated").get(protect, admin, allocatedLeads);
router.route("/allocated").get(protect, allocatedLeads);
router.route("/:id").get(getLead).patch(protect, allocateLead);
router.patch("/hold/:id", protect, leadOnHold);
router.patch("/unhold/:id", protect, unHoldLead);
router.get("/hold", protect, getHoldLeads);
router.patch("/reject/:id", protect, leadReject);
router.get("/reject", protect, getRejectedLeads);
router.get("/old-history/:id", protect, internalDedupe);
router.get("/viewleadlog/:id", protect, viewLeadLogs);
router.patch("/approve/:id", protect, approveLead);
router
    .route("/docs/:id")
    .patch(protect, uploadFields, addDocsInLead)
    .get(protect, getDocsFromLead);

export default router;
