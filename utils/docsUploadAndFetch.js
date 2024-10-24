import {
    uploadFilesToS3,
    deleteFilesFromS3,
    generatePresignedUrl,
} from "../config/uploadFilesToS3.js";
import getMimeTypeForDocType from "../utils/getMimeTypeForDocType.js";
import Lead from "../models/Leads.js";

export const uploadDocs = async (lead, files, options = {}) => {
    const { isBuffer = false, buffer, fieldName = "" } = options;

    // Prepare an array to store all upload promises
    const uploadPromises = [];
    const documentUpdates = [];

    if (isBuffer && fieldName) {
        // Handle buffer
        const key = `${lead._id}/${fieldName}-${Date.now()}.pdf`;

        // Check if the document type already exists in the lead's document array
        const existingDocIndex = lead.document.findIndex(
            (doc) => doc.type === fieldName
        );

        if (existingDocIndex !== -1) {
            // Old file URL stored in document
            const oldFileKey = lead.document[existingDocIndex].url;
            if (oldFileKey) {
                uploadPromises.push(
                    deleteFilesFromS3(oldFileKey).then(async () => {
                        const res = await uploadFilesToS3(buffer, key);
                        lead.document[existingDocIndex].url = res.Key;
                    })
                );
            }
        } else {
            // If document type does not exist, add it to the document array
            uploadPromises.push(
                uploadFilesToS3(buffer, key).then((res) => {
                    documentUpdates.push({
                        type: fieldName,
                        url: res.Key,
                    });
                })
            );
        }
    } else {
        // Loop through each field and upload the files to S3
        for (const fieldName in files) {
            const file = files[fieldName][0]; // Get the first file for each field
            const key = `${lead._id}/${fieldName}-${Date.now()}-${
                file.originalname
            }`; // Construct a unique S3 key

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
                        deleteFilesFromS3(oldFileKey).then(async () => {
                            // upload the new file
                            const res = await uploadFilesToS3(file.buffer, key);
                            // Update the existing document's URL
                            lead.document[existingDocIndex].url = res.Key;
                        })
                    );
                }
            } else {
                // If document type does not exist, add it to the document array
                uploadPromises.push(
                    uploadFilesToS3(file.buffer, key).then((res) => {
                        documentUpdates.push({
                            type: fieldName,
                            url: res.Key,
                        });
                    })
                );
            }
        }
    }

    // Wait for all files to be uploaded
    await Promise.all(uploadPromises);

    // If there are new documents to be added, push them to the document array
    if (documentUpdates.length > 0) {
        lead.document.push(...documentUpdates);
    }

    // Use findByIdAndUpdate to only update the document field
    const updatedLead = await Lead.findByIdAndUpdate(
        lead._id,
        { document: lead.document }, // Only update the document field
        { new: true, runValidators: false } // Disable validation for other fields
    );

    if (!updatedLead) {
        return { success: false };
    }
    return { success: true };
};

export const getDocs = async (lead, docType) => {
    // Find the specific document based on docType
    let document = lead.document.find((doc) => doc.type === docType);

    if (!document) {
        res.status(404);
        throw new Error(`Document of type ${docType} not found`);
    }

    const mimeType = getMimeTypeForDocType(document.url, document.type);

    // Generate a pre-signed URL for this specific document
    const preSignedUrl = generatePresignedUrl(document.url, mimeType);

    return { preSignedUrl, mimeType };
};
