import express from "express";
const router = express.Router();

import {
    getAllApplication,
    getApplication,
    allocateApplication,
    allocatedApplications,
    applicationOnHold,
    unHoldApplication,
    getHoldApplication,
    applicationReject,
    getRejectedApplication,
    forwardApplication,
    // approveApplication,
} from "../Controllers/application.js";
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
]);

// Other routes
router.route("/").get(protect, getAllApplication);
router.route("/allocated").get(protect, allocatedApplications);
router.get("/hold", protect, getHoldApplication);
router.get("/reject", protect, getRejectedApplication);
router.route("/:id").get(getApplication).patch(protect, allocateApplication);
router.patch("/hold/:id", protect, applicationOnHold);
router.patch("/unhold/:id", protect, unHoldApplication);
router.patch("/reject/:id", protect, applicationReject);
// router.get("/old-history/:id", protect, internalDedupe);
router.patch("/forward/:id", protect, forwardApplication);
// router.patch("/approve/:id", protect, approveApplication);
router
    .route("/docs/:id")
    .patch(protect, uploadFields, addDocs)
    .get(protect, getDocs);
export default router;
