import asyncHandler from "./asyncHandler.js";
import jwt from "jsonwebtoken";
import Employees from "../models/Employees.js";

// Protected Routes
const protect = asyncHandler(async (req, res, next) => {
    // var userRole = req.cookies.userRole;
    // token = req.cookies.jwt;
    let token = req.headers.authorization;
    // console.log(req.headers.authorization);

    if (token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.slice(7, token.length).trimLeft();
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.employee = await Employees.findById(decoded.id).select(
                "-password"
            );

            // Dynamically add the employee role to req
            const role = req.employee.empRole;
            req[role] = req.employee; // Assign the employee's role to req dynamically

            next();

            // switch (req.employee.empRole) {
            //     case "admin":
            //         req.admin = req.employee;
            //         break;
            //     case "screener":
            //         req.screener = req.employee;
            //         break;
            //     case "creditManger":
            //         req.creditManager = req.employee;
            //         break;
            //     default:
            //         res.status(403);
            //         throw new Error("Not Authorized!! Invalid role");
            // }
            // next();
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
