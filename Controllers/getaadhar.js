import asyncHandler from "../middleware/asyncHandler.js";
import { generateOtpWithAadhaar } from "../utils/generateAadhaarOtp.js";
import { generateAadhaarDetails } from "../utils/gnerateAadharDetails.js";
// import { generateAadhaarDetails } from "../utils/generateAadharDetails.js";
import Lead from "../models/Leads.js";
// import AadharDetails from "../models/AadharDetails.js";
import AadharDetails from "../models/AadharDetails.js";
import AadharVerification from "../models/AadharVerification.js";

// @desc Generate OTP with Aadhaar number.
// @route POST /api/otp
// @access Private
export const postAadaharNoForOtp = asyncHandler(async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        // Check if Aadhaar number is provided
        if (!aadhaarNumber) {
            return res.status(400).json({
                success: false,
                message: "Aadhaar number is required.",
            });
        }

        // Validate Aadhaar number (12 digits)
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            return res.status(400).json({
                success: false,
                message: "Aadhaar number must be a 12-digit number.",
            });
        }

        // Call the function to generate OTP using Aadhaar number
        const otpResponseData = await generateOtpWithAadhaar(aadhaarNumber);
        console.log("OTP Response Data:", otpResponseData);
        console.log("The request id is " ,otpResponseData.data.requestId )

        // const requestID = otpResponseData.data.requestID;



        // Check if the request ID is available
        if (!otpResponseData.data.requestId) {
            return res.status(400).json({
                success: false,
                message: "Missing request ID from response.",
            });
        }

        // / Check if requestID exists in the response
        const requestID = otpResponseData?.data?.requestId;  

        // Save the request ID in the aadharVerificationModel
        // const requestID = otpResponseData.data.requestID;
        // await AadharVerification.create({ requestID : requestID });
        // Debugging: Log the requestID before saving
        console.log("Request ID to be saved:", requestID);

        // Create and save a new AadharVerification document
        const newAadharVerification =  new AadharVerification({ requestID  });


        await newAadharVerification.save();

        // Respond with a success message
        return res.status(200).json({
            success: true,
            message: "OTP generated successfully.",
            data: otpResponseData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @desc Fetch Aadhaar details using OTP and request ID
// @route POST /api/aadhaar/details
// @access Private
export const getAadharDetailsWithOtpAndRequestId = asyncHandler(async (req, res) => {
    try {
        const { otp, requestID } = req.body;

        // Check if both OTP and request ID are provided
        if (!otp || !requestID) {
            return res.status(400).json({
                success: false,
                message: "Missing OTP or request ID.",
            });
        }

        // Do check her if AadharVerification is create within 10 minutes with matching deviceId

         // Get the current time and subtract 10 minutes to set the time limit
        //  const tenMinutesAgo = moment().subtract(10, 'minutes').toDate();

        //  // Find the request ID that was created within the last 10 minutes
        //  const aadharVerification = await AadharVerification.findOne({
        //      requestID: requestID,
        //      createdAt: { $gte: tenMinutesAgo } // Checks if `createdAt` is greater than 10 minutes ago
        //  });
 
         // If no such record exists or it was created more than 10 minutes ago, return an error
        //  if (!aadharVerification) {
        //      return res.status(400).json({
        //          success: false,
        //          message: "Request ID is invalid or expired.",
        //      });
        //  }

      // Fetch Aadhaar details using the provided OTP and request ID
    const aadhaarDetailResponse = await generateAadhaarDetails(requestID, otp);
    console.log("Aadhaar Detail Response:", aadhaarDetailResponse);

    // Save Aadhaar details in AadharDetails model
    await AadharDetails.create({
        requestID: requestID,
        data: aadhaarDetailResponse.data,
    });

        // Respond with a success message
        return res.status(200).json({
            success: true,
            message: "Aadhaar details fetched and saved successfully.",
            data: aadhaarDetailResponse.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
