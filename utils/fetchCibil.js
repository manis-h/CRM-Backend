import axios from "axios";

async function fetchCibil(
    fName = "",
    mName = "",
    lName = "",
    pan = "",
    dob = "",
    mobile = ""
) {
    console.log(fName, mName, lName, pan, dob, mobile);

    try {
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
                FirstName: fName,
                MiddleName: mName,
                LastName: lName,
                DOB: dob,
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
                        Number: mobile,
                        PhoneType: ["M"],
                    },
                ],
                IDDetails: [
                    {
                        seq: "1",
                        IDType: "T",
                        IDValue: pan,
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

        // = {
        //     RequestHeader: {
        //         CustomerId: "9757",
        //         UserId: "STS_TSTNAM",
        //         Password: "V2*Pdhbr",
        //         MemberNumber: "007FZ03452",
        //         SecurityCode: "6XR",
        //         CustRefField: "123456",
        //         ProductCode: ["CCR"],
        //     },
        //     RequestBody: {
        //         InquiryPurpose: "00",
        //         FirstName: "ABHAY",
        //         MiddleName: "RAJ",
        //         LastName: "CHAUHAN",
        //         DOB: "1993-10-18",
        //         InquiryAddresses: [
        //             {
        //                 seq: "1",
        //                 AddressType: ["H"],
        //                 AddressLine1: "new delhi ",
        //                 State: "DL",
        //                 Postal: "110057",
        //             },
        //         ],
        //         InquiryPhones: [
        //             {
        //                 seq: "1",
        //                 Number: "7727831882",
        //                 PhoneType: ["M"],
        //             },
        //         ],
        //         IDDetails: [
        //             {
        //                 seq: "1",
        //                 IDType: "T",
        //                 IDValue: "AVZPC6217D",
        //                 Source: "Inquiry",
        //             },
        //             {
        //                 seq: "2",
        //                 IDType: "P",
        //                 IDValue: "",
        //                 Source: "Inquiry",
        //             },
        //             {
        //                 seq: "3",
        //                 IDType: "V",
        //                 IDValue: "",
        //                 Source: "Inquiry",
        //             },
        //             {
        //                 seq: "4",
        //                 IDType: "D",
        //                 IDValue: "",
        //                 Source: "Inquiry",
        //             },
        //             {
        //                 seq: "5",
        //                 IDType: "M",
        //                 IDValue: "",
        //                 Source: "Inquiry",
        //             },
        //             {
        //                 seq: "6",
        //                 IDType: "R",
        //                 IDValue: "",
        //                 Source: "Inquiry",
        //             },
        //             {
        //                 seq: "7",
        //                 IDType: "O",
        //                 IDValue: "",
        //                 Source: "Inquiry",
        //             },
        //         ],
        //         MFIDetails: {
        //             FamilyDetails: [
        //                 {
        //                     seq: "1",
        //                     AdditionalNameType: "K01",
        //                     AdditionalName: "",
        //                 },
        //                 {
        //                     seq: "2",
        //                     AdditionalNameType: "K01",
        //                     AdditionalName: "",
        //                 },
        //             ],
        //         },
        //     },
        //     Score: [
        //         {
        //             Type: "ERS",
        //             Version: "4.0",
        //         },
        //     ],
        // };

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
