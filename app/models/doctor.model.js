const mongoose = require("mongoose");

const Doctor = mongoose.model(
  "Doctor",
  new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String,
    dob: String,
    gender: String,
    city: String,
    address: String,
    phone_number: Number,
    licence: String,
    degree: String,
    specialization: String,
    experience: Number,
    inClinic: Boolean,
    onlineConsultation: Boolean,
    consultationFee: Number
    // availabledays: String,
    // timeslot: String,
    // duration: Number
  })
);

module.exports = Doctor;
