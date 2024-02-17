const db = require('../../models/index')
const Vitals = db.vitals;

exports.updateVitals = async (req, res) => {
  const { patientId, patientVitals } = req.body;

  try {
    const existingVital = await Vitals.findOne({ patientId });

    if (!existingVital) {
      const newVitals = new Vitals({
        patientId,
        patientVitals: [patientVitals],
      });

      await newVitals.save();
      res.status(200).json({ message: 'New vitals have been saved.' });
    } else {
      const latestVitals = existingVital.patientVitals[existingVital.patientVitals.length - 1] || {};
      const updatedVitals = {};
      Object.keys(patientVitals).forEach(key => {
        if (patientVitals[key] !== "0") {
          updatedVitals[key] = patientVitals[key];
        } else if (latestVitals[key] !== undefined) {
          updatedVitals[key] = latestVitals[key];
        }
      });

      updatedVitals.date = patientVitals.date || latestVitals.date;

      existingVital.patientVitals.push(updatedVitals);
      await existingVital.save();
      res.status(200).json({ message: 'Vitals have been updated successfully.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

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
