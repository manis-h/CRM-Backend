import express from "express";
const router = express.Router();

import {
    login,
    logout,
    register,
    getAllEmployees,
    getAnEmployee,
} from "../Controllers/employees.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

router.route("/").get(getAllEmployees);
router.route("/:id").get(getAnEmployee);

// Route to register a new user
router.route("/register").post(register);

// Route to login
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router;
