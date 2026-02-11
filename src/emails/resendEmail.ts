import nodemailer from "nodemailer";

export const resendOtpEmail = async (email: string, otp: string) => {
  const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.EMAIL}`,
      pass: `${process.env.EMAIL_PASSWORD}`,
    },
  });

  const emailDetails = {
    from: `${process.env.EMAIL}`,
    to: `${email}`,
    subject: "OTP Resent Successful",
    html: `

    <h2>Welcome to Wagger Demo System!</h2>

    <p>Here is your otp ${otp}</p>
    <p>We're excited to have you join us.</p>

    <p>
       

    <hr>

    <p>Thank you,<br/>The Swagger Team</p>
`,
  };

  await mailTransport.sendMail(emailDetails);
};
