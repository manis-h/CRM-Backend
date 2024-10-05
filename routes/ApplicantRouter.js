import express from "express";
const router = express.Router();
import {
    updateApplicantDetails,
    getApplicantDetails,
    addOrUpdateApplicantBankDetails,
    getApplicantBankDetails,
} from "../Controllers/applicantPersonalDetails.js";
import { protect } from "../middleware/authMiddleware.js";

router
    .route("/:id")
    .get(protect, getApplicantDetails)
    .patch(protect, updateApplicantDetails);

router
    .route("/bankDetails/:id")
    .get(protect, getApplicantBankDetails)
    .patch(protect, addOrUpdateApplicantBankDetails);

export default router;
