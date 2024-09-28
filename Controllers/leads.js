import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import LogHistory from "../models/LeadLogHistory.js";
import {
    uploadFilesToS3,
    deleteFilesFromS3,
    generatePresignedUrl,
} from "../config/uploadFilesToS3.js";
import getMimeTypeForDocType from "../utils/getMimeTypeForDocType.js";

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
    });
    // viewLeadsLog(req, res, status || '', borrower || '', leadRemarks = '');
    const logs = await postLeadLogs(
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
    const logs = await postLeadLogs(
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

// @desc Adding file documents to a lead
// @route PATCH /api/leads/docs/:id
// @access Private
export const addDocsInLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let employeeId;

    if (req.screener) {
        employeeId = req.screener._id.toString();
    } else if (req.creditManager) {
        employeeId = req.creditManager._id.toString();
    }

    if (!req.files) {
        res.status(400);
        throw new Error("No files uploaded");
    }

    // Fetch the lead first to check if documents already exist
    const lead = await Lead.findById(id);

    if (!lead) {
        res.status(404);
        throw new Error("Lead not found");
    }

    // Prepare an array to store all upload promises
    const uploadPromises = [];
    const documentUpdates = [];

    // Loop through each field and upload the files to S3
    for (const fieldName in req.files) {
        const file = req.files[fieldName][0]; // Get the first file for each field
        const key = `${id}/${fieldName}-${Date.now()}-${file.originalname}`; // Construct a unique S3 key

        // Check if the document type already exists in the lead's document array
        const existingDocIndex = lead.document.findIndex(
            (doc) => doc.type === fieldName
        );

        if (existingDocIndex !== -1) {
            // Old file URL stored in document
            const oldFileKey = lead.document[existingDocIndex].url;
            if (oldFileKey) {
                uploadPromises.push(
                    // Delete the old files fro S3
                    deleteFilesFromS3(oldFileKey).then(() => {
                        // upload the new file
                        return uploadFilesToS3(
                            file.buffer,
                            key,
                            file.mimetype
                        ).then((res) => {
                            // Update the existing document's URL
                            lead.document[existingDocIndex].url = res.Key;
                        });
                    })
                );
            }
        } else {
            // If document type does not exist, add it to the document array
            uploadPromises.push(
                uploadFilesToS3(file.buffer, key, file.mimetype).then((res) => {
                    documentUpdates.push({
                        type: fieldName,
                        url: res.Key,
                    });
                })
            );
        }
    }

    // Wait for all files to be uploaded
    await Promise.all(uploadPromises);

    // If there are new documents to be added, push them to the document array
    if (documentUpdates.length > 0) {
        lead.document.push(...documentUpdates);
    }

    // Use findByIdAndUpdate to only update the document field
    await Lead.findByIdAndUpdate(
        id,
        { document: lead.document }, // Only update the document field
        { new: true, runValidators: false } // Disable validation for other fields
    );

    const employee = await Employee.findOne({ _id: employeeId });
    const logs = await postLeadLogs(
        lead._id,
        "ADDED DOCUMENTS",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Added documents by ${employee.fName} ${employee.lName}`
    );

    res.json({ message: "file uploaded successfully", logs });
});

// @desc Get the docs from a lead
// @route GET /api/leads/hold/:id
// @access Private
export const getDocsFromLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { docType } = req.query;

    // Fetch the lead from the database
    const lead = await Lead.findById(id);
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found!!!");
    }

    // Find the specific document based on docType
    const document = lead.document.find((doc) => doc.type === docType);

    if (!document) {
        res.status(404);
        throw new Error(`Document of type ${docType} not found`);
    }

    // Generate a pre-signed URL for this specific document
    const preSignedUrl = generatePresignedUrl(
        document.url,
        getMimeTypeForDocType(document.type)
    );

    // Return the pre-signed URL for this specific document
    res.json({ type: docType, url: preSignedUrl });
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
    const logs = await postLeadLogs(
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
    const logs = await postLeadLogs(
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

    let query = { isHold: true, isApproved: { $exists: false, $ne: true } };

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
    const logs = await postLeadLogs(
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

    let query = { isRejected: true, isApproved: { $exists: false, $ne: true } };

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
export const postLeadLogs = async (
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

    const newApplication = new Application({ lead: lead });
    const response = await newApplication.save();

    const employee = await Employee.findOne({ _id: screenerId });
    const logs = await postLeadLogs(
        lead._id,
        "LEAD APPROVED. TRANSFERED TO CREDIT MANAGER",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Lead approved by ${employee.fName} ${employee.lName}`
    );

    // Send the approved lead as a JSON response
    return res.json({ response, logs }); // This is a successful response
});
