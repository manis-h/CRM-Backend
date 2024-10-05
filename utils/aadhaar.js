// config/otpUtil.js
import axios from "axios";

export const generateAadhaarOtp = async (aadhaar) => {
    const data = { aadhaar_no: aadhaar };

    const config = {
        method: "post",
        url: "https://www.timbleglance.com/api/aadhaar_otp_okyc/",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.TIMBLE_APIKEY,
            "app-id": process.env.TIMBLE_APPID,
        },
        data,
    };

    try {
        const response = await axios.request(config);
        return response.data; // Return the response data
    } catch (error) {
        throw new Error(error.response?.data?.message || "An error occurred"); // Handle errors
    }
};

export const verifyAadhaarOtp = async (otp, trx_id) => {
    const data = { otp: `${otp}`, trx_id: `${trx_id}` };
    const config = {
        method: "post",
        url: "https://www.timbleglance.com/api/aadhaar_result_okyc/",
        headers: {
            "api-key": process.env.TIMBLE_APIKEY,
            "app-id": process.env.TIMBLE_APPID,
            "Content-Type": "application/json",
        },
        data,
    };
    try {
        const response = await axios.request(config);
        return response.data; // Return the response data
    } catch (error) {
        throw new Error(error.response?.data?.message || "An error occurred");
    }
};
