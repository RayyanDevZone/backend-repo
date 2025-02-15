import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sendEmail from "./utils/SendEmail.js";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("hello from server");
});

app.post("/api/sendemail", async (req, res) => {
  const { email, name } = req.body;
  console.log("Received Name:", name); // Debugging: Check if name is received
  try {
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.EMAIL_USER;
    const subject = "Thank you for registering";
    const message = `<h1>Hello ${name}</h1>
      <p>Thank you for registering with us</p>
      <p>Best regards</p>`;

    await sendEmail(subject, message, send_to, sent_from, reply_to);

    // Send user details to Slack
    const slackMessage = {
      text: `New registration:\n*Name:* ${name}\n*Email:* ${email}`,
    };
    await axios.post(process.env.SLACK_WEBHOOK_URL, slackMessage);

    res.status(200).json({ success: true, message: "Email sent and Slack notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
