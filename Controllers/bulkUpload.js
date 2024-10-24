import { Readable } from 'stream';
import csvParser from 'csv-parser';
import asyncHandler from '../middleware/asyncHandler.js';
import Lead from '../models/Leads.js';
import { postLogs } from './logs.js';
import LogHistory from '../models/LeadLogHistory.js';

export const bulkUpload = asyncHandler(async (req, res) => {
    const readableFile = new Readable();
    readableFile._read = () => {}; 
    readableFile.push(req.file.buffer);
    readableFile.push(null); 

    const results = [];
    const BATCH_SIZE = 1000; 
    let insertedCount = 0;

    readableFile
        .pipe(csvParser())
        .on("data", (data) => {
            const {
                fName,
                mName,
                lName,
                gender,
                dob,
                aadhaar,
                pan,
                mobile,
                alternateMobile,
                personalEmail,
                officeEmail,
                loanAmount,
                salary,
                pinCode,
                state,
                city,
            } = data;


            const newLead = {
                fName,
                mName: mName ?? "",
                lName: lName ?? "",
                gender,
                dob:new Date(dob),
                aadhaar,
                pan,
                mobile: String(mobile),
                alternateMobile: String(alternateMobile),
                personalEmail,
                officeEmail,
                loanAmount,
                salary,
                pinCode,
                state,
                city,
                source: "bulk",
            };

            results.push(newLead);

            if (results.length === BATCH_SIZE) {
                readableFile.pause(); 
                insertBatch(results).then(() => {
                    insertedCount += results.length;
                    results.length = 0; 
                    readableFile.resume(); 
                }).catch(error => {
                    console.error("Error in batch insert:", error);
                    res.status(500).json({ message: "Error during bulk upload." });
                });
            }
        })
        .on("end", async () => {
            try {
                if (results.length > 0) {
                    await insertBatch(results);
                    insertedCount += results.length;
                }

                res.json({ message: `Data added successfully. ${insertedCount} leads inserted.` });
            } catch (error) {
                console.error("Error during bulk upload:", error);
                res.status(500).json({ message: "An error occurred during bulk upload." });
            }
        });
});

async function insertBatch(leadsBatch) {
    const logResults = [];

    for (const leadData of leadsBatch) {
        
        try {
            const newLead = await Lead.create(leadData);
            
            const leadLog ={
                lead: newLead._id,
                logDate: new Date(),
                status: "NEW LEAD",
                borrower: `${newLead.fName} ${newLead.mName ?? ""} ${newLead.lName}`,
                leadRemark: "New lead created via bulk upload",
            }
    
            logResults.push(leadLog)
        } catch (error) {
            console.log('errorrrrr',error.message)
            
        }

    }

    if(logResults.length > 0){
        try {
            await LogHistory.insertMany(logResults)
            
        } catch (error) {

            console.log('error',error)
            throw new Error("Bulk upload log Issue",error.message)
            
        }
        
    }
}

