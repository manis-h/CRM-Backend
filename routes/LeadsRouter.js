import express from "express";
const router = express.Router();

import {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    allocatedLeads,
    updateLead,
    recommendLead,
    getTotalLeads,
} from "../Controllers/leads.js";
import { onHold, unHold, getHold } from "../helper/holdUnhold.js";
import { rejected, getRejected } from "../helper/rejected.js";
import { viewLogs } from "../helper/logs.js";
import internalDedupe from "../helper/internalDedupe.js";
import { bulkUpload } from "../helper/bulkUpload.js";
import { addDocs, getDocuments } from "../helper/docsUploadAndFetch.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

// Define the fields you want to upload
const uploadFields = upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
    { name: "verificationVideo", maxCount: 1 },
]);

// Other routes
router.route("/").post(createLead).get(protect, getAllLeads);
router.route("/bulk-upload").post(protect, upload.single("csv"), bulkUpload);
router.get("/totalleads", protect, getTotalLeads);
router.route("/allocated").get(protect, allocatedLeads);
router.get("/hold", protect, getHold);
router.get("/reject", protect, getRejected);
router.route("/:id").get(getLead).patch(protect, allocateLead);
router.get("/old-history/:id", protect, internalDedupe);
router.patch("/hold/:id", protect, onHold);
router.patch("/unhold/:id", protect, unHold);
router.route("/update/:id").patch(protect, updateLead);
router.patch("/reject/:id", protect, rejected);
router.get("/viewlogs/:leadId", protect, viewLogs);
router.patch("/recommend/:id", protect, recommendLead);
router
    .route("/docs/:id")
    .patch(protect, uploadFields, addDocs)
    .get(protect, getDocuments);

export default router;
