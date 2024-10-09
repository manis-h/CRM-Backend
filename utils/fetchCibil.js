import axios from "axios";

async function fetchCibil(lead) {
    try {
        const {fName, mName, lName, dob, mobile, pan} = lead;
        const data = {
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
                FirstName: "BADAL",
                MiddleName: "",
                LastName: "KUMAR",
                DOB: "2002-12-22",
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
                        Number: "9199479407",
                        PhoneType: ["M"],
                    },
                ],
                IDDetails: [
                    {
                        seq: "1",
                        IDType: "T",
                        IDValue: "HKCPK6182A",
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
        };

        const stringifiedData = JSON.stringify(data, null, 4);

        // console.log(stringifiedData);

        // const response = await fetch(
        //     "https://ists.equifax.co.in/cir360service/cir360report",
        //     {
        //         method: "POST", // Specify the method as POST
        //         headers: {
        //             "Content-Type": "application/json", // Specify the content type
        //         },
        //         body: JSON.stringify(data), // Convert data object to JSON string
        //     }
        // );

        const response = await axios.post(
            "https://ists.equifax.co.in/cir360service/cir360report",
            stringifiedData,
            {
                headers: {
                    "Content-type": "application/json",
                },
            }
        );

        return response;
    } catch (error) {
        throw new Error("Error fetching CIBIL", error.message);
    }
}

export default fetchCibil;
