import asyncHandler from "../middleware/asyncHandler";
import Bank from "../models/ApplicantBankDetails";

// @desc Add applicantBankDetails
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
