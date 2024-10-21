import asyncHandler from "../middleware/asyncHandler.js";
import Bank from "../models/ApplicantBankDetails.js";
import Applicant from "../models/Applicant.js";
import Application from "../models/Applications.js";
import Employee from "../models/Employees.js";
import { postLogs } from "./logs.js";
import { verifyBank } from "../utils/verifyBank.js";

// @desc Post applicant details
// @access Private
export const applicantDetails = async (details = null) => {
    try {
        const applicant = await Applicant.findOne({
            $and: [
                { "personalDetails.pan": details.pan }, // Check if PAN matches
                { "personalDetails.aadhaar": details.aadhaar }, // Check if Aadhaar matches
            ],
        });

        if (applicant) {
            return applicant;
        }
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

// @desc Bank Verify and add the back.
// @route POST /api/verify/bank
// @access Private
export const bankVerification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        beneficiaryName,
        bankAccNo,
        accountType,
        ifscCode,
        bankName,
        branchName,
    } = req.body;

    const applicant = await Applicant.findById(id);

    if (!applicant) {
        res.status(404);
        throw new Error("No applicant found!!!");
    }

    const response = await verifyBank(
        beneficiaryName,
        bankAccNo,
        accountType,
        ifscCode,
        bankName,
        branchName,
        applicant
    );
});

// @desc Update applicant details
// @route PATCH /api/applicant/:id
// @access Private
export const updateApplicantDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if the application is present
    const application = await Application.findOne({ _id: id }).populate("lead");

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

    // Update residence if provided
    if (updates.residence) {
        applicant.residence = {
            ...applicant.residence, // Retain existing data
            ...updates.residence, // Merge with new data
        };
    }

    // Update employment if provided
    if (updates.employment) {
        applicant.employment = {
            ...applicant.employment, // Retain existing data
            ...updates.employment, // Merge with new data
        };
    }

    // Update reference if provided
    if (updates.reference) {
        updates.reference.forEach((newRef, index) => {
            // If there's an existing reference at the same index, merge it
            if (applicant.reference[index]) {
                applicant.reference[index] = {
                    ...applicant.reference[index],
                    ...newRef, // Merge new reference data
                };
            } else {
                // If no existing reference, add the new one
                applicant.reference.push(newRef);
            }
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

// @desc Update Applicant Bank Details
// @route PATCH /api/applicant/bankDetails/:id
// @access Private
export const updateApplicantBankDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        beneficiaryName,
        bankAccNo,
        accountType,
        ifscCode,
        bankName,
        branchName,
    } = req.body;

    const applicant = await Applicant.findById(id);

    if (!applicant) {
        res.status(404);
        throw new Error("No applicant found!!!");
    }

    // Check if there's already existing bank details for this applicant
    let bankDetails = await Bank.findOne({ borrowerId: id });

    if (bankDetails) {
        // Update existing bank details
        bankDetails.beneficiaryName =
            beneficiaryName || bankDetails.beneficiaryName;
        bankDetails.bankAccNo = bankAccNo || bankDetails.bankAccNo;
        bankDetails.accountType = accountType || bankDetails.accountType;
        bankDetails.ifscCode = ifscCode || bankDetails.ifscCode;
        bankDetails.bankName = bankName || bankDetails.bankName;
        bankDetails.branchName = branchName || bankDetails.branchName;

        await bankDetails.save();
        return res.json({ bankDetails });
    }

    res.status(400);
    throw new Error("Unable to add or update bank details");
});

// @desc Get applicant Bank Details
// @route GET /api/applicant/bankDetails/:id
// @access Private
export const getApplicantBankDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bank = await Bank.findOne({ borrowerId: id });

    if (!bank) {
        return res.status(404).json({ success: false });
    }
    res.json(bank);
});

// @desc Get Applicant Personal details
// @route GET /api/applicant/:id
// @access Private
export const getApplicantDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const applicant = await Applicant.findById(id);
    if (!applicant) {
        res.status(404);
        throw new Error("No applicant found!!");
    }

    res.json(applicant);
});
