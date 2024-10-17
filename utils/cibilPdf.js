import axios from "axios";
import fs from "fs/promises";
import { Parser } from "xml2js";
import { join } from "path";
import puppeteer from "puppeteer";
import { uploadDocs } from "./docsUploadAndFetch.js";

async function htmlToPdf(lead, htmlResponse) {
    const key = `${lead._id}/cibilReport-${Date.now()}-cibilReport.pdf`;
    const uploadPromises = [];
    const documentUpdates = [];

    try {
        // Check if the document type already exists in the lead's document array
        // const existingDocIndex = lead.document.findIndex(
        //     (doc) => doc.type === "cibilReport"
        // );

        // Launch a new browser instance
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the HTML content for the page
        await page.setContent(htmlResponse[0]);

        // Generate a PDF from the HTML content
        const pdfBuffer = await page.pdf({
            format: "A4", // Page format
        });

        //   close the browser
        await browser.close();
        // Use the utility function to upload the PDF buffer
        const result = await uploadDocs(lead, null, {
            isBuffer: true,
            buffer: pdfBuffer,
            fieldName: "cibilReport",
        });

        if (!result) {
            return { success: false };
        }
        return { success: true };
    } catch (error) {
        console.error("Error while creating PDF or directory:", error);
    }
}

async function cibilPdf(lead) {
    const parser = new Parser();

    const options = {
        method: "POST",
        url: "https://ists.equifax.co.in/creditreportws/CreditReportWSInquiry/v1.0?wsdl=null",

        data: `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://services.equifax.com/eport/ws/schemas/1.0">
            <soapenv:Header/>
            <soapenv:Body>
                <InquiryRequest xmlns="http://services.equifax.com/eport/ws/schemas/1.0">
                    <ns:RequestHeader>
                        <ns:CustomerId>9757</ns:CustomerId>
                        <ns:UserId>STS_TSTNAM</ns:UserId>
                        <ns:Password>V2*Pdhbr</ns:Password>
                        <ns:MemberNumber>007FZ03452</ns:MemberNumber>
                        <ns:SecurityCode>6XR</ns:SecurityCode>
                        <ns:ProductVersion>4.6</ns:ProductVersion>
                        <ns:ReportFormat>XML</ns:ReportFormat>
                        <ns:ProductCode>CCR</ns:ProductCode>
                        <ns:CustRefField>123456</ns:CustRefField>
                    </ns:RequestHeader>
                    <ns:RequestAccountDetails seq="1">
                        <ns:AccountNumber></ns:AccountNumber>
                        <ns:KendraIDMFI></ns:KendraIDMFI>
                        <ns:BranchIDMFI></ns:BranchIDMFI>
                    </ns:RequestAccountDetails>
                    <ns:InquiryCommonAccountDetails>
                        <ns:InquiryAccount seq="1">
                            <ns:AccountNumber></ns:AccountNumber>
                            <ns:BranchIDMFI></ns:BranchIDMFI>
                            <ns:KendraIDMFI></ns:KendraIDMFI>
                        </ns:InquiryAccount>
                    </ns:InquiryCommonAccountDetails>
                    <ns:RequestBody>
                        <ns:InquiryPurpose>0E</ns:InquiryPurpose>
                        <ns:TransactionAmount>0</ns:TransactionAmount>
                        <ns:AdditionalSearchField></ns:AdditionalSearchField>
                        <ns:FullName>${lead.fName}${
            lead.mName && ` ${lead.mName}`
        } ${lead.lName}</ns:FullName>
                        <ns:FirstName>${lead.fName}</ns:FirstName>
                        <ns:MiddleName>${lead.mName}</ns:MiddleName>
                        <ns:LastName>${lead.lName}</ns:LastName>
                        <ns:FamilyDetails>
                            <ns:AdditionalNameInfo seq="1">
                                <ns:AdditionalName>SUMIT</ns:AdditionalName>
                                <ns:AdditionalNameType>K01</ns:AdditionalNameType>
                            </ns:AdditionalNameInfo>
                            <ns:NoOfDependents></ns:NoOfDependents>
                        </ns:FamilyDetails>
                        <ns:AddrLine1>NEW DELHI DELHI</ns:AddrLine1>
                        <ns:City></ns:City>
                        <ns:State>DL</ns:State>
                        <ns:Postal>110057</ns:Postal>
                        <ns:DOB>${lead.dob}</ns:DOB>
                        <ns:Gender>${lead.gender}</ns:Gender>
                        <ns:MaritalStatus></ns:MaritalStatus>
                        <ns:NationalIdCard></ns:NationalIdCard>
                        <ns:DriverLicense></ns:DriverLicense>
                        <ns:PassportId></ns:PassportId>
                        <ns:RationCard></ns:RationCard>
                        <ns:PANId>${lead.pan}</ns:PANId>
                        <ns:VoterId></ns:VoterId>
                        <ns:MobilePhone>${lead.mobile}</ns:MobilePhone>
                        <ns:RequestAccountDetails seq="1">
                            <ns:AccountNumber></ns:AccountNumber>
                            <ns:BranchIDMFI></ns:BranchIDMFI>
                            <ns:KendraIDMFI></ns:KendraIDMFI>
                        </ns:RequestAccountDetails>
                        <ns:InquiryCommonAccountDetails>
                            <ns:InquiryAccount seq="1">
                                <ns:AccountNumber></ns:AccountNumber>
                                <ns:BranchIDMFI></ns:BranchIDMFI>
                                <ns:KendraIDMFI></ns:KendraIDMFI>
                            </ns:InquiryAccount>
                        </ns:InquiryCommonAccountDetails>
                    </ns:RequestBody>
                    <ns:Scores>
                        <ns:Score seq="1">
                            <ns:Type>ERS</ns:Type>
                            <ns:Version>4.0</ns:Version>
                        </ns:Score>
                    </ns:Scores>
                </InquiryRequest>
            </soapenv:Body>
        </soapenv:Envelope>
    `,
        headers: {
            "Content-type": "text/xml",
        },
    };
    // `
    // <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://services.equifax.com/eport/ws/schemas/1.0">
    //     <soapenv:Header/>
    //     <soapenv:Body>
    //         <ns:RequestHeader>
    //             <ns:CustomerId>9757</ns:CustomerId>
    //             <ns:UserId>STS_TSTNAM</ns:UserId>
    //             <ns:Password>V2*Pdhbr</ns:Password>
    //             <ns:MemberNumber>007FZ03452</ns:MemberNumber>
    //             <ns:SecurityCode>6XR</ns:SecurityCode>
    //             <ns:ProductVersion>4.6</ns:ProductVersion>
    //             <ns:ReportFormat>XML</ns:ReportFormat>
    //             <ns:ProductCode>CCR</ns:ProductCode>
    //             <ns:CustRefField>123456</ns:CustRefField>
    //         </ns:RequestHeader>
    //         <ns:RequestBody>
    //             <ns:InquiryPurpose>0E</ns:InquiryPurpose>
    //             <ns:TransactionAmount>0</ns:TransactionAmount>
    //             <ns:AdditionalSearchField>
    //                 <ns:FullName>${fName} ${mName} ${lName}</ns:FullName>
    //                 <ns:FirstName>${fName}</ns:FirstName>
    //                 <ns:MiddleName>${mName}</ns:MiddleName>
    //                 <ns:LastName>${lName}</ns:LastName>
    //                 <ns:AddrLine1>NEW DELHI DELHI</ns:AddrLine1>
    //                 <ns:City/>
    //                 <ns:State>DL</ns:State>
    //                 <ns:Postal>110057</ns:Postal>
    //                 <ns:DOB>1976-07-02</ns:DOB>
    //                 <ns:Gender>M</ns:Gender>
    //                 <ns:PANId>${pan}</ns:PANId>
    //                 <ns:MobilePhone>${mobileNo}</ns:MobilePhone>
    //             </ns:AdditionalSearchField>
    //         </ns:RequestBody>
    //     </soapenv:Body>
    // </soapenv:Envelope>
    // `;

    try {
        // Sending the POST request
        const response = await axios(options);

        // Parse the XML response
        const parsedResponse = await parser.parseStringPromise(response.data);

        // Extract the HTML content inside <sch:HtmlReportResponse>
        const htmlReportResponse =
            parsedResponse["soapenv:Envelope"]["soapenv:Body"][0][
                "sch:InquiryResponse"
            ][0]["sch:HtmlReportResponse"][0]["sch:Content"];

        // // Save the extracted HTML to a file
        // fs.writeFileSync("report.html", htmlReportResponse);
        // console.log("HTML report saved successfully.");

        await htmlToPdf(lead, htmlReportResponse);

        // return htmlReportResponse;
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

export default cibilPdf;
