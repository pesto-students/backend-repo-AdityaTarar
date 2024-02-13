const db = require('../../models')
const Appointments = db.appointments
const Medicines = db.medicines
exports.getMyUpcommingAppointments = async (req, res) => {
  const { doctorId, date } = req.body
  try {
    const appointments = await Appointments.find({ doctorId: doctorId, date: date })
    if (!appointments) {
      res.status(200).json({ message: 'No upcomming appointments' })
    }
    res.send(appointments)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.addMedication = async (req, res) => {
  try {
    const medicines = new Medicines({
      doctorId: req.body.doctorId,
      patientId: req.body.patientId,
      appointmentId: req.body.appointmentId,
      symptons: req.body.symptons,
      medication: req.body.medication,
      prescribedDate: req.body.prescribedDate,
      courseDuration: req.body.courseDuration,
      doctorName: req.body.doctorName
    });
    await medicines.save()
    res.send({ message: `Medication as been successfully prescribed!` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.getAppointmentByDoctors = async (req, res) => {
  const { doctorId } = req.body;
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in the format "YYYY-MM-DD"
    console.log('doctorId', doctorId);
    const appointmentsList = await Appointments.find({ doctorId: doctorId });
    if (!appointmentsList || appointmentsList.length === 0) {
      return res.status(200).json({
        upcomingAppointments: [],
        pastAppointments: [],
        message: 'No Appointments booked'
      });
    }

    // Separate appointments into past and upcoming based on the appointment date
    const pastAppointments = appointmentsList.filter(appointment => appointment.date < currentDate);
    const upcomingAppointments = appointmentsList.filter(appointment => appointment.date >= currentDate);

    // Sort past appointments by date in descending order
    pastAppointments.sort((a, b) => (a.date > b.date) ? -1 : 1);

    // Sort upcoming appointments by date in ascending order
    upcomingAppointments.sort((a, b) => (a.date > b.date) ? 1 : -1);

    // Create the final response object
    const response = {
      upcomingAppointments: upcomingAppointments,
      pastAppointments: pastAppointments
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error searching appointment by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};