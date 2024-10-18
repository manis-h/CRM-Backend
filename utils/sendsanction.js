import axios from "axios";
import handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const apiKey = process.env.ZOHO_APIKEY;

export function dateFormatter(incommingDate) {
    const date = new Date(incommingDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}-${month}-${year}`;
}

export const generateSanctionLetter = async (
    subject,
    sanctionDate,
    title,
    fullname,
    mobile,
    residenceAddress,
    stateCountry,
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
            stateCountry: `${stateCountry}`,
            mobile: `${mobile}`,
            loanAmount: `${new Intl.NumberFormat().format(
                camDetails?.details.loanRecommended
            )}`,
            roi: `${camDetails?.details.eligibleRoi}`,
            disbursalDate: dateFormatter(camDetails?.details.disbursalDate),
            repaymentAmount: `${new Intl.NumberFormat().format(
                camDetails?.details.repaymentAmount
            )}`,
            tenure: `${camDetails?.details.eligibleTenure}`,
            repaymentDate: dateFormatter(camDetails?.details.repaymentDate),
            penalInterest: `${camDetails?.details.penalInterest || "0"}`,
            processingFee: `${new Intl.NumberFormat().format(
                camDetails?.details.totalAdminFeeAmount
            )}`,
            // repaymentCheques: `${camDetails?.details.repaymentCheques || "-"}`,
            // bankName: `${bankName || "-"}`,
            bouncedCharges: "1000",
            // annualPercentageRate: `${
            //     camDetails?.details.annualPercentageRate || "0"
            // }`,
        };

        let htmlToSend;
        try {
            htmlToSend = template(replacements);
            console.log(htmlToSend);
        } catch (error) {
            console.log(error);
        }

        // footer =
        //     "https://publicramlella.s3.ap-south-1.amazonaws.com/public_assets/Footer.jpg";
        // header =
        //     "https://publicramlella.s3.ap-south-1.amazonaws.com/public_assets/Header.jpg";

        // Setup the options for the ZeptoMail API
        const options = {
            method: "POST",
            url: "https://api.zeptomail.in/v1.1/email",
            headers: {
                accept: "application/json",
                authorization:
                    "Zoho-enczapikey PHtE6r1eFL/rjzF68UcBsPG/Q8L1No16/b5jKgkU44hBCPMFS00Eo49/xjO/ohkqU6JBRqTJy45v572e4u/TcWflNm1JWGqyqK3sx/VYSPOZsbq6x00etVkdd03eVoLue95s0CDfv9fcNA==",
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
                htmlbody: htmlToSend,
            }),
        };

        try {
            // Make the request to the ZeptoMail API
            await axios(options);
            return {
                success: true,
                message: "Email sent successfully",
            };
        } catch (error) {
            console.log("Some error occurred");
        }
    } catch (error) {
        return {
            success: false,
            message: `"Error in ZeptoMail API" ${error.message}`,
        };
    }
};
