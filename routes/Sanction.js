import express from 'express';
const router = express.Router();
// import {
//     generateSanctionLetter
// } from "../Controllers/sanction.js"
import { generateSanctionLetter } from '../Controllers/generateSanction.js';

router.post("/generateSanctionLetter",generateSanctionLetter);
export default router;
