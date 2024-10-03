import express from "express";
import {
    postAadhaarNoForOtp,
    verifyAadhaarDetailsWithOtpAndRequestId,
} from "../Controllers/getAadhaar.js";
import { getPanController } from "../Controllers/getPanController.js";
import { emailVerify } from "../Controllers/leads.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// aadhaar verify
router.post("/aadhaar", postAadhaarNoForOtp);
router.post("/otp", verifyAadhaarDetailsWithOtpAndRequestId);

// email verify
router.post("/email/:id", protect, emailVerify);

// pan verify
router.post("/pan/:id", getPanController);

export default router;
