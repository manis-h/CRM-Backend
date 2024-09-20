// controllers/authController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Employee from "../models/Employees.js";
import { generateToken } from "../utils/generateToken.js";

// @desc Register Employee
// @route POST /api/employees
//@access Private
export const register = asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
            res.status(400);
            throw new Error("Employee already exists!!!");
        }

        const employee = await Employee.create({
            username,
            email,
            password,
        });

        if (employee) {
            generateToken(res, employee._id);
            res.status(201).json({
                _id: employee._id,
                name: employee.fName + " " + employee.lName,
                email: employee.email,
            });
        }

        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ message: "Error saving user", error });
    }
});

// @desc Auth user & get token
// @route POST /api/employees/login
// @access Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const employee = await Employee.findOne({ email });
    if (employee && (await employee.matchPassword(password))) {
        generateToken(res, employee._id);

        res.status(200).json({
            _id: employee._id,
            name: employee.fName + " " + employee.lName,
            email: employee.email,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});
// Logout route (clears the auth token)
export const logout = (req, res) => {
    console.log("Logout request received");
    res.clearCookie("authToken", { path: "/" });
    console.log("Auth token cookie cleared");
    res.status(200).json({ message: "Logged out successfully" });
};
