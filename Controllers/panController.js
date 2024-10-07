import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import { panVerify, panAadhaarLinkage } from "../utils/pan.js";
import PanDetails from "../models/PanDetails.js";

// @desc Generate OTP with Aaadhaar number.
// @route Post /api/verify/pan
// @access Private
export const getPanDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    const pan = lead?.pan;

    // Validate that aaadhaar is present in the leads
    if (!pan) {
        res.status(400);
        throw new Error({ success: false, message: "Pan number is required." });
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    // Validate the PAN number
    if (!panRegex.test(pan)) {
        res.status(400);
        throw new Error({ success: false, message: "Invalid PAN!!!" });
    }

    const existingPan = await PanDetails.findOne({ "data.input_pan_num": pan });

    // Call the get panDetails Function
    const panDetails = await panVerify(pan);

    if (existingPan) {
        return res.json({
            success: panDetails.success,
            code: panDetails.response_code,
            message: panDetails.response_message,
        });
    }

    await Lead.findByIdAndUpdate(id, { isPanVerified: true }, { new: true });

    // Now save the data in the AadharDetails database
    const newpanDetail = new PanDetails({
        data: panDetails,
    });

    await newpanDetail.save();

    // Now respond with status 200 with JSON success true
    return res.json({
        success: true,
        message: "Pan verified successfully.",
        data: panDetails,
    });
});

export const panAadhaarLink = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    const pan = lead?.pan;

    // Validate that aaadhaar is present in the leads
    if (!pan) {
        res.status(400);
        throw new Error({ success: false, message: "Pan number is required." });
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    // Validate the PAN number
    if (!panRegex.test(pan)) {
        res.status(400);
        throw new Error({ success: false, message: "Invalid PAN!!!" });
    }

    const aadhaar = lead.aadhaar.slice(-4);
    const isValid = /^\d{4}$/.test(aadhaar);

    if (!isValid) {
        throw new Error("Invalid Aadhaar!!!");
    }

    const response = await panAadhaarLinkage(pan, aadhaar);
    // Now respond with status 200 with JSON success true
    return res.json({
        success: true,
        response,
    });
});
