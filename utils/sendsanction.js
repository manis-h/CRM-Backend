import axios from "axios";
import handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const apiKey = process.env.ZOHO_APIKEY;

export const generateSanctionLetter = async (
    subject,
    sanctionDate,
    title,
    fullname,
    residenceAddress,
    camDetails,
    recipientEmail
) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, "../config/sanction.html");
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handlebars.compile(source);
        let replacements = {
            sanctionDate: `${sanctionDate}`,
            title: `${title}`,
            fullname: `${fullname}`,
            residenceAddress: `${residenceAddress}`,
            mobile: `${personalMobile}`,
            loanAmount: `${new Intl.NumberFormat().format(
                camDetails?.loanAmount
            )}`,
            roi: `${camDetails?.roi}`,
            sanctionDate: `${sanctionDate}`,
            repaymentAmount: `${new Intl.NumberFormat().format(
                camDetails?.repaymentAmount
            )}`,
            tenure: `${tenure}`,
            repaymentDate: `${repaymentDate}`,
            penalInterest: `${penalInterest}`,
            processingFee: `${new Intl.NumberFormat().format(
                camDetails?.processingFee
            )}`,
            repaymentCheques: `${repaymentCheques}`,
            bankName: `${bankName}`,
            bouncingCharges: `${new Intl.NumberFormat().format(
                camDetails?.bouncingCharges
            )}`,
            annualPercentageRate: `${annualPercentageRate}`,
        };
        const htmlToSend = template(replacements);

        // footer =
        //     "https://publicramlella.s3.ap-south-1.amazonaws.com/public_assets/Footer.jpg";
        // header =
        //     "https://publicramlella.s3.ap-south-1.amazonaws.com/public_assets/Header.jpg";

        // Plain HTML email body using template literals
        const htmlBody = htmlToSend;

        // Setup the options for the ZeptoMail API
        const options = {
            method: "POST",
            url: "https://api.zeptomail.in/v1.1/email",
            headers: {
                accept: "application/json",
                authorization: apiKey,
                "cache-control": "no-cache",
                "content-type": "application/json",
            },
            data: JSON.stringify({
                from: { address: "info@only1loan.com" },
                to: [
                    {
                        email_address: {
                            address: recipientEmail,
                            name: fullname,
                        },
                    },
                ],
                subject: subject,
                htmlbody: htmlBody,
                priority: "high",
            }),
        };

        // Make the request to the ZeptoMail API
        const response = await axios(options);
        return {
            success: true,
            message: "Email sent successfully",
        };
    } catch (error) {
        return {
            success: false,
            message: `"Error in ZeptoMail API" ${error.message}`,
        };
    }
};
