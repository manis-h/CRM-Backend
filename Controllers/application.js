import asyncHandler from "../middleware/asyncHandler.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import { postLogs } from "./leads.js";
import { applicantDetails } from "./applicantPersonalDetails.js";
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
        isApproved: { $ne: true },
    };

    const applications = await Application.find(query).skip(skip).limit(limit);
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
    const application = await Application.findOne({ _id: id });
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
    );

    if (!application) {
        throw new Error("Application not found"); // This error will be caught by the error handler
    }
    const employee = await Employee.findOne({ _id: creditManagerId });
    const logs = await postLogs(
        application.lead._id,
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
    if (req.employee.empRole === "admin") {
        query = {
            creditManagerId: {
                $exists: true,
                $ne: null,
            },
            onHold: { $exists: false, $ne: true },
            isRejected: { $exists: false, $ne: true },
            isApproved: { $ne: true },
        };
    } else if (req.employee.empRole === "creditManager") {
        query = {
            creditManagerId: req.employee.id,
            onHold: { $ne: true },
            isRejected: { $ne: true },
            isApproved: { $ne: true },
        };
    } else {
        res.status(401);
        throw new Error("Not authorized!!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;
    const applications = await Application.find(query).skip(skip).limit(limit);

    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Putting application on hold
// @route PATCH /api/applications/hold/:id
// @access Private
export const applicationOnHold = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
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
        throw new Error("Not Authorized to hold a application!!");
    }
    const application = await Application.findByIdAndUpdate(
        id,
        { onHold: true, heldBy: req.employee._id },
        { new: true }
    );

    if (!application) {
        throw new Error("Application not found");
    }

    const employee = await Employee.findOne({ _id: req.employee._id });
    const logs = await postLogs(
        application.lead._id,
        "APPLICATION ON HOLD",
        `${application.lead.fName} ${application.lead.mName ?? ""} ${
            application.lead.lName
        }`,
        `Application on hold by ${employee.fName} ${employee.lName}`
    );
    res.json({ application, logs });
});

// @desc Unhold application
// @route PATCH /api/applications/unhold/:id
// @access Private
export const unHoldApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
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
        throw new Error("Not Authorized to unhold a application!!");
    }
    const application = await Application.findByIdAndUpdate(
        id,
        { onHold: false },
        { new: true }
    );

    if (!application) {
        throw new Error("Application not found");
    }
    const employee = await Employee.findOne({ _id: req.employee._id });
    const logs = await postLogs(
        application.lead._id,
        "APPLICATION UNHOLD",
        `${application.lead.fName} ${application.lead.mName ?? ""} ${
            application.lead.lName
        }`,
        `Application unhold by ${employee.fName} ${employee.lName}`
    );
    res.json({ application, logs });
});

// @desc Get applications on hold depends on if it's admin or an employee
// @route GET /api/applications/hold
// @access Private
export const getHoldApplication = asyncHandler(async (req, res) => {
    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
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
        throw new Error("Not Authorized!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const employeeId = req.employee._id.toString();

    let query = { isHold: true, isApproved: { $ne: true } };

    // If the employee is not admint, they only see the leads they rejected
    if (req.employee.empRole !== "admin") {
        query = {
            ...query,
            heldBy: employeeId,
        };
    }

    const applications = await Application.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Rejecting an application
// @route PATCH /api/applications/reject/:id
// @access Private
export const applicationReject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
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
        throw new Error("Not Authorized to reject an application!!");
    }
    const application = await Application.findByIdAndUpdate(
        id,
        { isRejected: true, rejectedBy: req.employee._id },
        { new: true }
    );

    if (!application) {
        throw new Error("Lead not found");
    }
    const employee = await Employee.findOne({ _id: req.employee._id });
    const logs = await postLogs(
        application.lead._id,
        "APPLICATION REJECTED",
        `${application.lead.fName} ${application.lead.mName ?? ""} ${
            application.lead.lName
        }`,
        `Application rejected by ${employee.fName} ${employee.lName}`
    );
    res.json({ application, logs });
});

// @desc Get rejected applications depends on if it's admin or an employee
// @route GET /api/applications/reject
// @access Private
export const getRejectedApplication = asyncHandler(async (req, res) => {
    // List of roles that are authorized to hold a lead
    const authorizedRoles = [
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
        throw new Error("Not Authorized!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const employeeId = req.employee._id.toString();

    let query = { isRejected: true, isApproved: { $exists: false, $ne: true } };

    // If the employee is not admint, they only see the leads they rejected
    if (req.employee.empRole !== "admin") {
        query = {
            ...query,
            rejectedBy: employeeId,
        };
    }

    // Fetch the leads based on roles
    const applications = await Application.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Add the Personal  Details to the Application By CreditManager
// @route Post /api/applications/addPersonalDeatils/:id
// @access Private
export const addPersonalDeatils = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; //Application Id
        const creditManagerId = req.creditManager._id.toString(); // Assuming you have creditManager attached to req

        // Find the application by its ID
        const application = await Application.findById(id);

        if (!application) {
            return res.status(401).json({
                success: false,
                message: "No application related to that ID",
            });
        }

        // Find the Lead from the application
        const { pan, fName, lName, dob, mobile, personalEmail, officeEmail } =
            application.lead;
        const details = {
            pan,
            fName,
            lName,
            dob,
            mobile,
            personalEmail,
            officeEmail,
        };

        // Create a new instance of ApplicationPersonalDetails model with personal details
        const personalDetailsDocument = new ApplicationPersonalDetails({
            personalDetails: details,
        });

        console.log("Here are the personal details:", personalDetailsDocument);

        // Save the new personal details document
        await personalDetailsDocument.save();

        return res.status(200).json({
            success: true,
            message: "Personal details added successfully",
            data: personalDetailsDocument,
        });
    } catch (error) {
        console.log(
            "Error while creating the Personal Details:",
            error.message
        );
        return res.status(500).json({
            success: false,
            message: `There was an error while creating personal details: ${error.message}`,
        });
    }
});

// @desc Add  the Personal  Details to the Application By CreditManager
// @route Post /api/applications/addPersonalDeatils/:id
// @access Private
export const getApplicantPersonalDetails = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; //Application Id
        const creditManagerId = req.creditManager._id.toString(); // Assuming you have creditManager attached to req

        // Find the application by its ID
        const application = await Application.findById(id);

        // Find the Lead from the application
        const lead = application.lead;
        if (!lead) {
            return res.status(401).json({
                success: false,
                message: "No lead information found in the application",
            });
        }

        console.log("The lead is here ", lead);
        return res.status(200).json({
            message: "Applicant lead details is here ",
            deatils: lead,
        });
    } catch (error) {
        console.log(
            "Error while getting  the Personal Details: of the applicant",
            error.message
        );
        return res.status(500).json({
            success: false,
            message: `There was an error while creating personal details: ${error.message}`,
        });
    }
});

// @desc Forward the Application to Sanction head
// @route Patch /api/applications/forward/:id
// @access Private
export const forwardApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const creditManagerId = req.creditManager._id.toString();

    // Find the application by its ID
    const application = await Application.findById(id);

    if (!application) {
        throw new Error("Application not found"); // This error will be caught by the error handler
    }

    // Check if the lead has been rejected
    if (!application.creditManagerId) {
        res.status(400);
        throw new Error(
            "Application has to be allocated to a credit manager first for investigation."
        );
    } else if (application.isRejected) {
        res.status(400);
        throw new Error(
            "Application has been rejected and cannot be approved."
        );
    } else if (application.isHold) {
        res.status(400);
        throw new Error("Application is on hold, please unhold it first.");
    }

    // Approve the lead by updating its status
    application.isForwarded = true;
    application.forwardedBy = creditManagerId;
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

// @desc Adding CAM details
// @route POST /api/applications/cam/:id
// @access Private
export const postCamDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { details } = req.body;

    const application = await Application.findById(id);
    if (!application) {
        res.status(404);
        throw new Error("Application not found!!");
    }

    await CamDetails.create({
        details: details,
    });

    res.json({ success: true });
});

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

    const cam = await camDetails.findOne({
        "details.leadId": application.lead._id.toString(),
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

    const application = await Application.findById(id);
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
