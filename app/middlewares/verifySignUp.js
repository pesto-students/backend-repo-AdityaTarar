const db = require("../models");
const Patient = db.patinet;
const Doctor = db.doctor;

checkDuplicatePatientUsernameOrEmail = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      email: req.body.email,
    });

    if (patient) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ message: err.message || "An error occurred while checking for duplicate email." });
  }
};
checkDuplicateDoctorUsernameOrEmail = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      email: req.body.email,
    });

    if (doctor) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ message: err.message || "An error occurred while checking for duplicate email." });
  }
};



const verifySignUp = {
  checkDuplicatePatientUsernameOrEmail,
  checkDuplicateDoctorUsernameOrEmail
};

module.exports = verifySignUp;