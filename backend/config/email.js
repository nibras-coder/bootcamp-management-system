const nodemailer = require("nodemailer");

console.log("Checking Env Variables - User:", process.env.EMAIL_USER ? "Loaded" : "MISSING", "Pass:", process.env.EMAIL_PASS ? "Loaded" : "MISSING");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify()
  .then(() => console.log("Email transport is verified and ready"))
  .catch((error) => console.error("Email transport verification failed:", error.message));

module.exports = transporter;