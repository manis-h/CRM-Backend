import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";
import { getPanDetails } from "../utils/getPanDetails.js";
import PanDetails from "../models/PanDetails.js";

// @desc Generate OTP with Aadhaar number.
// @route Post /api/
// @access Private
export const getPanController = asyncHandler(async (req, res) => {
    try {
        const { pan } = req.body;

        // Validate that aadhaar is present in the leads
        if (!pan) {
            return res.status(400).json({
                success: false,
                message: "Pan number is required.",
            });
        }

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        // Validate the PAN number
        if (!panRegex.test(pan)) {
            return res.status(400).json({
                success: false,
                message: "Invalid PAN!!!",
            });
        }

        // Call the get panDetails Function
        const panDetails = await getPanDetails({
            pan,
            getStatusInfo: true,
        });

        console.log(panDetails);
        // Now save the data in the AadharDetails database
        // const newpanDetail = new PanDetails({
        //     pan,
        //     // otp: otpResponseData.otp, // Adjust based on the actual response structure
        //     data: panDetails.data,
        // });

        // await newpanDetail.save();

        // Now respond with status 200 with JSON success true
        return res.status(200).json({
            success: true,
            message: "Pan fetched successfully.",
            // data: newpanDetail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            // newpanDetail,
        });
    }
});
