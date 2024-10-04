import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import LogHistory from "../models/LeadLogHistory.js";
import { applicantDetails } from "./applicantPersonalDetails.js";
import sendEmail from "../utils/sendEmail.js";
import generateRandomNumber from "../utils/generateRandomNumbers.js";

// @desc Create loan leads
// @route POST /api/leads
// @access Public
export const createLead = asyncHandler(async (req, res) => {
    const {
        fName,
        mName,
        lName,
        gender,
        dob,
        aadhaar,
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
        source,
    } = req.body;
    const newLead = await Lead.create({
        fName,
        mName: mName ?? "",
        lName: lName ?? "",
        gender,
        dob,
        aadhaar,
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
        source,
    });
    // viewLeadsLog(req, res, status || '', borrower || '', leadRemarks = '');
    const logs = await postLogs(
        newLead._id,
        "NEW LEAD",
        `${newLead.fName} ${newLead.mName ?? ""} ${newLead.lName}`,
        "New lead created"
    );
    return res.json({ newLead, logs });
});

// @desc Get all leads
// @route GET /api/leads
// @access Private
export const getAllLeads = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const query = {
        $or: [{ screenerId: { $exists: false } }, { screenerId: null }],
        isApproved: { $ne: true },
    };

    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
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

// @desc Get lead
// @route GET /api/leads/:id
// @access Private
export const getLead = asyncHandler(async (req, res) => {
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
export const allocateLead = asyncHandler(async (req, res) => {
    // Check if screener exists in the request
    const { id } = req.params;
    let screenerId;

    if (req.admin) {
        screenerId = req.body.screenerId;
    } else {
        screenerId = req.screener._id.toString();
    }
    if (!req.screener) {
        throw new Error("Screener not found");
    }

    const lead = await Lead.findByIdAndUpdate(
        id,
        { screenerId },
        { new: true }
    );

    if (!lead) {
        throw new Error("Lead not found"); // This error will be caught by the error handler
    }
    const employee = await Employee.findOne({ _id: screenerId });
    const logs = await postLogs(
        lead._id,
        "LEAD IN PROCESS",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead allocated to ${employee.fName} ${employee.lName}`
    );

    // Send the updated lead as a JSON response
    return res.json({ lead, logs }); // This is a successful response
});

// @desc Get Allocated Leads depends on whether if it's admin or a screener.
// @route GET /api/leads/allocated
// @access Private
export const allocatedLeads = asyncHandler(async (req, res) => {
    let query;
    if (req.employee.empRole === "admin") {
        query = {
            screenerId: {
                $exists: true,
                $ne: null,
            },
            onHold: { $exists: false, $ne: true },
            isRejected: { $exists: false, $ne: true },
            isApproved: { $ne: true },
        };
    } else if (req.employee.empRole === "screener") {
        query = {
            screenerId: req.employee.id,
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
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
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

// @desc Update allocated lead's details
// @route PATCH /api/leads/update/:id
// @access Private
export const updateLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
        res.status(400);
        throw new Error(
            "Id is required to fetch the lead from the collection!!"
        );
    }

    // Fetch the lead to check the screenerId
    const lead = await Lead.findById(id);

    if (!lead) {
        res.status(404);
        throw new Error("No lead found!!");
    }

    // Check if screenerId matches the one in the lead document
    if (lead.screenerId.toString() !== req.employee._id.toString()) {
        res.status(403);
        throw new Error("Unauthorized: You can not update this lead!!");
    }

    const updatedLead = await Lead.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    const employee = await Employee.findOne({
        _id: req.employee._id.toString(),
    });
    const logs = await postLogs(
        lead._id,
        "LEAD UPDATED",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead details updated by ${employee.fName} ${employee.lName}`
    );

    // Send the updated lead as a JSON response
    return res.json({ updatedLead, logs }); // This is a successful response
});

// @desc Putting lead on hold
// @route PATCH /api/leads/hold/:id
// @access Private
export const leadOnHold = asyncHandler(async (req, res) => {
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

    const employee = await Employee.findOne({ _id: req.employee._id });
    const logs = await postLogs(
        lead._id,
        "LEAD ON HOLD",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead on hold by ${employee.fName} ${employee.lName}`
    );
    res.json({ lead, logs });
});

// @desc Unhold lead
// @route PATCH /api/leads/unhold/:id
// @access Private
export const unHoldLead = asyncHandler(async (req, res) => {
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
        { onHold: false },
        { new: true }
    );

    if (!lead) {
        throw new Error("Lead not found");
    }
    const employee = await Employee.findOne({ _id: req.employee._id });
    const logs = await postLogs(
        lead._id,
        "LEAD UNHOLD",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead unhold by ${employee.fName} ${employee.lName}`
    );
    res.json({ lead, logs });
});

// @desc Get leads on hold depends on if it's admin or an employee
// @route GET /api/leads/hold
// @access Private
export const getHoldLeads = asyncHandler(async (req, res) => {
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
        throw new Error("Not Authorized!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const employeeId = req.employee._id.toString();

    let query = { onHold: true, isApproved: { $ne: true } };

    // If the employee is not admint, they only see the leads they rejected
    if (req.employee.empRole !== "admin") {
        query = {
            ...query,
            heldBy: employeeId,
        };
    }

    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
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
export const leadReject = asyncHandler(async (req, res) => {
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
        throw new Error("Not Authorized to reject a lead!!");
    }
    const lead = await Lead.findByIdAndUpdate(
        id,
        { isRejected: true, rejectedBy: req.employee._id },
        { new: true }
    );

    if (!lead) {
        throw new Error("Lead not found");
    }
    const employee = await Employee.findOne({ _id: req.employee._id });
    const logs = await postLogs(
        lead._id,
        "LEAD REJECTED",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead rejected by ${employee.fName} ${employee.lName}`
    );
    res.json({ lead, logs });
});

// @desc Get rejected leads depends on if it's admin or an employee
// @route GET /api/leads/reject
// @access Private
export const getRejectedLeads = asyncHandler(async (req, res) => {
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
        throw new Error("Not Authorized!!");
    }
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const employeeId = req.employee._id.toString();

    let query = { isRejected: true, isApproved: { $ne: true } };

    // If the employee is not admint, they only see the leads they rejected
    if (req.employee.empRole !== "admin") {
        query = {
            ...query,
            rejectedBy: employeeId,
        };
    }

    // Fetch the leads based on roles
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
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
export const internalDedupe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lead = await Lead.findById(id).sort({ createdAt: -1 });

    if (!lead) {
        res.status(404);
        throw new Error("No previous leads found!!");
    }

    const { aadhaar, pan } = lead;

    // Now find all other leads with the same aadhaar or pan
    const relatedLeads = await Lead.find({
        _id: { $ne: id }, // Exclude the original lead
        $or: [{ aadhaar: aadhaar }, { pan: pan }],
    });

    return res.json({
        relatedLeads,
    });
});

// @desc Post leads logs with status
// @access Private
export const postLogs = async (
    leadId = "",
    leadStatus = "",
    borrower = "",
    leadRemark = ""
) => {
    try {
        // Check if the lead is present
        const lead = await Lead.findOne({ _id: leadId });

        if (!lead) {
            res.status(404);
            throw new Error("No lead found!!!");
        }

        // Create the new log initally
        const createloghistory = await LogHistory.create({
            lead: leadId,
            logDate: new Date(),
            status: leadStatus,
            borrower: borrower,
            leadRemark: leadRemark,
        });
        return createloghistory;
    } catch (error) {
        throw new Error(error.message);
    }
};

// @desc Get leads logs with status
// @route GET /api/lead/viewleaadlog
// @access Private
export const viewLeadLogs = asyncHandler(async (req, res) => {
    // Fetch the lead id
    const { leadId } = req.params;

    // Check if the lead is present
    const leadDetails = await LogHistory.find({ lead: leadId }).sort({
        logDate: -1,
    });

    if (!leadDetails) {
        res.status(404);
        throw new Error("No lead found!!!");
    }

    res.json(leadDetails);
});

// @desc Approve the lead
// @route Patch /api/lead/approve/:id
// @access Private
export const approveLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const screenerId = req.screener._id.toString();

    // Find the lead by its ID
    const lead = await Lead.findById(id);

    if (!lead) {
        throw new Error("Lead not found"); // This error will be caught by the error handler
    }

    // Check if the lead has been rejected
    if (!lead.screenerId) {
        res.status(400);
        throw new Error(
            "Lead has to be allocated to a screener first for investigation."
        );
    } else if (lead.isRejected) {
        res.status(400);
        throw new Error("Lead has been rejected and cannot be approved.");
    } else if (lead.isHold) {
        res.status(400);
        throw new Error("Lead is on hold, please unhold it first.");
    }

    // Approve the lead by updating its status
    lead.isApproved = true;
    lead.approvedBy = screenerId;
    await lead.save();

    const employee = await Employee.findOne({ _id: screenerId });
    const screenerName = `${employee?.fName} ${employee?.lName}`;

    const {
        pan,
        aadhaar,
        fName,
        mName,
        lName,
        gender,
        dob,
        mobile,
        alternateMobile,
        personalEmail,
        officeEmail,
    } = lead;
    const details = {
        pan,
        aadhaar,
        fName,
        mName,
        lName,
        gender,
        dob,
        mobile,
        alternateMobile,
        personalEmail,
        officeEmail,
        screenedBy: screenerName,
    };
    const applicant = await applicantDetails(details);

    const newApplication = new Application({
        lead: lead,
        applicant: applicant._id,
    });
    const response = await newApplication.save();

    const logs = await postLogs(
        lead._id,
        "LEAD APPROVED. TRANSFERED TO CREDIT MANAGER",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead approved by ${employee.fName} ${employee.lName}`
    );

    // Send the approved lead as a JSON response
    return res.json({ response, logs }); // This is a successful response
});

// @desc verify email
// @route PATCH /api/verify/email/:id
// @access Private
export const emailVerify = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (lead.screenerId.toString() !== req.employee._id.toString()) {
        res.status(401);
        throw new Error("You are not authorized!!");
    }

    if (lead.isEmailVerified) {
        res.json({ success: false, message: "Email is already verified!!" });
    }

    const otp = generateRandomNumber();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Calculate expiry time

    lead.emailOtp = otp;
    lead.emailOtpExpiredAt = otpExpiry;
    await lead.save();

    if (!lead) {
        res.status(404);
        throw new Error("No lead found!!");
    }

    // Perform the email API request or other actions here
    const response = await sendEmail(
        req.employee.email,
        lead.personalEmail,
        `${lead.fName} ${lead.mName} ${lead.lName}`,
        "Email Verfication",
        otp
    );

    res.json({ message: response.message });
});

// @desc Verify email OTP
// @route PATCH /api/verify/email-otp/:id
// @access Private
export const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { otp } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
        res.status(404);
        throw new Error("Lead not found!!!");
    }

    if (lead.screenerId.toString() !== req.employee._id.toString()) {
        res.status(401);
        throw new Error("You are not authorized!!");
    }

    // Check if the OTP has expired
    const currentTime = new Date();
    if (currentTime > lead.emailOtpExpiredAt) {
        res.status(400);
        throw new Error("OTP has expired");
    }

    // Check if the OTP matches
    if (lead.emailOtp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    lead.isEmailVerified = true;
    await lead.save();

    res.json({
        success: true,
        message: "Email is now verified.",
    });
});
