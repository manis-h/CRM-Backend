import mongoose from "mongoose";

const disbursalSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            unique: true,
        },
        isDisbursed: {
            type: Boolean,
            default: false,
        },
        disbursedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        disbursedAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const Disbursal = mongoose.model("Disbursal", disbursalSchema);
export default Disbursal;
