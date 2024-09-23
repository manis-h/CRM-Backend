import mongoose from "mongoose";

const aadharSchema = new mongoose.Schema({
    // leadId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Lead",
    //     // required: true, // If this is mandatory, otherwise omit it
    // },
    requestID: {
        type: String,
        trim: true,
        required: true, // Ensure the request ID is mandatory
        unique: true,  // Optional: if each request ID should be unique
    },
    data: {
        type: Object,
        required: true, // Correct spelling
    },
}, { timestamps: true });

const AadharDetails = mongoose.model("AadharDetail", aadharSchema);
export default AadharDetails;