const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  availableTimeSlots: [{ type: String, required: true }],
  duration: { type: String, required: true },
  unavailableTimeSlots: [{ type: String, required: true }]
});

const DoctorAvailabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  availability: [AvailabilitySchema]
});

const DoctorAvailability = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);

module.exports = DoctorAvailability;
