import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Employee from "../models/Employees.js";
import { postLogs } from "./logs.js";
import { uploadDocs, getDocs } from "../utils/docsUploadAndFetch.js";

// @desc Adding file documents to a lead
// @route PATCH /api/leads/docs/:id or /api/applications/docs/:id
// @access Private
export const addDocs = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let employeeId;

    const { remarks } = req.body;

    let lead = await Lead.findById(id);
    if (!lead) {
        throw new Error("Lead not found");
    }

    if (req.screener) {
        employeeId = req.screener._id.toString();
    } else if (req.creditManager) {
        employeeId = req.creditManager._id.toString();
    }

    if (!req.files) {
        res.status(400);
        throw new Error("No files uploaded");
    }

    if (req.screener || req.creditManager) {
        console.log(req.files);
        console.log(req.body);

        const result = await uploadDocs(lead, req.files, remarks);
        // Loop through each field and upload the files to S3
        if (!result) {
            res.status(400);
            throw new Error("Couldn't store documents.");
        }
    } else {
        res.status(401);
        throw new Error("You can't upload documents.");
    }

    const employee = await Employee.findOne({ _id: employeeId });
    const logs = await postLogs(
        lead._id,
        "ADDED DOCUMENTS",
        `${lead.fName} ${lead.mName ?? ""} ${lead.lName}`,
        `Added documents by ${employee.fName} ${employee.lName}`
    );

    res.json({ message: "file uploaded successfully", logs });
});

// @desc Get the docs from a lead/application
// @route GET /api/leads/docs/:id or /api/applications/docs/:id
// @access Private
export const getDocuments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { docType } = req.query;
    const index = Number(req.query.index);

    let lead = await Lead.findById(id);
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found!!!");
    }

    const result = await getDocs(lead, docType, index);

    // Return the pre-signed URL for this specific document
    res.json({
        type: docType,
        url: result.preSignedUrl,
        mimeType: result.mimeType,
    });
});
