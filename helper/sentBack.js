import asyncHandler from "../middleware/asyncHandler.js";
import Employee from "../models/Employees.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";
import { postLogs } from "./logs.js";
import mongoose from "mongoose";

export const sentBack = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sendTo, reason } = req.body;

    // If sendTo is screener this will be used
    const lead = await Lead.findById(id);

    // If sendTo is Credit Manager this will be used
    const application = await Application.findOne({ lead: id });

    if (sendTo === "screener") {
        await Application.deleteOne({
            lead: new mongoose.Types.ObjectId(id),
        });

        lead.isRecommended = false;
        lead.recommendedBy = null;
        await lead.save();
    }
    if (sendTo === "creditManager") {
        application.isRecommended = true;
        application.recommendedBy = null;
        await application.save();
    }

    const employee = await Employee.findOne({
        _id: req.employee._id.toString(),
    });
    const logs = await postLogs(
        lead._id,
        `SENT BACK TO ${sendTo.toUpperCase()}`,
        `${lead.fName ?? application.lead.fName} ${
            lead.mName ?? application.lead.mName ?? ""
        } ${lead.lName ?? application.lead.lName ?? ""}`,
        `Sent back by ${employee.fName} ${employee.lName}`,
        `${reason}`
    );

    res.json({ success: true, logs });
});
