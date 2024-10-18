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
    const allocatedLeads = leads.filter(
        (lead) => lead.screenerId && !lead.onHold && !lead.isRejected
    ).length;
    const heldLeads = leads.filter(
        (lead) => lead.screenerId && lead.onHold && !lead.isRejected
    ).length;
    const rejectedLeads = leads.filter(
        (lead) => lead.screenerId && !lead.onHold && lead.isRejected
    ).length;

    const totalApplications = applications.length;
    const newApplications = applications.filter(
        (application) =>
            !application.creditManagerId &&
            !application.onHold &&
            !application.isRejected
    ).length;
    const allocatedApplications = leads.filter(
        (application) =>
            application.creditManagerId &&
            !application.onHold &&
            !application.isRejected
    ).length;
    const heldApplications = leads.filter(
        (application) =>
            application.creditManagerId &&
            application.onHold &&
            !application.isRejected
    ).length;
    const rejectedApplications = leads.filter(
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
