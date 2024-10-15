import axios from "axios";

async function cibilPdf(fName, lName, mName, mobileNo, pan) {
    const url =
        "https://ists.equifax.co.in/creditreportws/CreditReportWSInquiry/v1.0?wsdl=null";

    // SOAP XML Payload
    const xmlPayload = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://services.equifax.com/eport/ws/schemas/1.0">
        <soapenv:Header/>
        <soapenv:Body>
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
            <ns:RequestBody>
                <ns:InquiryPurpose>0E</ns:InquiryPurpose>
                <ns:TransactionAmount>0</ns:TransactionAmount>
                <ns:AdditionalSearchField>
                    <ns:FullName>${fName} ${mName} ${lName}</ns:FullName>
                    <ns:FirstName>${fName}</ns:FirstName>
                    <ns:MiddleName>${mName}</ns:MiddleName>
                    <ns:LastName>${lName}</ns:LastName>
                    <ns:AddrLine1>NEW DELHI DELHI</ns:AddrLine1>
                    <ns:City/>
                    <ns:State>DL</ns:State>
                    <ns:Postal>110057</ns:Postal>
                    <ns:DOB>1976-07-02</ns:DOB>
                    <ns:Gender>M</ns:Gender>
                    <ns:PANId>${pan}</ns:PANId>
                    <ns:MobilePhone>${mobileNo}</ns:MobilePhone>
                </ns:AdditionalSearchField>
            </ns:RequestBody>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

    const headers = {
        "Content-Type": "text/plain",
    };

    try {
        // Sending the POST request
        const response = await axios.post(url, xmlPayload, { headers });
        console.log("Response:", response.data);
        // Handle the response as needed
        return response.data;
    } catch (error) {
        console.error("Error:", error.message); // Handle the error
        throw error;
    }
}

// export default cibilPdf;

const response = await cibilPdf(
    "SHANKARANARAYANAN",
    "",
    "S",
    "9379166850",
    "AYJPV5807B",
    "SUMIT"
);

console.log("This is the response ", response.data);
