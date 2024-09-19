import express from "express";
const router = express.Router();

import { login, logout, register } from "../Controllers/usercontrollers.js";
import { createLead, getAllLeads } from "../controllers/leads.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// Route to register a new user
router.route("/register").post(register);

// Route to login
router.route("/login").post(login);
router.route("/logout").post(logout);
// router.get("/protected-route", authenticateToken, (req, res) => {
//     res.status(200).json({
//         message: "You have access to protected data!",
//         user: req.user,
//     });
// });
// Other routes
router.route("/").post(createLead).get(getAllLeads);

export default router;
