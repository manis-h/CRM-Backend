import axios from "axios";

const apiKey =
    process.env.ZOHO_APIKEY ||
    "Zoho-enczapikey PHtE6r1eFL/rjzF68UcBsPG/Q8L1No16/b5jKgkU44hBCPMFS00Eo49/xjO/ohkqU6JBRqTJy45v572e4u/TcWflNm1JWGqyqK3sx/VYSPOZsbq6x00etVkdd03eVoLue95s0CDfv9fcNA==";

async function sendEmail(email, recipientName, subject, otp) {
    const payload = {
        // bounce_address: "ajay@only1loan.com", // Replace with your bounce address
        from: {
            email: "ajay@only1loan.com", // Replace with your sender email
            name: "Naman Finlease Private Limited", // Replace with your sender name
        },
        to: [
            {
                email: `${email}`, // Replace with recipient email
                name: `${recipientName}`, // Replace with recipient name
            },
        ],
        subject: `${subject}`,
        htmlbody: `<p>Your email verification OTP is <strong>${otp}</strong>.</p>`,
    };

    try {
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
                from: { address: "ajay@only1loan.com" },
                to: [
                    { email_address: { address: email, name: recipientName } },
                ],
                subject: subject,
                htmlbody: `<p>Your email verification OTP is <strong>${otp}</strong>.</p>`,
            }),
        };

        const response = await axios(options);

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new Error("Error sending email", error.message);
    }
}

export default sendEmail;
