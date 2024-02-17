const db = require("../models");
const OTP = db.otp

const accountSid = process.env.TWILIO_SID_TOKEN;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6 digit OTP
    const otpData = new OTP({ mobileNumber, otp });
    await otpData.save();
    const messageBody = `Your OTP is: ${otp}`;
    client.messages
      .create({
        body: messageBody,
        to: `+91${mobileNumber}`,
        from: '+13145495492'
      })
      .then(message => console.log(message.sid))
    res.json({ message: 'OTP sent to your mobile number.' });
  } catch (error) {
    console.log(
      error
    );
  }
}