import mongoose from "mongoose";

const applicationPersonalDetailSchema = new mongoose.Schema({
    personalDetails: {
        type: Object,
        // required: true // Fixed typo
    },
    residence: {
        type: Object,
        // required: true,
    },
    employment: {
        type: Object,
        // required: true,
    },
    reference: {
        type: Object,
    },
});

const ApplicationPersonalDetails = mongoose.model("ApplicationPersonalDetails", applicationPersonalDetailSchema);
export default ApplicationPersonalDetails;
