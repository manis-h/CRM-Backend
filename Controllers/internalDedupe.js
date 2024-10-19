import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";

// @desc Internal Dedupe (Old history)
// @route GET /api/leads/old-history/:id
// @access Private
const internalDedupe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lead = await Lead.findById(id).sort({ createdAt: -1 });

    if (!lead) {
        res.status(404);
        throw new Error("No previous leads found!!");
    }

    const { aadhaar, pan } = lead;

    // Now find all other leads with the same aadhaar or pan
    const relatedLeads = await Lead.find({
        _id: { $ne: id }, // Exclude the original lead
        $or: [{ aadhaar: aadhaar }, { pan: pan }],
    });

    const relatedApplications = await Application.find({
        "lead._id": { $ne: id }, // Exclude the original lead
        $or: [{ "lead.aadhaar": aadhaar }, { "lead.pan": pan }],
    });

    return res.json({
        relatedLeads,
        relatedApplications,
    });
});

export default internalDedupe;
