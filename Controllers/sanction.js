import asyncHandler from "../middleware/asyncHandler.js";
import Application from "../models/Applications.js";
import { generateSanctionLetter } from "../utils/sendsanction.js";
import { dateFormatter } from "../utils/sendsanction.js";
import CamDetails from "../models/CAM.js";

// @desc Get the forwarded applications
// @route GET /api/sanction/recommended
// @access Private
export const getRecommendedApplications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const query = {
        isRecommended: true,
    };

    const applications = await Application.find(query)
        .skip(skip)
        .limit(limit)
        .populate("lead");

    const totalApplications = await Application.countDocuments(query);

    return res.json({
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        applications,
    });
});

// @desc Preview Sanction letter
// @route GET /api/sanction/preview/:id
// @access Private
export const sanctionPreview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Extract required fields from the request body
    const sanctionDate = new Date();

    const application = await Application.findById(id).populate("applicant");

    const camDetails = await CamDetails.findOne({ leadId: application.lead });

    if (!application) {
        return res.send(404).json({ message: "Application not found" });
        // throw new Error("Application not found");
    }
    const disbursalDate = new Date(camDetails?.details.disbursalDate);

    if (
        new Date(application.sanctionDate) > disbursalDate ||
        sanctionDate > disbursalDate
    ) {
        res.status(400);
        throw new Error(
            "Disbursal Date cannot be in the past. It must be the present date or future date!"
        );
    }

    return res.json({
        sanctionDate: dateFormatter(application.sanctionDate),
        title: "Mr./Ms.",
        fullname: `${application.applicant.personalDetails.fName} ${application.applicant.personalDetails.mName} ${application.applicant.personalDetails.lName}`,
        residenceAddress: `${application.applicant.residence.address}, ${application.applicant.residence.city}`,
        stateCountry: `${application.applicant.residence.state}, India - ${application.applicant.residence.pincode}`,
        mobile: `${application.applicant.personalDetails.mobile}`,
        loanAmount: `${new Intl.NumberFormat().format(
            camDetails?.details.loanRecommended
        )}`,
        roi: `${camDetails?.details.eligibleRoi}`,
        disbursalDate: dateFormatter(camDetails?.details.disbursalDate),
        repaymentAmount: `${new Intl.NumberFormat().format(
            camDetails?.details.repaymentAmount
        )}`,
        tenure: `${camDetails?.details.eligibleTenure}`,
        repaymentDate: dateFormatter(camDetails?.details.repaymentDate),
        penalInterest: `${camDetails?.details.penalInterest || "0"}`,
        processingFee: `${new Intl.NumberFormat().format(
            camDetails?.details.totalAdminFeeAmount
        )}`,
        // repaymentCheques: `${camDetails?.details.repaymentCheques || "-"}`,
        // bankName: `${bankName || "-"}`,
        bouncedCharges: "1000",
        // annualPercentageRate: `${
        //     camDetails?.details.annualPercentageRate || "0"
        // }`,
    });
});

// @desc Send Sanction letter to applicants
// @route PATCH /api/sanction/approve/:id
// @access Private
export const sanctionApprove = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Extract required fields from the request body
    const sanctionDate = new Date();

    const application = await Application.findById(id).populate("applicant");

    const camDetails = await CamDetails.findOne({ leadId: application.lead });

    if (!application) {
        return res.send(404).json({ message: "Application not found" });
        // throw new Error("Application not found");
    }
    const disbursalDate = new Date(camDetails?.details.disbursalDate);

    if (
        new Date(application.sanctionDate) > disbursalDate ||
        sanctionDate > disbursalDate
    ) {
        res.status(400);
        throw new Error(
            "Disbursal Date cannot be in the past. It must be the present date or future date!"
        );
    }

    application.sanctionDate = application.sanctionDate ?? sanctionDate;
    application.isApproved = true;
    application.approvedBy = req.employee._id.toString();
    await application.save();

    // Call the generateSanctionLetter utility function
    const response = await generateSanctionLetter(
        `SANCTION LETTER - ${application.applicant.personalDetails.fName} ${application.applicant.personalDetails.mName} ${application.applicant.personalDetails.lName}`,
        dateFormatter(application.sanctionDate),
        "Mr./Ms.",
        `${application.applicant.personalDetails.fName} ${application.applicant.personalDetails.mName} ${application.applicant.personalDetails.lName}`,
        `${application.applicant.personalDetails.mobile}`,
        `${application.applicant.residence.address}, ${application.applicant.residence.city}`,
        `${application.applicant.residence.state}, India - ${application.applicant.residence.pincode}`,
        camDetails,
        `${application.applicant.personalDetails.personalEmail}`
    );

    // Return a success response if the email is sent successfully
    if (!response) {
        return res.json({ success: false });
    }
    res.json({ success: true });
});
