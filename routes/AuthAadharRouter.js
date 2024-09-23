import express from "express"
const router = express.Router();
import { postAadaharNoForOtp , getAadharDetailsWithOtpAndRequestId } from "../Controllers/getaadhar.js";

router.post('/postaadharno',postAadaharNoForOtp);
router.post('/postrequidandotp',getAadharDetailsWithOtpAndRequestId);

export default router;