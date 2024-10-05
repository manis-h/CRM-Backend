import mongoose from "mongoose";

const aadhaarSchema = new mongoose.Schema(
    {
        details: {
            type: Object,
            required: true, // Correct spelling
        },
    },
    { timestamps: true }
);

const AadharDetails = mongoose.model("AadharDetails", aadhaarSchema);
export default AadharDetails;
