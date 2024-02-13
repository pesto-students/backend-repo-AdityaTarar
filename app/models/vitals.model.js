const mongoose = require('mongoose');
const Vitals = mongoose.model('Vitals', new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Patient', // Assuming you have a Patient model
  },
  patientVitals: [
    {
      height: { type: Number },
      weight: { type: Number },
      hBp: { type: Number },
      lBp: { type: Number },
      heartRate: { type: Number },
      bodyTemp: { type: Number },
      date: { type: String },
      oxygenLevel: { type: Number },
      weight: { type: Number }
    },
  ],
}))

module.exports = Vitals