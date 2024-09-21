// config/otpUtil.js
import axios from 'axios';

export const generateOtpWithAadhaar = async (aadhaarNumber) => {
    const data = JSON.stringify({ "aadhaarNumber": aadhaarNumber });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api-preproduction.signzy.app/api/v3/getOkycOtp',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Ks7wDpfSe075bPYvWH6zzQHmoirMD51O'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    return response.data; // Return the response data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred'); // Handle errors
  }
};
