import axios from "axios";

async function fetchCibil() {
    try {
        const options = {
            method: "POST",
            url: "https://ists.equifax.co.in/cir360service/cir360report",
            headers: {
                "content-type": "application/json",
            },
            data: {
                RequestHeader: {
                    CustomerId: "9757",
                    UserId: "STS_TSTNAM",
                    Password: "V2*Pdhbr",
                    MemberNumber: "007FZ03452",
                    SecurityCode: "6XR",
                    CustRefField: "123456",
                    ProductCode: ["CCR"],
                },
                RequestBody: {
                    InquiryPurpose: "00",
                    FirstName: "ABHAY",
                    MiddleName: "RAJ",
                    LastName: "CHAUHAN",
                    DOB: "1993-10-18",
                    InquiryAddresses: [
                        {
                            seq: "1",
                            AddressType: ["H"],
                            AddressLine1: "new delhi ",
                            State: "DL",
                            Postal: "110057",
                        },
                    ],
                    InquiryPhones: [
                        {
                            seq: "1",
                            Number: "7727831882",
                            PhoneType: ["M"],
                        },
                    ],
                    IDDetails: [
                        {
                            seq: "1",
                            IDType: "T",
                            IDValue: "AVZPC6217D",
                            Source: "Inquiry",
                        },
                        {
                            seq: "2",
                            IDType: "P",
                            IDValue: "",
                            Source: "Inquiry",
                        },
                        {
                            seq: "3",
                            IDType: "V",
                            IDValue: "",
                            Source: "Inquiry",
                        },
                        {
                            seq: "4",
                            IDType: "D",
                            IDValue: "",
                            Source: "Inquiry",
                        },
                        {
                            seq: "5",
                            IDType: "M",
                            IDValue: "",
                            Source: "Inquiry",
                        },
                        {
                            seq: "6",
                            IDType: "R",
                            IDValue: "",
                            Source: "Inquiry",
                        },
                        {
                            seq: "7",
                            IDType: "O",
                            IDValue: "",
                            Source: "Inquiry",
                        },
                    ],
                    MFIDetails: {
                        FamilyDetails: [
                            {
                                seq: "1",
                                AdditionalNameType: "K01",
                                AdditionalName: "",
                            },
                            {
                                seq: "2",
                                AdditionalNameType: "K01",
                                AdditionalName: "",
                            },
                        ],
                    },
                },
                Score: [
                    {
                        Type: "ERS",
                        Version: "4.0",
                    },
                ],
            },
        };

        const response = await axios(options);

        const value =
            response.data?.CCRResponse?.CIRReportDataLst[0]?.CIRReportData
                ?.ScoreDetails[0]?.Value;

        return value;
    } catch (error) {
        throw new Error("Error fetching CIBIL", error.message);
    }
}

export default fetchCibil;
