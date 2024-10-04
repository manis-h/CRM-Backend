import asyncHandler from "../middleware/asyncHandler.js";
import Bank from "../models/ApplicantBankDetails.js";
import Applicant from "../models/Applicant.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import { postLogs } from "./leads.js";

// @desc Post applicant details
// @access Private
export const applicantDetails = async (details = null) => {
    try {
        // Create the new log initally
        const newApplicant = await Applicant.create({
            personalDetails: {
                fName: details.fName,
                mName: details.mName,
                lName: details.lName,
                gender: details.gender,
                dob: details.dob,
                mobile: details.mobile,
                alternateMobile: details.alternateMobile,
                personalEmail: details.personalEmail,
                officeEmail: details.officeEmail,
                screenedBy: details.screenedBy,
                pan: details.pan,
                aadhaar: details.aadhaar,
            },
        });
        return newApplicant;
    } catch (error) {
        throw new Error(error.message);
    }
};

// @desc Update applicant details
// @route PATCH /api/applicant/:id
// @access Private
export const updateApplicantDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    console.log(updates);

    // Check if the application is present
    const application = await Application.findOne({ _id: id });

    // Check if credit Manager matches the one in the application document
    if (
        application.creditManagerId.toString() !== req.employee._id.toString()
    ) {
        res.status(403);
        throw new Error("Unauthorized: You can not update this application!!");
    }

    // Find the applicant
    const applicant = await Applicant.findById(application.applicant);

    if (!applicant) {
        res.status(404);
        throw new Error("Applicant not found!");
    }

    // Similar approach for residence, employment, or reference if provided
    if (updates.residence) {
        Object.keys(updates.residence).forEach((key) => {
            applicant.residence[key] = updates.residence[key];
        });
    }

    if (updates.employment) {
        Object.keys(updates.employment).forEach((key) => {
            applicant.employment[key] = updates.employment[key];
        });
    }

    if (updates.reference) {
        Object.keys(updates.reference).forEach((key) => {
            applicant.reference[key] = updates.reference[key];
        });
    }

    // Save the updated applicant
    const updatedApplicant = await applicant.save();

    const employee = await Employee.findOne({
        _id: req.employee._id.toString(),
    });
    const logs = await postLogs(
        application.lead._id,
        "APPLICANT PERSONAL DETAILS UPDATED",
        `${application.lead.fName} ${application.lead.mName ?? ""} ${
            application.lead.lName
        }`,
        `Applicant personal details updated by ${employee.fName} ${employee.lName}`
    );

    // Send the updated personal details as a JSON response
    return res.json({ updatedApplicant, logs });
});

// @desc Add Applicant Bank Details
// @route POST /api/applicant/bankDetails/:id
// @access Private
export const addApplicantBankDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        beneficiaryName,
        bankAccNo,
        accountType,
        ifscCode,
        bankName,
        branchName,
    } = req.body;

    const applicant = await Applicant.findOne(id);

    if (!applicant) {
        res.status(404);
        throw new Error("No applicant found!!!");
    }

    const newBank = new Bank.create({
        borrowerId: id,
        beneficiaryName,
        bankName,
        bankAccNo,
        accountType,
        ifscCode,
        branchName,
    });

    if (newBank) {
        return res.status(201).json(newBank);
    }
});

// @desc Get applicant Bank Details
// @route GET /api/applicant/bankDetails/:id
// @access Private
export const getApplicantBankDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bank = await Bank.find({ borrowerId: id });

    if (!bank) {
        res.status(404).json({ message: "No bank found!!" });
    }
    res.json(bank);
});

// @desc Get Applicant Personal details
// @route GET /api/applicant/:id
// @access Private
export const getApplicantDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const applicant = await Applicant.findById({ _id: id });
    if (!applicant) {
        res.status(404);
        throw new Error("No applicant found!!");
    }

    res.json(applicant);
});
