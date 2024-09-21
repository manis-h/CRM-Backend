import express from "express"
import   getPanController from "../Controllers/getPanController";
const router = express.Router();

router.route('/').post(getPanController);

export default router;