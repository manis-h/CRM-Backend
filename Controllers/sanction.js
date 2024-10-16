import asyncHandler from "../middleware/asyncHandler.js";
import Application from "../models/Applications.js";
import { generateSanctionLetter } from "../utils/sendsanction.js";
import CamDetails from "../models/CAM.js";

// @desc Get the forwarded applications
// @route GET /api/sanction/recommended
// @access Private
export const getForwardedApplications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const query = {
        isForwarded: true,
    };

    const applications = await Application.find(query).skip(skip).limit(limit);

    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Send Sanction letter to  applicants
// @route PATCH /api/sanction/approve/:id
//@access Private
export const sanctionApprove = asyncHandler(async (req, res) => {
    // Extract required fields from the request body
    // const {
    //     subject,
    //     letterheadUrl,
    //     sanctionDate,
    //     title,
    //     fullname,
    //     residenceAddress,
    //     camDetails,
    //     PORTAL_NAME,
    //     PORTAL_URL,
    //     acceptanceButton,
    //     acceptanceButtonLink,
    //     letterfooterUrl,
    //     toEmail,
    //     toName,
    // } = req.body;

    // Call the generateSanctionLetter utility function
    const response = await generateSanctionLetter(
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
});
