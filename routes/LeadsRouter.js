import express from "express";
const router = express.Router();

import {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    allocatedLeads,
    particularEmployeeAllocatedLeads,
} from "../Controllers/leads.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// router.get("/protected-route", authenticateToken, (req, res) => {
//     res.status(200).json({
//         message: "You have access to protected data!",
//         user: req.user,
//     });
// });
// Other routes
router.route("/").post(createLead).get(getAllLeads);
router.route("/allocated").get(allocatedLeads);
router.route("/allocated/:id").get(particularEmployeeAllocatedLeads);
router.route("/:id").get(getLead).patch(allocateLead);

export default router;
