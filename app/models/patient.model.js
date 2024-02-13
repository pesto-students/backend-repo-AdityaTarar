const mongoose = require("mongoose");

const Patient = mongoose.model(
  "Patient",
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

  })
);

module.exports = Patient;
