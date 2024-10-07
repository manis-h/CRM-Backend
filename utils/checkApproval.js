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
            if (lead.screenerId.toString() !== screenerId) {
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
            if (application.creditManagerId.toString() !== creditManagerId) {
                return {
                    approved: false,
                    message:
                        "You are not authorized to approve this application!!",
                };
            }
            // Check if the lead has been rejected
            if (!application.creditManagerId) {
                res.status(400);
                throw new Error(
                    "Application has to be allocated to a credit manager first for investigation."
                );
            }
            if (application.isRejected) {
                res.status(400);
                throw new Error(
                    "Application has been rejected and cannot be approved."
                );
            }
            if (application.isHold) {
                res.status(400);
                throw new Error(
                    "Application is on hold, please unhold it first."
                );
            }

            // If all checks pass, approve the lead
            return { approved: true, message: "Application can be approved" };
        }
    } catch (error) {
        console.error("Error checking lead approval:", error);
        return { approved: false, message: "Error while checking approval" };
    }
};
