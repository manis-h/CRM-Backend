// controllers/authController.js
import Employee from "../models/Employees.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new user
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        const user = new User({ username, email, password: passwordHash });

        const newUser = await user.save();
        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ message: "Error saving user", error });
    }
};

const JWT_SECRET = "loan";

// Login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send the token in a cookie (for the frontend to store in browser)
        res.cookie("authToken", token, {
            httpOnly: true,
            maxAge: 3600000,
            path: "/",
        }); // 1 hour

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
// Logout route (clears the auth token)
export const logout = (req, res) => {
    console.log("Logout request received");
    res.clearCookie("authToken", { path: "/" });
    console.log("Auth token cookie cleared");
    res.status(200).json({ message: "Logged out successfully" });
};
