import express from "express";
import {
    postAadhaarNoForOtp,
    verifyAadhaarDetailsWithOtpAndRequestId,
} from "../Controllers/getAadhaar.js";
import { getPanController } from "../Controllers/getPanController.js";
const router = express.Router();

router.post("/pan/:id", getPanController);
router.post("/aadhaar", postAadhaarNoForOtp);
router.post("/otp", verifyAadhaarDetailsWithOtpAndRequestId);

export default router;
