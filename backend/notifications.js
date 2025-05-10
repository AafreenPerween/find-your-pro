require("dotenv").config();
const twilio = require("twilio");

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function sendSMSNotification(message) {
    client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.ADMIN_PHONE_NUMBER
    }).then(() => console.log("📲 SMS sent successfully!"))
      .catch(err => console.error("⚠ SMS Error:", err));
}

module.exports = sendSMSNotification; // ✅ Make sure this is exporting the function