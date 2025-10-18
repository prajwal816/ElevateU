// utils/sendEmail.js
import nodemailer from "nodemailer";

/**
 * Sends an email using Gmail SMTP.
 * Ensure your .env contains:
 * EMAIL_USER=yoursecondary@gmail.com
 * EMAIL_PASS=16char_app_password
 */
export const sendEmail = async (to, subject, html) => {
  try {
    console.log("📬 Preparing to send email...");
    console.log("Recipient:", to);
    console.log("Subject:", subject);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-character Gmail App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // must match your Gmail exactly
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📨 Email sent via Gmail SMTP");
    console.log("Accepted recipients:", info.accepted);
    console.log("Rejected recipients:", info.rejected);
    console.log("Pending:", info.pending);
    console.log("Message ID:", info.messageId);

    if (info.rejected.length > 0) {
      console.warn("⚠️ Some recipients were rejected:", info.rejected);
    }

    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    throw err;
  }
};

/**
 * Helper: send grade notification
 */
export const sendGradeNotification = async (studentEmail, courseName, grade, feedback) => {
  const html = `
    <h3>Your assignment has been graded!</h3>
    <p>Course: <b>${courseName}</b></p>
    <p>Grade: <b>${grade}</b></p>
    <p>Feedback: ${feedback || "No feedback provided"}</p>
    <br/>
    <p>– LMS Auto Notification</p>
  `;
  await sendEmail(studentEmail, `Grade Received for ${courseName}`, html);
};

/**
 * Helper: plagiarism alert
 */
export const sendPlagiarismAlert = async (teacherEmail, assignmentTitle, details) => {
  const html = `
    <h3>Plagiarism Check Completed</h3>
    <p>Assignment: <b>${assignmentTitle}</b></p>
    <p>Potential matches detected:</p>
    <pre>${JSON.stringify(details, null, 2)}</pre>
    <p>Please review the report in your LMS dashboard.</p>
  `;
  await sendEmail(teacherEmail, `Plagiarism Report for ${assignmentTitle}`, html);
};
