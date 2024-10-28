import {
    uploadFilesToS3,
    deleteFilesFromS3,
    generatePresignedUrl,
} from "../config/uploadFilesToS3.js";
import getMimeTypeForDocType from "../utils/getMimeTypeForDocType.js";
import Lead from "../models/Leads.js";

export const uploadDocs = async (lead, files, remarks, options = {}) => {
    const { isBuffer = false, buffer, fieldName = "" } = options;

    // Prepare an array to store all upload promises
    const uploadPromises = [];
    const singleDocUpdates = [];
    const multipleDocUpdates = {
        bankStatement: [],
        salarySlip: [],
        others: [],
    };

    if (isBuffer && fieldName) {
        // Handle buffer
        const key = `${lead._id}/${fieldName}-${Date.now()}.pdf`;

        // Check if the document type already exists in the lead's document.singleDocument array
        const existingDocIndex = lead.document.singleDocuments.findIndex(
            (doc) => doc.type === fieldName
        );

        if (existingDocIndex !== -1) {
            // Old file URL stored in document
            const oldFileKey =
                lead.document.singleDocuments[existingDocIndex].url;
            if (oldFileKey) {
                uploadPromises.push(
                    deleteFilesFromS3(oldFileKey).then(async () => {
                        const res = await uploadFilesToS3(buffer, key);
                        lead.document.singleDocuments[existingDocIndex].url =
                            res.Key;
                    })
                );
            }
        } else {
            // If document type does not exist, add it to the document array
            uploadPromises.push(
                uploadFilesToS3(buffer, key).then((res) => {
                    singleDocUpdates.push({
                        type: fieldName,
                        url: res.Key,
                    });
                })
            );
        }
    } else {
        // Loop through each field and upload the files to S3
        for (const fieldName in files) {
            const fileArray = files[fieldName];
            const isSingleType = [
                "aadhaarFront",
                "aadhaarBack",
                "eAadhaar",
                "panCard",
                "cibilReport",
                "sanctionLetter",
            ].includes(fieldName);

            if (isSingleType) {
                const file = fileArray[0]; // Get the first file for each field
                const key = `${lead._id}/${fieldName}-${Date.now()}-${
                    file.originalname
                }`; // Construct a unique S3 key
                // Check if the document type already exists in the lead's document array
                const existingDocIndex =
                    lead.document.singleDocuments.findIndex(
                        (doc) => doc.type === fieldName
                    );

                if (existingDocIndex !== -1) {
                    // Old file URL stored in document
                    const oldFileKey =
                        lead.document.singleDocuments[existingDocIndex].url;
                    if (oldFileKey) {
                        uploadPromises.push(
                            // Delete the old files fro S3
                            deleteFilesFromS3(oldFileKey).then(async () => {
                                // upload the new file
                                const res = await uploadFilesToS3(
                                    file.buffer,
                                    key
                                );
                                // Update the existing document's URL
                                lead.document.singleDocuments[
                                    existingDocIndex
                                ].url = res.Key;

                                lead.document.singleDocuments[
                                    existingDocIndex
                                ].remarks = remarks;
                            })
                        );
                    }
                } else {
                    // If document type does not exist, add it to the document array
                    uploadPromises.push(
                        uploadFilesToS3(file.buffer, key).then((res) => {
                            singleDocUpdates.push({
                                type: fieldName,
                                url: res.Key,
                                remarks,
                            });
                        })
                    );
                }
            } else {
                // Iterate through each file for multipleDocuments and handle remarks as array
                fileArray.forEach((file, index) => {
                    // Get the current count of documents for this field in the database
                    const existingDocsCount =
                        lead.document.multipleDocuments[fieldName]?.length || 0;

                    const name = `${fieldName}_${
                        existingDocsCount + index + 1
                    }`;
                    const key = `${
                        lead._id
                    }/${fieldName}/${fieldName}-${Date.now()}-${
                        file.originalname
                    }`;
                    const fileRemark = Array.isArray(remarks)
                        ? remarks[index]
                        : remarks; // Get corresponding remark for each file

                    uploadPromises.push(
                        uploadFilesToS3(file.buffer, key).then((res) => {
                            multipleDocUpdates[fieldName].push({
                                name: name,
                                url: res.Key,
                                remarks: fileRemark,
                            });
                        })
                    );
                });
            }
        }
    }

    // Wait for all files to be uploaded
    await Promise.all(uploadPromises);

    if (singleDocUpdates.length > 0) {
        lead.document.singleDocuments.push(...singleDocUpdates);
    }

    for (const [field, docs] of Object.entries(multipleDocUpdates)) {
        if (docs.length > 0) {
            lead.document.multipleDocuments[field].push(...docs);
        }
    }

    // Use findByIdAndUpdate to only update the document field
    const updatedLead = await Lead.findByIdAndUpdate(
        lead._id,
        { document: lead.document },
        { new: true, runValidators: false } // Disable validation for other fields
    );

    if (!updatedLead) {
        return { success: false };
    }
    return { success: true };
};

export const getDocs = async (lead, docType, docId) => {
    // Find the specific document based on docType
    let document;
    const isSingleType = [
        "aadhaarFront",
        "aadhaarBack",
        "eAadhaar",
        "panCard",
        "cibilReport",
        "sanctionLetter",
    ].includes(docType);

    if (isSingleType) {
        document = lead.document.singleDocuments.find(
            (doc) => doc.type === docType
        );
    } else {
        document = lead.document.multipleDocuments[docType]?.find(
            (doc) => doc._id.toString() === docId
        );
    }

    if (!document) {
        res.status(404);
        throw new Error(`Document of type ${docType} not found`);
    }

    const mimeType = getMimeTypeForDocType(document.url, docType);

    // Generate a pre-signed URL for this specific document
    const preSignedUrl = generatePresignedUrl(document.url, mimeType);

    return { preSignedUrl, mimeType };
};
