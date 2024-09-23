import express from "express";
import { getPanController } from "../Controllers/getPanController.js";
const router = express.Router();

router.post("/pan", getPanController);
// router.post('/adhaar');
// router.post('/otp');

export default router;
