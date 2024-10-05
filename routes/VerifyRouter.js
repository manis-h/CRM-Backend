import express from "express";
import { aadhaarOtp, verifyAadhaar } from "../Controllers/aadhaarController.js";
import { getPanDetails, panAadhaarLink } from "../Controllers/panController.js";
import {
    emailVerify,
    verifyEmailOtp,
    fetchCibil,
} from "../Controllers/leads.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// aadhaar verify
router.get("/aadhaar/:id", aadhaarOtp);
router.post("/aadhaar-otp/:trx_id", verifyAadhaar);

// email verify
router.patch("/email/:id", protect, emailVerify);
router.patch("/email-otp/:id", protect, verifyEmailOtp);

// pan verify
router.get("/pan/:id", getPanDetails);
router.post("/pan-aadhaar-link/:id", panAadhaarLink);

// fetch CIBIL
router.get("/equifax/:id", protect, fetchCibil);
export default router;
