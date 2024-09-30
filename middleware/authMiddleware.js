import asyncHandler from "./asyncHandler.js";
import jwt from "jsonwebtoken";
import Employees from "../models/Employees.js";

// Protected Routes
const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.employee = await Employees.findById(decoded.id).select(
                "-password"
            );

            // Dynamically add the employee role to req
            const role = req.employee.empRole;
            req[role] = req.employee; // Assign the employee's role to req dynamically

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error("Not Authorized as Admin!!");
        }
    } else {
        res.status(403);
        throw new Error("Not Authorized!!! No token found");
    }
});

// Admin Route
const admin = (req, res, next) => {
    if (req.admin) {
        next();
    } else {
        res.status(401);
        throw new Error("Not Authorized as Admin!!");
    }
};

export { protect, admin };

// Middleware to verify JWT
// const authenticateToken = (req, res, next) => {
//     const token =
//         req.cookies.authToken ||
//         req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//         return res
//             .status(401)
//             .json({ message: "Access denied. No token provided." });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.user = decoded; // Add user info to request object
//         next(); // Proceed to the next middleware or route handler
//     } catch (err) {
//         return res.status(401).json({ message: "Invalid token." });
//     }
// };

// export { admin };
