import express from "express";
const router = express.Router();

import {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    allocatedLeads,
    updateLead,
    leadOnHold,
    unHoldLead,
    getHoldLeads,
    leadReject,
    getRejectedLeads,
    internalDedupe,
    viewLeadLogs,
    approveLead,
} from "../Controllers/leads.js";
import { bulkUpload } from "../helper/bulkUpload.js";
import { addDocs, getDocs } from "../helper/docsUploadAndFetch.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

// Define the fields you want to upload
const uploadFields = upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
    { name: "verficationVideo", maxCount: 1 },
]);

// Other routes
router.route("/").post(createLead).get(protect, getAllLeads);
router.route("/bulk-upload").post(protect, upload.single("csv"), bulkUpload);
router.route("/allocated").get(protect, allocatedLeads);
router.get("/hold", protect, getHoldLeads);
router.get("/reject", protect, getRejectedLeads);
router.route("/:id").get(getLead).patch(protect, allocateLead);
router.get("/old-history/:id", protect, internalDedupe);
router.patch("/hold/:id", protect, leadOnHold);
router.patch("/unhold/:id", protect, unHoldLead);
router.route("/update/:id").patch(protect, updateLead);
router.patch("/reject/:id", protect, leadReject);
router.get("/viewleadlog/:leadId", protect, viewLeadLogs);
router.patch("/approve/:id", protect, approveLead);
router
    .route("/docs/:id")
    .patch(protect, uploadFields, addDocs)
    .get(protect, getDocs);

export default router;
