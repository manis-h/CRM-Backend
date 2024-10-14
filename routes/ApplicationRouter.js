import express from "express";
const router = express.Router();

import {
    getAllApplication,
    getApplication,
    allocateApplication,
    allocatedApplications,
    forwardApplication,
    getCamDetails,
    postCamDetails,
    updateCamDetails,
    // approveApplication,
} from "../Controllers/application.js";
import { onHold, unHold, getHold } from "../helper/holdUnhold.js";
import { rejected, getRejected } from "../helper/rejected.js";
import { sentBack } from "../helper/sentBack.js";
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
    { name: "verificationVideo", maxCount: 1 },
]);

// Other routes
router.route("/").get(protect, getAllApplication);
router.route("/allocated").get(protect, allocatedApplications);
router
    .route("/:id")
    .get(protect, getApplication)
    .patch(protect, allocateApplication);
router.route("/hold/:id").get(protect, getHold).patch(protect, onHold);
router.patch("/unhold/:id", protect, unHold);
router.patch("/reject/:id").get(protect, getRejected).patch(protect, rejected);
router.patch("/forward/:id", protect, forwardApplication);
// router.patch("/approve/:id", protect, approveApplication);
router.patch("/sent-back/:id", protect, sentBack);
router
    .route("/cam/:id")
    .get(protect, getCamDetails)
    .patch(protect, updateCamDetails);

router
    .route("/docs/:id")
    .patch(protect, uploadFields, addDocs)
    .get(protect, getDocs);
export default router;
