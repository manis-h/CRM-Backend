import asyncHandler from "../middleware/asyncHandler.js";
import csvParser from "csv-parser";
import { Readable } from "stream";
import Lead from "../models/Leads.js";
// import Application from "../models/Applications";   // For credit manager to bulk upload applications

export const bulkUpload = asyncHandler(async (req, res) => {
    // Create a readable stream from the file buffer
    const readableFile = new Readable();
    readableFile._read = () => {}; // _read is a no-op
    readableFile.push(req.file.buffer); // Push the file buffer
    readableFile.push(null); // Indicate end of stream

    const results = [];

    // Parse the CSV from the buffer
    readableFile
        .pipe(csvParser())
        .on("data", (data) => {
            data.source = "bulk";
            results.push(data);
        })
        .on("end", async () => {
            await Lead.insertMany(results);
            res.json({ message: "Data added successfully." });
        });
});
