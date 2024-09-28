import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        lead: {
            type: Object,
            required: true,
        },
        creditManagerId: {
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
        isRejected: {
            type: Boolean,
            default: false,
        },
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
    },
    { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
