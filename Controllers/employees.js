// controllers/authController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Employee from "../models/Employees.js";
import { generateToken } from "../utils/generateToken.js";
// @desc Register Employee
// @route POST /api/employees
//@access Private
export const register = asyncHandler(async (req, res) => {
    try {
        const { fName, lName, email, password, confPassword, empRole, empId } =
            req.body;
        const existingUser = await Employee.findOne({ email });

        if (existingUser) {
            res.status(400);
            throw new Error("Employee already exists!!!");
        }

        // const empId = generateEmpId();
        if (password === confPassword) {
            const employee = await Employee.create({
                fName,
                lName,
                email,
                password,
                empRole,
                empId,
            });
            if (employee) {
                const token = generateToken(res, employee._id);
                res.status(201).json({
                    data: {
                        _id: employee._id,
                        // token: token,
                        name: employee.fName + " " + employee.lName,
                        email: employee.email,
                    },
                    token: token,
                });
            }
        }

        // res.status(201).json({
        //     message: "User registered successfully",
        //     user: newUser,
        // });
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
        const token = generateToken(res, employee._id);

        res.status(200).json({
            data: {
                _id: employee._id,
                // token: token,
                name: employee.fName + " " + employee.lName,
                email: employee.email,
            },
            token: token,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// @desc Logout Employee / clear cookie
// @route POST /api/employees/logout
// @access Private
export const logout = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// @desc Get all employees
// @route GET /api/employees/
// @access Private
export const getAllEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find({});
    res.json(employees);
});

// @desc Get a particular employee
// @route GET /api/employees/:id
// @access Private

export const getAnEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id });
    console.log(employee);

    if (employee) {
        return res.json(employee);
    }
    res.stauts(400);
    throw new Error("Employee not found!!");
});