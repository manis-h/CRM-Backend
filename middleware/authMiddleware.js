import asyncHandler from "./asyncHandler";
import jwt from "jsonwebtoken";
// import Employees from "../models/Employees.js";
const JWT_SECRET = "loan"; // Again, use environment variables in production

// Protected Routes
const protect = asyncHandler(async (req, res, next) => {
    let token;
    // var userRole = req.cookies.userRole;
    token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = await Employee.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error("Not Authorized!!");
        }
    } else {
        res.status(401);
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
