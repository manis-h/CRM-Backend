import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import { postLogs } from "./logs.js";

// @desc Putting lead or application on hold
// @route PATCH /api/leads/hold/:id or /api/applications/hold/:id
// @access Private
export const onHold = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const employee = await Employee.findOne({ _id: req.employee._id });

    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
        "admin",
        "screener",
        "creditManager",
        "sanctionHead",
    ];

    if (!req.employee) {
        res.status(403);
        throw new Error("Not Authorized!!");
    }

    if (!authorizedRoles.includes(req.employee.empRole)) {
        res.status(403);
        throw new Error("Not Authorized to hold!!");
    }

    let lead;
    let application;
    let logs;

    if (req.employee.empRole === "screener") {
        lead = await Lead.findByIdAndUpdate(
            id,
            { onHold: true, heldBy: req.employee._id },
            { new: true }
        );

        if (!lead) {
            throw new Error("Lead not found");
        }

        logs = await postLogs(
            lead._id,
            "LEAD ON HOLD",
            `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
            `Lead on hold by ${employee.fName} ${employee.lName}`,
            `${reason}`
        );
        return res.json({ lead, logs });
    }

    if (
        req.employee.empRole === "creditManager" ||
        req.employee.empRole === "sanctionHead"
    ) {
        application = await Application.findByIdAndUpdate(
            id,
            { onHold: true, heldBy: req.employee._id },
            { new: true }
        );

        if (!application) {
            throw new Error("Application not found");
        }

        logs = await postLogs(
            application.lead._id,
            "APPLICATION ON HOLD",
            `${application.lead.fName} ${application.lead.mName ?? ""} ${
                application.lead.lName
            }`,
            `Application on hold by ${employee.fName} ${employee.lName}`,
            `${reason}`
        );

        return res.json({ application, logs });
    }
});

// @desc Unhold lead or application
// @route PATCH /api/leads/unhold/:id or /api/applications/unhold/:id
// @access Private
export const unHold = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const employee = await Employee.findOne({ _id: req.employee._id });

    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
        "screener",
        "admin",
        "creditManager",
        "sanctionHead",
    ];

    if (!req.employee) {
        res.status(403);
        throw new Error("Not Authorized!!");
    }

    if (!authorizedRoles.includes(req.employee.empRole)) {
        res.status(403);
        throw new Error("Not Authorized to hold a lead!!");
    }

    let lead;
    let application;
    let logs;

    if (req.employee.empRole === "screener") {
        lead = await Lead.findByIdAndUpdate(
            id,
            { onHold: false },
            { new: true }
        );

        if (!lead) {
            throw new Error("Lead not found!!!");
        }

        logs = await postLogs(
            lead._id,
            "LEAD UNHOLD",
            `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
            `Lead unhold by ${employee.fName} ${employee.lName}`,
            `${reason}`
        );
        return res.json({ lead, logs });
    }

    if (req.employee.empRole === "creditManager") {
        application = await Application.findByIdAndUpdate(
            id,
            { onHold: false },
            { new: true }
        );

        if (!application) {
            throw new Error("Application not found!!");
        }

        logs = await postLogs(
            application.lead._id,
            "APPLICATION UNHOLD",
            `${application.lead.fName} ${application.lead.mName ?? ""} ${
                application.lead.lName
            }`,
            `Application unhold by ${employee.fName} ${employee.lName}`,
            `${reason}`
        );
        return res.json({ application, logs });
    }
});

// @desc Get leads on hold depends on if it's admin or an employee
// @route GET /api/leads/hold
// @access Private
export const getHold = asyncHandler(async (req, res) => {
    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
        "screener",
        "admin",
        "creditManager",
        "sanctionHead",
    ];

    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const employeeId = req.employee._id.toString();

    let query = { onHold: true, isApproved: { $ne: true } };

    if (!req.employee) {
        res.status(403);
        throw new Error("Not Authorized!!");
    }

    if (!authorizedRoles.includes(req.employee.empRole)) {
        res.status(403);
        throw new Error("Not Authorized!!");
    }

    // If the employee is not admint, they only see the leads they rejected
    if (
        req.employee.empRole !== "admin" ||
        req.employee.empRole !== "sanctionHead"
    ) {
        query = {
            ...query,
            heldBy: employeeId,
        };
    }

    let leads;
    let applications;
    let totalRecords;

    if (req.employee.empRole === "screener") {
        leads = await Lead.find(query).skip(skip).limit(limit);

        totalRecords = await Lead.countDocuments(query);

        return res.json({
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            leads,
        });
    }
    if (req.employee.empRole === "creditManager") {
        applications = await Application.find(query).skip(skip).limit();
        totalRecords = await Application.countDocuments(query);

        return res.json({
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            applications,
        });
    }
});
