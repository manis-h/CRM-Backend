import mongoose from "mongoose";

const sanctionSchema = new mongoose.Schema(
    {
        Application: {
            type: Object,
            required: true,
        },
        SanctionHeadId: {
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

const Sanction = mongoose.model("Sanction", sanctionSchema);
export default Sanction;
