// Helper function to get MIME type based on document type
const getMimeTypeForDocType = (docType) => {
    switch (docType) {
        case "aadhaarFront":
        case "aadhaarBack":
        case "panCard":
            return "image/jpg";
        case "bankStatement":
        case "salarySlip":
            return "application/pdf";
        case "verificationVideo":
            return "video/mp4";
        default:
            return "application/octet-stream";
    }
};

export default getMimeTypeForDocType;
