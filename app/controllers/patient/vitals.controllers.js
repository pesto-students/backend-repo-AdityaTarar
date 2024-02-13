const db = require('../../models/index')
const Vitals = db.vitals;

exports.updateVitals = async (req, res) => {
  const { patientId, patientVitals } = req.body;

  try {
    // Find existing vitals document for the patient
    const existingVital = await Vitals.findOne({ patientId });

    if (!existingVital) {
      // If no existing document, create a new one
      const newVitals = new Vitals({
        patientId,
        patientVitals: [patientVitals], // Create an array with the first set of vitals
      });

      await newVitals.save();
      res.status(200).json({ message: 'New vitals have been saved.' });
    } else {
      // If existing document, update the patientVitals array
      existingVital.patientVitals = existingVital.patientVitals || []; // Ensure patientVitals is initialized as an array
      existingVital.patientVitals.push(patientVitals);
      await existingVital.save();
      res.status(200).json({ message: 'Vitals have been updated successfully.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
exports.getAllVitalsByPatient = async (req, res) => {
  const { patientId } = req.body
  console.log('patientId', patientId);
  try {
    const vitals = await Vitals.find({ patientId: patientId });
    if (!vitals) {
      res.status(200).json({ message: 'No vitals found for patient' })
    }
    res.send(vitals[0]?.patientVitals)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });

    res.status(500).json({ message: 'Internal server error.' });

  }
}
