import asyncHandler from "../middleware/asyncHandler.js";
import Lead from "../models/Leads.js";

// @desc Create loan leads
// @route POST /api/leads
// @access Public

const createLead = asyncHandler(async (req, res) => {
    const {
        fName,
        mName,
        lName,
        gender,
        dob,
        adhaar,
        pan,
        mobile,
        alternateMobile,
        personalEmail,
        officeEmail,
        loanAmount,
        salary,
        pinCode,
        state,
        city,
    } = req.body;
    const newLead = await Lead.create({
        fName,
        mName: mName ?? "",
        lName: lName ?? "",
        gender,
        dob,
        adhaar,
        pan,
        mobile,
        alternateMobile,
        personalEmail,
        officeEmail,
        loanAmount,
        salary,
        pinCode,
        state,
        city,
    });
    // const savedUserDetails = await newUserDetails.save();
    res.status(201).json(newLead);
});

// @desc Get all leads
// @route GET /api/leads
// @access Private
const getAllLeads = async (req, res) => {
    try {
        // const page = parseInt(req.query.page) || 1; // current page
        // const limit = parseInt(req.query.limit) || 10; // items per page
        // const skip = (page - 1) * limit;

        const leads = await Lead.find({}); //.skip(skip).limit(limit);
        const totalLeads = await Lead.countDocuments();

        res.status(200).json({
            totalLeads,
            // totalPages: Math.ceil(totalLeads / limit),
            // currentPage: page,
            leads,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving user details",
            error,
        });
    }
};

// Get user details by ID
// const getUserDetailsById = async (req, res) => {
//     try {
//         const userDetails = await UserDetails.findById(req.params.id);
//         if (!userDetails) {
//             return res.status(404).json({ message: 'User details not found' });
//         }
//         res.status(200).json(userDetails);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving user details', error });
//     }
// };

// Update user details by ID
// const updateUserDetailsById = async (req, res) => {
//     try {
//         const updatedUserDetails = await UserDetails.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedUserDetails) {
//             return res.status(404).json({ message: 'User details not found' });
//         }
//         res.status(200).json(updatedUserDetails);
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating user details', error });
//     }
// };

// Delete user details by ID
// const deleteUserDetailsById = async (req, res) => {
//     try {
//         const deletedUserDetails = await UserDetails.findByIdAndDelete(req.params.id);
//         if (!deletedUserDetails) {
//             return res.status(404).json({ message: 'User details not found' });
//         }
//         res.status(200).json({ message: 'User details deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error deleting user details', error });
//     }
// };

export { createLead, getAllLeads };
