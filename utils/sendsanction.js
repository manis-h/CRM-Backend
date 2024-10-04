import axios from "axios";

export const generateSenctionLetter = async (
  subject,
  letterheadUrl,
  sanctionDate,
  title,
  fullname,
  residenceAddress,
  camDetails,
  PORTAL_NAME,
  PORTAL_URL,
  acceptanceButton,
  acceptanceButtonLink,
  letterfooterUrl,
  toEmail,
  toName
) => {
  try {
    if (!toEmail || !toName || !subject) {
      throw new Error('Missing required fields: toEmail, toName, subject');
    }

    // Plain HTML email body using template literals
    const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 25px; font-size: 14px; border: solid 1px #ddd; padding: 10px;">
        <table width="667" border="0" align="center" style="padding: 0px 10px;">
            <tbody>
                <tr>
                    <td colspan="2">
                        <p style="color: #0363a3; font-size: 18px;">
                            <img src="${letterheadUrl}" alt="Sanctionletter-header" width="760" height="123" border="0" />
                        </p>
                    </td>
                </tr>
                <tr>
                    <td align="right" style="color: #0363a3; font-size: 18px;">
                        Date: ${sanctionDate}
                    </td>
                </tr>
                <tr>
                    <td><strong>To,</strong></td>
                </tr>
                <tr>
                    <td><strong>${title}</strong> ${fullname}</td>
                </tr>
                <tr>
                    <td>${residenceAddress}</td>
                </tr>
                <tr>
                    <td><strong>Contact No. :</strong> +91-${camDetails?.mobile}</td>
                </tr>
                <tr>
                    <td colspan="2">Thank you for showing your interest in ${PORTAL_NAME}.</td>
                </tr>
                <tr>
                    <td colspan="2">
                        We are pleased to inform you that your loan application has been approved.
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <table width="100%" border="0" cellpadding="8" cellspacing="1" bgcolor="#ddd">
                            <tbody>
                                <tr>
                                    <td width="43%" bgcolor="#FFFFFF"><strong>Customer Name</strong></td>
                                    <td bgcolor="#FFFFFF">${fullname}</td>
                                </tr>
                                <tr>
                                    <td bgcolor="#FFFFFF"><strong>Sanctioned Loan Amount (Rs.)</strong></td>
                                    <td bgcolor="#FFFFFF">${new Intl.NumberFormat().format(camDetails?.loan_recommended)} /-</td>
                                </tr>
                                <tr>
                                    <td bgcolor="#FFFFFF"><strong>Rate of Interest (%) per day</strong></td>
                                    <td bgcolor="#FFFFFF">${camDetails?.roi}</td>
                                </tr>
                                <!-- Other rows go here -->
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><strong style="color: #0363a3;">Best Regards,</strong></td>
                </tr>
                <tr>
                    <td colspan="2"><strong style="color: #0363a3;">Team ${PORTAL_NAME}</strong></td>
                </tr>
                <tr>
                    <td>${acceptanceButton}</td>
                </tr>
                <tr>
                    <td>${acceptanceButtonLink}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <img src="${letterfooterUrl}" alt="Sanctionletter-footer" width="760" height="104" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `;

    // Setup the options for the ZeptoMail API
    const options = {
      method: 'POST',
      url: 'https://api.zeptomail.in/v1.1/email',
      headers: {
        accept: 'application/json',
        authorization: 'Zoho-enczapikey PHtE6r1eFL/rjzF68UcBsPG/Q8L1No16/b5jKgkU44hBCPMFS00Eo49/xjO/ohkqU6JBRqTJy45v572e4u/TcWflNm1JWGqyqK3sx/VYSPOZsbq6x00etVkdd03eVoLue95s0CDfv9fcNA==',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
      },
      data: JSON.stringify({
        from: { address: 'badal@only1loan.com' },
        to: [{ email_address: { address: toEmail, name: toName } }],
        subject: subject,
        htmlbody: htmlBody,
      }),
    };

    // Make the request to the ZeptoMail API
    const response = await axios(options);
    return { success: true, message: 'Email sent successfully', response: response.data };
  } catch (error) {
    return { success: false, message: `"Error in ZeptoMail API" ${error.message}` };
  }
};
