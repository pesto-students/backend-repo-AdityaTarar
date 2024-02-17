
const mongoose = require("mongoose");

const OTP = mongoose.model(
  "OTP",
  new mongoose.Schema({
    mobileNumber: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // OTP expires after 300 seconds
  })
);

module.exports = OTP;
