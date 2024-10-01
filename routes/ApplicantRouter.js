import express from "express";
const router = express.Router();
import {
    updateApplicantDetails,
    getApplicantDetails,
} from "../Controllers/applicantPersonalDetails.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router
    .route("/:id")
    .get(protect, getApplicantDetails)
    .patch(protect, updateApplicantDetails);

export default router;
