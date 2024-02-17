const mongoose = require('mongoose')
const Payments = mongoose.model('Payments', new mongoose.Schema({
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
  reciptId: {
    type: String,
    default: () => {
      const randomNums = Math.floor(Math.random() * 9000000) + 1000000; // Generates 9 random digits
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      return `#${randomNums}${year}${month}`;
    },
    unique: true,
    required: true,
  },
  paymentMode: String,
  paymentDate: String,
  paymentStatus: String,
  orderId: String,
  consultationMode: String,
  consultationFee: String
}))
module.exports = Payments