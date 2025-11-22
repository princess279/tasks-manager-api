import express from "express";
import sendEmail from "../utils/email.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await sendEmail(
      "your-test-email@example.com",
      "Test Email",
      "<h2>This is a test email from SendGrid + Render</h2>"
    );

    return res.json({ message: "Test email sent successfully!" });

  } catch (err) {
    console.error("Test email error:", err.message);
    return res.status(500).json({ message: "Failed to send test email" });
  }
});

export default router;