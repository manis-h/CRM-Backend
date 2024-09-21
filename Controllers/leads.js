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
    return res.status(201).json(newLead);
});

// @desc Get all leads
// @route GET /api/leads
// @access Private
const getAllLeads = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const leads = await Lead.find({
        $or: [{ screenerId: { $exists: false } }, { screenerId: null }],
    })
        .skip(skip)
        .limit(limit);
    const totalLeads = await Lead.countDocuments();

    return res.json({
        totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
        currentPage: page,
        leads,
    });
});

// @desc Get lead
// @route GET /api/leads/:id
// @access Private
const getLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lead = await Lead.findOne({ _id: id });
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found!!!!");
    }
    return res.json(lead);
});

// @desc Allocate new lead
// @route PATCH /api/leads/:id
// @access Private
const allocateLead = asyncHandler(async (req, res) => {
    // Check if screener exists in the request
    if (!req.screener) {
        throw new Error("Screener not found");
    }

    const { id } = req.params;
    const screenerId = req.screener._id.toString();

    const lead = await Lead.findByIdAndUpdate(
        id,
        { screenerId },
        { new: true }
    );

    if (!lead) {
        throw new Error("Lead not found"); // This error will be caught by the error handler
    }

    // Send the updated lead as a JSON response
    return res.json(lead); // This is a successful response
});

// @desc Get Allocated Leads depends on whether if it's admin or a screener.
// @route GET /api/leads/allocated
// @access Private
const allocatedLeads = asyncHandler(async (req, res) => {
    if (req.screener) {
        const page = parseInt(req.query.page) || 1; // current page
        const limit = parseInt(req.query.limit) || 10; // items per page
        const skip = (page - 1) * limit;

        const screenerId = req.screener._id.toString();

        const leads = await Lead.find({ screenerId }).skip(skip).limit(limit);

        const totalLeads = await Lead.countDocuments();

        return res.json({
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            leads,
        });
    } else if (req.admin) {
        const page = parseInt(req.query.page) || 1; // current page
        const limit = parseInt(req.query.limit) || 10; // items per page
        const skip = (page - 1) * limit;

        const leads = await Lead.find({
            screenerId: {
                $exists: true,
                $ne: null,
            },
        })
            .skip(skip)
            .limit(limit);
        const totalLeads = await Lead.countDocuments();

        return res.json({
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            leads,
        });
    }
});

// @desc Putting lead on hold
// @route PATCH /api/leads/hold/:id
// @access Private
const leadOnHold = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
        "screener",
        "admin",
        "creditManager",
        "teamLead",
        "supportAgent",
    ];

    if (!req.employee) {
        res.status(403);
        throw new Error("Not Authorized!!");
    }

    if (!authorizedRoles.includes(req.employee.empRole)) {
        res.status(403);
        throw new Error("Not Authorized to hold a lead!!");
    }
    const lead = await Lead.findByIdAndUpdate(
        id,
        { onHold: true, heldByWhom: req.employee._id },
        { new: true }
    );

    if (!lead) {
        throw new Error("Lead not found");
    }
    res.json(lead);
});

// @desc Get leads on hold depends on if it's admin or an employee
// @route GET /api/leads/hold
// @access Private
const getHoldLeads = asyncHandler(async (req, res) => {
    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
        "screener",
        "admin",
        "creditManager",
        "teamLead",
        "supportAgent",
    ];

    if (!req.employee) {
        res.status(403);
        throw new Error("Not Authorized!!");
    }

    if (!authorizedRoles.includes(req.employee.empRole)) {
        res.status(403);
        throw new Error("Not Authorized to hold a lead!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const heldByWhom = req.employee._id.toString();

    const leads = await Lead.find({ heldByWhom }).skip(skip).limit(limit);

    const totalLeads = await Lead.countDocuments();

    return res.json({
        totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
        currentPage: page,
        leads,
    });
});

export {
    createLead,
    getAllLeads,
    getLead,
    allocateLead,
    allocatedLeads,
    leadOnHold,
    getHoldLeads,
};
