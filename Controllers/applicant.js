import asyncHandler from "../middleware/asyncHandler";
import Applicant from "../models/Applicant";

export const login = asyncHandler(async (req, res) => {
    const { mobile, source } = req.body;

    const applicant = await Applicant.findOne({
        "personalDetails.mobile": mobile,
    });

    if (applicant) {
        console.log("Customer already exist....sending OTP");
    } else {
        console.log("New customer.....saving and sending OTP");
    }
});
