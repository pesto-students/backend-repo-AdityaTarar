const db = require('../../models')
const Doctor = db.doctor
const Medicines = db.medicines

exports.getMedicationbyPatient = async (req, res) => {
  const { patientId } = req.body
  try {
    const medications = await Medicines.find({ patientId: patientId })
    if (!medications) {
      res.status(200).json({ message: 'No medicines found' })
    }
    res.send(medications)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.getMedicationsByAppointmentId = async (req, res) => {
  const { patientId, appointmentId } = req.body
  try {
    const medications = await Medicines.find({ patientId: patientId, appointmentId: appointmentId })
    if (!medications) {
      res.status(200).json({ message: 'No medicines found' })
    }
    res.send(medications)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }

}