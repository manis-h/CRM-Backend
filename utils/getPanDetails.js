import axios from "axios";
const getPanDetails = async ({ pan, getStatusInfo }) => {
    // let data = JSON.stringify({
    //   panNumber: "ABCDE1234F",
    //   getStatusInfo: true,
    // });

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://api-preproduction.signzy.app/api/v3/panextensive",
        headers: {
            Authorization: process.env.SIGNZY_PRE_PRODUCTION, // Pre-production Access Key
            "Content-Type": "application/json",
        },
        data: { pan, getStatusInfo },
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.log("Error from Signzy");
        throw new Error(error.response.data.message || "An error occurred");
    }
};
export { getPanDetails };
