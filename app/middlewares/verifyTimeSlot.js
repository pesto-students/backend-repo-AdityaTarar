const db = require("../models");
const Appointments = db.appointments

const checkTimeSlotAvailability = async (req, res, next) => {
  try {
    const { doctorId, date, time } = req.body; // Extract required information from request body

    const existingAppointment = await Appointments.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).send({ message: 'Time slot is already booked.' });
    }

    next(); // Proceed if time slot is available
  } catch (err) {
    return res.status(500).send({ message: err.message || 'An error occurred while checking time slot availability.' });
  }
};

module.exports = checkTimeSlotAvailability;
