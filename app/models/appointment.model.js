const mongoose = require('mongoose')
const Appointments = mongoose.model('Appointments', new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  appointmentId: {
    type: String,
    default: () => {
      const randomNums = Math.floor(Math.random() * 9000000000) + 1000000000; // Generates 9 random digits
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      return `${randomNums}${year}${month}`;
    },
    unique: true,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date: String,
  time: String,
  onlineConsultation: Boolean,
  location: String,
  status: String,
  patientInfo: Object,
  paymentMode: String,
  paymentId: String,
  issue: String,
  consultationFee: Number,
  doctorDetails: Object
}))
module.exports = Appointments