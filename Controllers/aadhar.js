import asyncHandler from "../middleware/asyncHandler.js";
import { generateOtpWithAadhaar } from "../utils/generateAadhaarOtp.js";
import { generateAadhaarDetails } from "../utils/generateAadharDetails.js";
import Lead from "../models/Leads.js";
import AadharDetails from "../models/AadharDetails.js";

// @desc Generate OTP with Aadhaar number.
// @route Post /api/
// @access Private
export const postaadaharnoforotp = asyncHandler(async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        // Validate that aadhaar is present in the leads
        if (!aadhaarNumber) {
            return res.status(400).json({
                success: false,
                message: "Aadhaar number is required."
            });
        }

        // Validate it should be a 12-digit string
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            return res.status(400).json({
                success: false,
                message: "Aadhaar number must be a 12-digit number."
            });
        }

        // Call the generate the OTP function 
        const otpResponseData = await generateOtpWithAadhaar(aadhaarNumber);

        // Now call another utils function to generate data for that Aadhaar number
        const aadhaarDetails = await generateAadhaarDetails(aadhaarNumber);

        // Now match the Lead data with the generated data
        const lead = await Lead.findOne({ aadhaarNumber: aadhaarNumber });
        if (!lead || !aadhaarDetails || lead.someField !== aadhaarDetails.someField) {
            return res.status(404).json({
                success: false,
                message: "No matching lead found."
            });
        }

        // Now save the data in the AadharDetails database
        const newAadharDetail = new AadharDetails({
            aadhaarNumber,
            otp: otpResponseData.otp, // Adjust based on the actual response structure
            details: aadhaarDetails
        });

        await newAadharDetail.save();

        // Now respond with status 200 with JSON success true
        return res.status(200).json({
            success: true,
            message: "OTP generated successfully.",
            data: { otp: otpResponseData.otp }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
