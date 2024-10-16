import asyncHandler from "../middleware/asyncHandler.js";
// import { generateSenctionLetter } from "../utils/sendsanction.js";

// @desc Send Sanction letter to  applicants
// @route POST /api/sanction/generateSanctionLetter
//@access Private
export const generateSanctionLetter = asyncHandler(async (req, res) => {
    try {
        // Extract required fields from the request body
        const {
            subject,
            letterheadUrl,
            sanctionDate,
            title,
            fullname,
            residenceAddress,
            camDetails,
            PORTAL_NAME,
            PORTAL_URL,
            acceptanceButton,
            acceptanceButtonLink,
            letterfooterUrl,
            toEmail,
            toName,
        } = req.body;

        // Call the generateSanctionLetter utility function
        const response = await generateSenctionLetter(
            subject,
            letterheadUrl,
            sanctionDate,
            title,
            fullname,
            residenceAddress,
            camDetails,
            PORTAL_NAME,
            PORTAL_URL,
            acceptanceButton,
            acceptanceButtonLink,
            letterfooterUrl,
            toEmail,
            toName
        );

        // Return a success response if the email is sent successfully
        if (response.success) {
            res.status(200).json(response);
        } else {
            // Return an error response if there's an issue with sending the email
            res.status(500).json(response);
        }
    } catch (error) {
        // Return an error response if there's an issue with the request
        res.status(400).json({ success: false, message: error.message });
    }
});
