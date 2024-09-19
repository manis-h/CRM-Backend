import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
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
    adhaar: {
        type: Number,
        required: true,
        unique: true,
    },
    pan: {
        type: String,
        required: true,
        unique: true,
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
    noOfLoans: {
        type: Number,
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
});

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
