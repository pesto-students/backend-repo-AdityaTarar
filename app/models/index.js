const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.patinet = require("./patient.model");
db.doctor = require("./doctor.model")
db.doctorsAvailability = require('./doctorAvailability.model')
db.appointments = require('./appointment.model')
db.videoConference = require('./videoConference.model')
db.medicines = require('./medicines.model')
db.vitals = require('./vitals.model')
db.payments = require('./payments.model')
module.exports = db;
