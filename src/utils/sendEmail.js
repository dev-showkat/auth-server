import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ email, html }) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_CUSTOMER,
      to: email,
      subject: "OTP Verification",
      html,
    });
    return 0;
  } catch (error) {
    console.error("Error sending email:", error);
    throw Error("Error sending email");
  }
}

export default sendEmail;
