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
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    const sanctionDate = `${day}-${month}-${year}`;

    const application = await Application.findById(id).populate("applicant");

    const camDetails = await CamDetails.findOne({ leadId: application.lead });

    if (!application) {
        res.send(404);
        throw new Error("Application not found");
    }

    application.isApproved = true;
    application.approvedBy = req.employee._id.toString();
    await application.save();

    // Call the generateSanctionLetter utility function
    const response = await generateSanctionLetter(
        `SANCTION LETTER - ${application.applicant.personalDetails.fName} ${application.applicant.personalDetails.mName} ${application.applicant.personalDetails.lName}`,
        sanctionDate,
        "Mr./Ms.",
        `${application.applicant.personalDetails.fName} ${application.applicant.personalDetails.mName} ${application.applicant.personalDetails.lName}`,
        `${application.applicant.residence.address}, ${application.applicant.residence.city}`,
        `${application.applicant.residence.state}, India - ${application.applicant.residence.pincode}`,
        camDetails,
        `${application.applicant.personalDetails.personalEmail}`
    );

    // Return a success response if the email is sent successfully
    if (!response.success) {
        res.json({ success: false });
    }
    res.json({ success: true });
});
