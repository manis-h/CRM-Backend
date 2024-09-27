import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        lead: {
            type: Object,
            required: true,
        },
    },
    { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
