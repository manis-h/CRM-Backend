import asyncHandler from "../middleware/asyncHandler.js";
import Application from "../models/Applications.js";

// @desc Get the forwarded applications
// @route GET /api/sanction/forwarded
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
