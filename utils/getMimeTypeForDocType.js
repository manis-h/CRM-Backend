// Helper function to get MIME type based on document type
const getMimeTypeForDocType = (docType) => {
    switch (docType) {
        case "aadhaarFront":
        case "aadhaarBack":
            return "image/png"; // or "image/jpeg" depending on your format
        case "panCard":
            return "image/jpeg";
        case "bankStatement":
        case "salarySlip":
            return "application/pdf";
        default:
            return "application/octet-stream";
    }
};

export default getMimeTypeForDocType;
