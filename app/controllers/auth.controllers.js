const config = require("../config/auth.config");
const db = require("../models");
const Patient = db.patinet;
const Doctor = db.doctor;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var CryptoJS = require("crypto-js");
const OTP = db.otp;

// Patient controller
exports.patientSignup = async (req, res) => {
  try {
    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'password',
      'dob',
      'gender',
      'city',
      'address',
      'phone_number',
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const patient = new Patient({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      dob: req.body.dob,
      gender: req.body.gender,
      city: req.body.city,
      address: req.body.address,
      phone_number: req.body.phone_number,
      height: Number(req.body.height),
      weight: Number(req.body.weight),
    });

    await patient.save();
    res.send({ message: `${req.body.first_name} ${req.body.last_name} has been registered successfully!` });
  } catch (err) {
    res.status(500).send({ message: err.message || 'Some error occurred while registering the patient.' });
  }
};


exports.patientSignin = async (req, res) => {
  const { formData } = req.body;
  // var bytes = CryptoJS.AES.decrypt(req?.body?.formData, "secret key 123");
  // var formData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  // console.log('formData', formData);
  try {
    const patient = await Patient.findOne({ email: formData.email });

    if (!patient) {
      return res.status(201).send({ message: "Patient Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(formData.password, patient.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign({ id: patient._id }, config.accessToken, {
      expiresIn: '1m',
    });
    const refreshToken = jwt.sign({ id: patient._id }, config.refreshToken, {
      expiresIn: '7d',
    });
    const responseData = {
      _id: patient._id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      dob: patient.dob,
      gender: patient.gender,
      city: patient.city,
      address: patient.address,
      phone_number: patient.phone_number,
      height: patient.height,
      weight: patient.weight
    };

    res.status(200).send({ data: responseData, token: token, refreshToken: refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//doctor controller
exports.doctorSignup = async (req, res) => {
  try {
    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'password',
      'dob',
      'gender',
      'city',
      'address',
      'phone_number',
      'licence',
      'specialization',
      'degree',
      'experience',
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const doctor = new Doctor({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      dob: req.body.dob,
      gender: req.body.gender,
      city: req.body.city,
      address: req.body.address,
      phone_number: req.body.phone_number,
      specialization: req.body.specialization,
      degree: req.body.degree,
      experience: req.body.experience,
      onlineConsultation: req.body.onlineConsultation,
      inClinic: req.body.inClinic,
      consultationFee: req?.body?.consultationFee
    });

    await doctor.save();
    res.status(200).json({ message: `${req.body.first_name} ${req.body.last_name} has been registered successfully!` });
  } catch (err) {
    res.status(500).send({ message: err.message || 'Some error occurred while registering the patient.' });
  }
};

exports.doctorSignin = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.body.email });

    if (!doctor) {
      return res.status(404).send({ message: "Doctor Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, doctor.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign({ id: doctor._id }, config.accessToken, {
      expiresIn: 86400, // 24 hours
    });
    const responseData = {
      _id: doctor._id,
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      email: doctor.email,
      dob: doctor.dob,
      gender: doctor.gender,
      city: doctor.city,
      address: doctor.address,
      phone_number: doctor.phone_number,
      licence: doctor.licence,
      degree: doctor.degree,
      specialization: doctor.specialization,
      experience: doctor.experience,
      inClinic: doctor.inClinic,
      onlineConsultation: doctor.onlineConsultation,
      consultationFee: doctor.consultationFee
    };
    res.status(200).send({ data: responseData, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
exports.changePassword = async (req, res) => {
  const { id, isPatient, oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords are required.' });
  }

  try {
    // Find the user by ID
    const user = await isPatient === 'true' ? Patient.findById(id) : Doctor.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password.', error: error.message });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { mobileNumber, otp, password, userType } = req.body;
    const otpRecord = await OTP.findOne({ mobileNumber, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    if (userType === 'patient') {
      await Patient.findOneAndUpdate({ phone_number: mobileNumber }, { password: hashedPassword });

    } else {
      await Doctor.findOneAndUpdate({ phone_number: mobileNumber }, { password: hashedPassword });

    }
    await OTP.findByIdAndDelete(otpRecord._id);
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {

  }
}
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).send({ message: "Refresh Token is required" });
  console.log('refreshToken', refreshToken);
  try {
    const decoded = jwt.verify(refreshToken, config.refreshToken);
    // console.log('decoded', decoded);
    const userId = decoded.id;
    // Optionally, verify the refresh token exists in your DB

    const newAccessToken = jwt.sign({ id: userId }, config.accessToken, {
      expiresIn: '2m', // New access token with short expiry
    });
    console.log('newAccessToken', newAccessToken);
    res.status(200).send({
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).send({ message: "Invalid Refresh Token" });
  }
};
exports.updateDoctorProfile = async (req, res) => {
  const { id, first_name, last_name, address, city, phone_number, email } = req.body
  try {
    const updateProfile = Doctor.findByIdAndUpdate(id, {
      first_name: first_name,
      last_name: last_name,
      address: address,
      email: email,
      phone_number: phone_number,
      city: city
    })
    if (!updateProfile) {
      return res.status(400).json({ message: 'Doctor not found' })
    }
    res.status(200).json({ message: 'Profile updated sucessfully' })
  } catch (error) {
    return res.status(403).send({ message: error });

  }
}
exports.updatePatientProfile = async (req, res) => {
  const { id, first_name, last_name, address, city, phone_number, email } = req.body
  console.log('updatePatientProfile', { id, first_name, last_name, address, city, phone_number, email });
  try {
    const updateProfile = await Patient.findOneAndUpdate({ _id: id }, {
      first_name: first_name,
      last_name: last_name,
      address: address,
      email: email,
      phone_number: Number(phone_number),
      city: city
    })
    console.log('updateProfile', updateProfile);
    if (!updateProfile) {
      return res.status(400).json({ message: 'Patient not found' })
    }
    res.status(200).json({ message: 'Profile updated sucessfully', data: updateProfile })
  } catch (error) {
    console.log(error);
    return res.status(403).send({ message: error });
  }
}