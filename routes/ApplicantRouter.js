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
    .route("/bankDetails/:id")
    .post(protect, addOrUpdateApplicantBankDetails)
    .get(protect, getApplicantBankDetails);

router
    .route("/:id")
    .get(protect, getApplicantDetails)
    .patch(protect, updateApplicantDetails);

export default router;
