import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
// import {viewLeadsLog} from './viewLeadsLogs.js;'

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
    // viewLeadsLog(req, res, status || '', borrower || '', leadRemarks = '');
    // viewLeadsLog(status='LEAD-NEW', borrower=fName + ' ' + mName + ' ' + lName);
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
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const totalLeads = await Lead.countDocuments({ screenerId: null });

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
    let query;
    if (req.employee.empRole === "admin") {
        query = {
            screenerId: {
                $exists: true,
                $ne: null,
            },
            onHold: false,
            isRejected: false,
        };
    } else if (req.employee.empRole === "screener") {
        query = {
            screenerId: req.employee.id,
            onHold: false,
            isRejected: false,
        };
    } else {
        res.status(401);
        throw new Error("Not authorized!!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;
    const leads = await Lead.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    const totalLeads = await Lead.countDocuments(query);
    return res.json({
        totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
        currentPage: page,
        leads,
    });
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
        { onHold: true, heldBy: req.employee._id },
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

    const employeeId = req.employee._id.toString();

    let query = { isHold: true };

    // If the employee is not admint, they only see the leads they rejected
    if (req.employee.empRole !== "admin") {
        query = {
            ...query,
            heldBy: employeeId,
        };
    }

    const leads = await Lead.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    const totalLeads = await Lead.countDocuments(query);

    return res.json({
        totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
        currentPage: page,
        leads,
    });
});

// @desc Rejecting a lead
// @route PATCH /api/leads/reject/:id
// @access Private
const leadReject = asyncHandler(async (req, res) => {
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
        { isRejected: true, rejectedBy: req.employee._id },
        { new: true }
    );

    if (!lead) {
        throw new Error("Lead not found");
    }
    res.json(lead);
});

// @desc Get rejected leads depends on if it's admin or an employee
// @route GET /api/leads/reject
// @access Private
const getRejectedLeads = asyncHandler(async (req, res) => {
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

    const employeeId = req.employee._id.toString();

    let query = { isRejected: true };

    // If the employee is not admint, they only see the leads they rejected
    if (req.employee.empRole !== "admin") {
        query = {
            ...query,
            rejectedBy: employeeId,
        };
    }

    // Fetch the leads based on roles
    const leads = await Lead.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    const totalLeads = await Lead.countDocuments(query);

    return res.json({
        totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
        currentPage: page,
        leads,
    });
});

// @desc Internal Dedupe (Old history)
// @route GET /api/leads/old-history/:id
// @access Private
const internalDedupe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const leads = await Lead.find(id).sort({ _id: -1 });

    if (!leads) {
        return res.json({
            message: "No previous leads found!!",
            leads,
        });
    }

    return res.json({
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
    leadReject,
    getRejectedLeads,
    internalDedupe,
};
