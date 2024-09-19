import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors"; // Import cors
import connectDB from "./config/db.js";
import "dotenv/config.js";
import morgan from "morgan";
import lead from "./routes/Leads.js"; // Import routes
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const PORT = process.env.PORT || 5000;
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware configuration
// app.use(
//     cors({
//         origin: "http://localhost:5173", // Allow requests from this origin
//         credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//     })
// );

app.use(cookieParser()); //cookie parser middlerware
app.use(bodyParser.json()); // Middleware to parse JSON requests

// Routes
app.get("/", (req, res) => {
    res.send("API is running.......");
});

app.use("/api/leads", lead); // Use the user routes

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
