import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors"; // Import cors
import connectDB from "./config/db.js";
import "dotenv/config.js";
import morgan from "morgan";
import leadRouter from "./routes/LeadsRouter.js"; // Import routes
import employeeRouter from "./routes/EmployeesRouter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const PORT = process.env.PORT || 3000;
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
}
app.use(cors(corsOption));
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

app.use("/api/leads", leadRouter); // Use the lead routes
app.use("/api/employees", employeeRouter); // Use the employee routes

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
