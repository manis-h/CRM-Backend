import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import { postLogs } from "./logs.js";
import {
    uploadFilesToS3,
    deleteFilesFromS3,
    generatePresignedUrl,
} from "../config/uploadFilesToS3.js";
import getMimeTypeForDocType from "../utils/getMimeTypeForDocType.js";

// @desc Adding file documents to a lead or application
// @route PATCH /api/leads/docs/:id or /api/applications/docs/:id
// @access Private
export const addDocs = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let employeeId;
    let lead;
    let application;

    if (req.screener) {
        employeeId = req.screener._id.toString();

        // Fetch the lead first to check if documents already exist
        lead = await Lead.findById(id);
        if (!lead) {
            res.status(404);
            throw new Error("Lead not found");
        }
    } else if (req.creditManager) {
        employeeId = req.creditManager._id.toString();

        // Fetch the application first to check if documents already exist
        application = await Application.findById(id);
        if (!application) {
            res.status(404);
            throw new Error("Lead not found");
        }
    }

    if (!req.files) {
        res.status(400);
        throw new Error("No files uploaded");
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

    if (req.screener) {
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
    } else if (req.creditManager) {
        // If there are new documents to be added, push them to the document array
        if (documentUpdates.length > 0) {
            application.lead.document.push(...documentUpdates);
        }

        // Use findByIdAndUpdate to only update the document field
        await Application.findByIdAndUpdate(
            id,
            { "lead.document": application.lead.document }, // Only update the document field
            { new: true, runValidators: false } // Disable validation for other fields
        );
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
export const getDocs = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { docType } = req.query;
    let lead;
    let application;
    let document;

    if (req.screener) {
        // Fetch the lead from the database
        lead = await Lead.findById(id);
        if (!lead) {
            res.status(404);
            throw new Error("Lead not found!!!");
        }
        // Find the specific document based on docType
        document = lead.document.find((doc) => doc.type === docType);

        if (!document) {
            res.status(404);
            throw new Error(`Document of type ${docType} not found`);
        }
    } else if (req.creditManager) {
        // Fetch the lead from the database
        application = await Application.findById(id);
        if (!application) {
            res.status(404);
            throw new Error("Application not found!!!");
        }
        // Find the specific document based on docType
        document = application.lead.document.find(
            (doc) => doc.type === docType
        );

        if (!document) {
            res.status(404);
            throw new Error(`Document of type ${docType} not found`);
        }
    }

    const mimeType = getMimeTypeForDocType(document.type);

    // Generate a pre-signed URL for this specific document
    const preSignedUrl = generatePresignedUrl(document.url, mimeType);

    // Return the pre-signed URL for this specific document
    res.json({ type: docType, url: preSignedUrl, mimeType: mimeType });
});
