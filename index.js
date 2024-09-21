import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors"; // Import cors
import connectDB from "./config/db.js";
import "dotenv/config.js";
import morgan from "morgan";
import leadRouter from "./routes/LeadsRouter.js"; // Import routes
import employeeRouter from "./routes/EmployeesRouter.js";
import authAadharRouter from "./routes/AuthAadharRouter.js"
import authPanRouter from "./routes/AuthPanRouter.js"

import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { getPanDetails } from "./utils/getPanDetails.js";

const PORT = process.env.PORT || 3000;
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware configuration
var corsOption = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
app.use(cors(corsOption));

app.use(cookieParser()); //cookie parser middlerware
app.use(bodyParser.json()); // Middleware to parse JSON requests

// Routes
app.get("/", (req, res) => {
    res.send("API is running.......");
});

app.use("/api/leads", leadRouter); // Use the lead routes
app.use("/api/employees", employeeRouter); // Use the employee routes
app.use("/api/okyc",authAadharRouter); // Use the auth aadhar routes sevice by okyc
app.use("/api/pan",authPanRouter); // Use the auth aadhar routes sevice by okyc


app.use(notFound);
app.use(errorHandler);
getPanDetails({panNumber:"DVWPG0881D",getStatusInfo:true})
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
