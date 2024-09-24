import mongoose from "mongoose";

const aadhaarVerificationSchema = new mongoose.Schema(
    {
        requestID: {
            type: String,
            required: true, // Fixed spelling: 'required' instead of 'require'
        },
    },
    { timestamps: true }
);

const AadhaarVerification = mongoose.model(
    "AadhaarVerification",
    aadhaarVerificationSchema
);

export default AadhaarVerification;
