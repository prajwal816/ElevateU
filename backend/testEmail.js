import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendTestEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true if 465, false if 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be an app password
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself first
      subject: "Test Email from LMS Backend",
      text: "Hello! This is a test email.",
    });

    console.log("✅ Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
};

sendTestEmail();
