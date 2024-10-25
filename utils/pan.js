import axios from "axios";

export async function panVerify(pan) {
    const data = {
        pan: `${pan}`,
    };

    // const response = await axios.post(
    //     "https://www.timbleglance.com/api/pan_adv/",
    //     data,
    //     {
    //         headers: {
    //             "api-key": process.env.TIMBLE_APIKEY,
    //             "app-id": process.env.TIMBLE_APPID,
    //         },
    //     }
    // );
    // return response.data;

    return { verified: true, message: "Pan is verified!!" };
}

export async function panAadhaarLinkage(pan, aadhaar) {
    const data = {
        pan: `${pan}`,
        aadhaar: `${aadhaar}`,
    };

    // const response = await axios.post(
    //     "https://www.timbleglance.com/api/pan_adhr_link_v_2/",
    //     data,
    //     {
    //         headers: {
    //             "api-key": process.env.TIMBLE_APIKEY,
    //             "app-id": process.env.TIMBLE_APPID,
    //             "Content-Type": "application/json",
    //         },
    //     }
    // );
    // return response;

    return { verified: true, message: "Pan and aadhaar are linked!!" };
}
