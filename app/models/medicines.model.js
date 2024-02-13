const mongoose = require('mongoose')
const Medicines = mongoose.model('Medicines', new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointments',
    required: true,
  },
  doctorName: String,
  symptons: String,
  medication: Array,
  prescribedDate: String,
  courseDuration: String,

}))
module.exports = Medicines