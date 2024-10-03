import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
    {
        fName: {
            type: String,
            required: true,
        },
        mName: {
            type: String,
        },
        lName: {
            type: String,
        },
        gender: {
            type: String,
            required: true,
            enum: ["M", "F"],
        },
        dob: {
            type: String,
            required: true,
        },
        aadhaar: {
            type: String,
            required: true,
            // unique: true,
        },
        pan: {
            type: String,
            required: true,
            // unique: true,
        },
        mobile: {
            type: Number,
            required: true,
        },
        alternateMobile: {
            type: Number,
        },
        personalEmail: {
            type: String,
            required: true,
        },
        officeEmail: {
            type: String,
            required: true,
        },
        loanAmount: {
            type: Number,
            required: true,
        },
        salary: {
            type: Number,
            required: true,
        },
        pinCode: {
            type: Number,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        screenerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        onHold: {
            type: Boolean,
            default: false,
        },
        heldBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        // phoneOtp: Number,
        // isPhoneVerified: {
        //     type: Boolean,
        //     default: false,
        // },
        emailOtp: Number,
        emailOtpExpiredAt: { type: Date },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isRejected: {
            type: Boolean,
            default: false,
        },
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        document: [
            {
                type: {
                    type: String,
                    enum: [
                        "aadhaarFront",
                        "aadhaarBack",
                        "panCard",
                        "bankStatement",
                        "salarySlip",
                        // Add more document types as needed
                    ],
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
        isApproved: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        source: {
            type: String,
            required: true,
            enum: ["website", "bulk", "landingPage"],
            default: "website",
        },
    },
    { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
