import Applicant from "../models/Applicant.js";
import Bank from "../models/ApplicantBankDetails.js";
import CamDetails from "../models/CAM.js";

export const checkApproval = async (
    lead,
    application,
    screenerId,
    creditManagerId
) => {
    try {
        const requiredDocs = [
            "aadhaarFront",
            "aadhaarBack",
            "panCard",
            "bankStatement",
            "salarySlip",
        ];

        if (screenerId) {
            if (lead.screenerId._id.toString() !== screenerId) {
                return {
                    approved: false,
                    message: "You are not authorized to approve this lead!!",
                };
            }
            // Check if the lead has been rejected
            if (!lead.screenerId) {
                res.status(400);
                throw new Error(
                    "Lead has to be allocated to a screener first for investigation."
                );
            }
            if (lead.isRejected) {
                res.status(400);
                throw new Error(
                    "Lead has been rejected and cannot be approved."
                );
            }
            if (lead.isHold) {
                res.status(400);
                throw new Error("Lead is on hold, please unhold it first.");
            }

            if (!lead.isEmailVerified) {
                return { approved: false, message: "Email is not verified!!" };
            }

            if (!lead.isAadhaarVerified) {
                return {
                    approved: false,
                    message: "Aadhaar is not verified!!",
                };
            }

            if (!lead.isPanVerified) {
                return { approved: false, message: "Pan is not verified!!" };
            }

            if (!lead.cibilScore) {
                return { approved: false, message: "CIBIL score is missing!!" };
            }
            // Check if all the required documents are present
            const uploadedDocs = lead.document.map((doc) => doc.type);
            const missingDocs = requiredDocs.filter(
                (docType) => !uploadedDocs.includes(docType)
            );

            if (missingDocs.length > 0) {
                return {
                    approved: false,
                    message: `Missing documents: ${missingDocs.join(", ")}`,
                };
            }
            // If all checks pass, approve the lead
            return { approved: true, message: "Lead can be approved" };
        } else if (creditManagerId) {
            if (
                application.creditManagerId._id.toString() !== creditManagerId
            ) {
                return {
                    approved: false,
                    message:
                        "You are not authorized to approve this application!!",
                };
            }
            // Check if the lead has been rejected
            if (!application.creditManagerId) {
                return {
                    approved: false,
                    message:
                        "Application has to be allocated to a credit manager first for investigation.",
                };
            }
            if (application.isRejected) {
                return {
                    approved: false,
                    message:
                        "Application has been rejected and cannot be approved.",
                };
            }
            if (application.isHold) {
                return {
                    approved: false,
                    message: "Application is on hold, please unhold it first.",
                };
            }

            // Validation to check if Applicant fields are not empty
            const applicant = application.applicant;
            const personalDetails = await Applicant.findById(applicant);
            if (
                !personalDetails.personalDetails ||
                Object.keys(personalDetails.personalDetails).length === 0 ||
                !personalDetails.residence ||
                Object.keys(personalDetails.residence).length === 0 ||
                !personalDetails.employment ||
                Object.keys(personalDetails.employment).length === 0 ||
                !personalDetails.reference ||
                Object.keys(personalDetails.reference).length === 0
            ) {
                return {
                    approved: false,
                    message:
                        "All applicant details (personalDetails, residence, employment, and reference) must be provided and cannot be empty.",
                };
            }

            // Check if the applicant's bank details are present and not empty
            const bankDetails = await Bank.findOne({ borrowerId: applicant });
            if (
                !bankDetails ||
                !bankDetails.bankName ||
                !bankDetails.branchName ||
                !bankDetails.bankAccNo ||
                !bankDetails.ifscCode ||
                !bankDetails.beneficiaryName ||
                !bankDetails.accountType
            ) {
                return {
                    approved: false,
                    message:
                        "Applicant's bank details are missing or incomplete.",
                };
            }

            // Check if CAM details are present and not empty
            const camDetails = await CamDetails.findOne({
                leadId: application.lead._id.toString(),
            });

            if (
                !camDetails ||
                !camDetails.details ||
                Object.keys(camDetails.details).length === 0
            ) {
                return {
                    approved: false,
                    message: "CAM details are missing or incomplete.",
                };
            }

            // If all checks pass, approve the lead
            return { approved: true, message: "Application can be approved" };
        }
    } catch (error) {
        console.error("Error checking lead approval:", error);
        return { approved: false, message: "Error while checking approval" };
    }
};
