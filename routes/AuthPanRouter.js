import express from "express";
import { getPanController } from "../Controllers/getPanController.js";
const router = express.Router();

router.post("/verify", getPanController);
// router.post('/adhaar');
// router.post('/otp')

export default router;
