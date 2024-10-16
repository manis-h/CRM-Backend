import asyncHandler from "../middleware/asyncHandler.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import { postLogs } from "../helper/logs.js";
import { checkApproval } from "../utils/checkApproval.js";
import CamDetails from "../models/CAM.js";

// @desc Get all applications
// @route GET /api/applications
// @access Private
export const getAllApplication = asyncHandler(async (req, res) => {
    if (req.employee.empRole === "screener") {
        res.status(401);
        throw new Error("Screeners doesn't have the authorization.");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const query = {
        $or: [
            { creditManagerId: { $exists: false } },
            { creditManagerId: null },
        ],
        isRecommended: { $ne: true },
    };

    const applications = await Application.find(query)
        .skip(skip)
        .limit(limit)
        .populate("lead");
    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Get application
// @route GET /api/applications/:id
// @access Private
export const getApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id }).populate("lead");
    if (!application) {
        res.status(404);
        throw new Error("Application not found!!!!");
    }
    return res.json(application);
});

// @desc Allocate new application
// @route PATCH /api/applications/:id
// @access Private
export const allocateApplication = asyncHandler(async (req, res) => {
    // Check if screener exists in the request
    const { id } = req.params;
    let creditManagerId;

    if (req.admin) {
        creditManagerId = req.body.creditManagerId;
    } else {
        creditManagerId = req.creditManager._id.toString();
    }
    if (!req.creditManager) {
        throw new Error("Credit Manager not found");
    }

    const application = await Application.findByIdAndUpdate(
        id,
        { creditManagerId },
        { new: true }
    ).populate("lead");

    if (!application) {
        throw new Error("Application not found"); // This error will be caught by the error handler
    }
    const employee = await Employee.findOne({ _id: creditManagerId });
    const logs = await postLogs(
        application.lead,
        "APPLICATION IN PROCESS",
        `${application.lead.fName} ${application.lead.mName ?? ""} ${
            application.lead.lName
        }`,
        `Application allocated to ${employee.fName} ${employee.lName}`
    );

    // Send the updated lead as a JSON response
    return res.json({ application, logs }); // This is a successful response
});

// @desc Get Allocated Applications depends on whether if it's admin or a creditManager.
// @route GET /api/applications/allocated
// @access Private
export const allocatedApplications = asyncHandler(async (req, res) => {
    let query;
    if (
        req.employee.empRole === "admin" ||
        req.employee.empRole === "sanctionHead"
    ) {
        query = {
            creditManagerId: {
                $exists: true,
                $ne: null,
            },
            onHold: { $exists: false, $ne: true },
            isRejected: { $exists: false, $ne: true },
            isRecommended: { $ne: true },
        };
    } else if (req.employee.empRole === "creditManager") {
        query = {
            creditManagerId: req.employee.id,
            onHold: { $ne: true },
            isRejected: { $ne: true },
            isForwarded: { $ne: true },
        };
    } else {
        res.status(401);
        throw new Error("Not authorized!!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;
    const applications = await Application.find(query)
        .skip(skip)
        .limit(limit)
        .populate("lead");

    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Adding CAM details
// @access Private
export const postCamDetails = async (leadId, cibilScore) => {
    const details = { cibilScore: cibilScore };

    await CamDetails.create({
        leadId: leadId,
        details: details,
    });

    return { success: true };
};

// @desc get CAM details
// @route GET /api/applications/cam/:id
// @access Private
export const getCamDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application) {
        res.status(404);
        throw new Error("Application not found!!");
    }

    const cam = await CamDetails.findOne({
        leadId: application.lead,
    });

    if (!cam) {
        return { success: false, message: "No record found!!" };
    }

    res.json({ details: cam });
});

// @desc Update CAM details
// @route PATCH /api/applications/cam/:id
// @access Private
export const updateCamDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { details } = req.body;

    const application = await Application.findById(id).populate("lead");
    if (!application) {
        res.status(404);
        throw new Error("Application not found!!");
    }

    // Find the CamDetails associated with the application (if needed)
    let cam = await camDetails.findOne({
        "details.leadId": application.lead._id.toString(),
    });

    if (!cam) {
        // If no CAM details found then create a new record
        await CamDetails.create({
            details: details,
        });
    } else {
        // Update only the fields that are sent from the frontend
        cam.details = { ...cam.details, ...details };
        await cam.save();
    }

    res.json({ success: true });
});

// @desc Forward the Application to Sanction head
// @route Patch /api/applications/recommended/:id
// @access Private
export const recommendedApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const creditManagerId = req.creditManager._id.toString();

    // Find the application by its ID
    const application = await Application.findById(id).populate("lead");

    if (!application) {
        throw new Error("Application not found"); // This error will be caught by the error handler
    }

    const result = await checkApproval({}, application, "", creditManagerId);

    if (!result.approved) {
        return res.json({ success: false, message: result.message });
    }

    // Approve the lead by updating its status
    application.isRecommended = true;
    application.recommendedBy = creditManagerId;
    await application.save();

    // const newApplication = new Application({ lead: lead });
    // const response = await newApplication.save();

    const employee = await Employee.findOne({ _id: creditManagerId });
    const logs = await postLogs(
        application.lead._id,
        "APPLICATION FORWARDED. TRANSFERED TO SACNTION HEAD",
        `${application.lead.fName} ${application.lead.mName ?? ""} ${
            application.lead.lName
        }`,
        `Application forwarded by ${employee.fName} ${employee.lName}`
    );

    // Send the approved lead as a JSON response
    // return res.json(response, logs); // This is a successful response
    return res.json(logs);
});
