import asyncHandler from "../middleware/asyncHandler.js";
import Employee from "../models/Employees.js";
import Lead from "../models/Leads.js";
import Application from "../models/Applications.js";
import { postLogs } from "./logs.js";
import mongoose from "mongoose";

export const sentBack = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sendTo, reason } = req.body;

    const lead = await Lead.findById(id);
    console.log(lead);

    const application = await Application.findById(id);
    console.log(application);

    if (sendTo === "screener") {
        // lead.isApproved = false;
        // lead.approvedBy = null;
        // await lead.save();

        await Application.deleteOne({
            "lead._id": new mongoose.Types.ObjectId(id),
        });
    }
    if (sendTo === "creditManager") {
        application.isForwarded = true;
        application.forwardedBy = null;
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
