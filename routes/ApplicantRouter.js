import express from "express";
const router = express.Router();
import {
    updateApplicantDetails,
    getApplicantDetails,
    addApplicantBankDetails,
    getApplicantBankDetails,
} from "../Controllers/applicantPersonalDetails.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router
    .route("/:id")
    .get(protect, getApplicantDetails)
    .patch(protect, updateApplicantDetails);

router
    .route("/bankDetails/:id")
    .get(protect, getApplicantBankDetails)
    .post(protect, addApplicantBankDetails);

export default router;
