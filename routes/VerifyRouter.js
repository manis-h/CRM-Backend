import express from "express";
import {
    postAadaharNoForOtp,
    getAadharDetailsWithOtpAndRequestId,
} from "../Controllers/getaadhar.js";
import { getPanController } from "../Controllers/getPanController.js";
const router = express.Router();

router.post("/pan/:id", getPanController);
router.post("/adhaar", postAadaharNoForOtp);
router.post("/otp", getAadharDetailsWithOtpAndRequestId);

export default router;
