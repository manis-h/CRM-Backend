import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import { getPanDetails } from "../utils/getPanDetails.js";
import PanDetails from "../models/PanDetails.js";

// @desc Generate OTP with Aadhaar number.
// @route Post /api/
// @access Private
export const getPanController = asyncHandler(async (req, res) => {
    try {
        const { panNumber } = req.body;

        // Validate that aadhaar is present in the leads
        if (!panNumber) {
            return res.status(400).json({
                success: false,
                message: "Pan number is required."
            });
        }

        // Validate it should be a 12-digit string
        if ("^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$".test(panNumber)) {
            return res.status(400).json({
                success: false,
                message: "Pan number must be a 10-digit Alpha numeric."
            });
        }

        // Call the get panDetails Function 
        const panDetails= getPanDetails({panNumber,getStatusInfo:true})
        // Now match the Lead data with the generated data
        const lead = await Lead.findOne({ aadhaarNumber: aadhaarNumber });
        if (!lead || !panDetails ) {
            return res.status(404).json({
                success: false,
                message: "No matching lead found."
            });
        }

        // Now save the data in the AadharDetails database
        const newpanDetail = new PanDetails({
            panNumber,
            // otp: otpResponseData.otp, // Adjust based on the actual response structure
            details: panDetails
        });

        await newpanDetail.save();

        // Now respond with status 200 with JSON success true
        return res.status(200).json({
            success: true,
            message: "Pan fetched successfully.",
            data: newpanDetail
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
