import express from "express";
const router = express.Router();

import { login, logout, register } from "../Controllers/usercontrollers.js";
// import { createLead, getAllLeads } from "../controllers/leads";
import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";

// @desc Create loan leads
// @route POST /api/leads
// @access Public

const createLead = asyncHandler(async (req, res) => {
    const {
        fName,
        mName,
        lName,
        gender,
        dob,
        adhaar,
        pan,
        mobile,
        alternateMobile,
        personalEmail,
        officeEmail,
        loanAmount,
        salary,
        pinCode,
        state,
        city,
    } = req.body;
    const newLead = await Lead.create({
        fName,
        mName: mName ?? "",
        lName: lName ?? "",
        gender,
        dob,
        adhaar,
        pan,
        mobile,
        alternateMobile,
        personalEmail,
        officeEmail,
        loanAmount,
        salary,
        pinCode,
        state,
        city,
    });
    // const savedUserDetails = await newUserDetails.save();
    res.status(201).json(newLead);
});

// @desc Get all leads
// @route GET /api/leads
// @access Private
const getAllLeads = async (req, res) => {
    try {
        // const page = parseInt(req.query.page) || 1; // current page
        // const limit = parseInt(req.query.limit) || 10; // items per page
        // const skip = (page - 1) * limit;

        const leads = await Lead.find({}); //.skip(skip).limit(limit);
        const totalLeads = await Lead.countDocuments();

        res.status(200).json({
            totalLeads,
            // totalPages: Math.ceil(totalLeads / limit),
            // currentPage: page,
            leads,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving user details",
            error,
        });
    }
};
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
