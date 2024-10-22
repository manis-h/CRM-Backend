import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";

// @desc Get total number of lead
// @route GET /api/leads/totalRecords or /api/applications/totalRecords
// @access Private
export const totalRecords = asyncHandler(async (req, res) => {
    const leads = await Lead.find({});
    const applications = await Application.find({});

    const totalLeads = leads.length;
    const newLeads = leads.filter(
        (lead) => !lead.screenerId && !lead.onHold && !lead.isRejected
    ).length;

    let allocatedLeads;
    let heldLeads;
    let rejectedLeads;

    if (req.screener) {
        allocatedLeads = leads.filter(
            (lead) =>
                lead.screenerId.toString() === req.screener._id.toString() &&
                !lead.onHold &&
                !lead.isRejected
        ).length;

        heldLeads = leads.filter(
            (lead) =>
                lead.screenerId.toString() === req.screener._id.toString() &&
                lead.onHold &&
                !lead.isRejected
        ).length;

        rejectedLeads = leads.filter(
            (lead) =>
                lead.screenerId.toString() === req.screener._id.toString() &&
                !lead.onHold &&
                lead.isRejected
        ).length;
    }

    allocatedLeads = leads.filter(
        (lead) => lead.screenerId && !lead.onHold && !lead.isRejected
    ).length;
    heldLeads = leads.filter(
        (lead) => lead.screenerId && lead.onHold && !lead.isRejected
    ).length;
    rejectedLeads = leads.filter(
        (lead) => lead.screenerId && !lead.onHold && lead.isRejected
    ).length;

    const totalApplications = applications.length;
    const newApplications = applications.filter(
        (application) =>
            !application.creditManagerId &&
            !application.onHold &&
            !application.isRejected
    ).length;

    let allocatedApplications;
    let heldApplications;
    let rejectedApplications;

    if (req.creditManager) {
        allocatedApplications = applications.filter(
            (application) =>
                application.creditManagerId.toString() ===
                    req.creditManagery._id.toString() &&
                !application.onHold &&
                !application.isRejected
        ).length;

        heldApplications = applications.filter(
            (application) =>
                application.creditManagerId.toString() ===
                    req.creditManagery._id.toString() &&
                application.onHold &&
                !application.isRejected
        ).length;

        rejectedApplications = applications.filter(
            (application) =>
                application.creditManagerId.toString() ===
                    req.creditManagery._id.toString() &&
                !application.onHold &&
                application.isRejected
        ).length;
    }
    allocatedApplications = applications.filter(
        (application) =>
            application.creditManagerId &&
            !application.onHold &&
            !application.isRejected
    ).length;
    heldApplications = applications.filter(
        (application) =>
            application.creditManagerId &&
            application.onHold &&
            !application.isRejected
    ).length;
    rejectedApplications = applications.filter(
        (application) =>
            application.creditManagerId &&
            !application.onHold &&
            application.isRejected
    ).length;

    res.json({
        leads: {
            totalLeads,
            newLeads,
            allocatedLeads,
            heldLeads,
            rejectedLeads,
        },
        applications: {
            totalApplications,
            newApplications,
            allocatedApplications,
            heldApplications,
            rejectedApplications,
        },
    });
});
