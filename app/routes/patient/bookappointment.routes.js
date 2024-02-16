const controller = require("../../controllers/patient/bookappointment.controllers");
const checkTimeSlotAvailability = require('../../middlewares/verifyTimeSlot')
const createAccountLimiter = require('../../middlewares/rateLimiter')
const verifyToken = require("../../middlewares/authJwt");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/doctor/search", [verifyToken], controller.doctorSearch);
  app.post("/api/doctor/bookappointment", [checkTimeSlotAvailability], controller.bookApoointmentController);
  app.post("/api/doctor/cancelAppointment", controller.cancelAppointment);
  app.post("/api/doctor/getAppointmentStatusByID", controller.getAppointmentStatusByID);
  app.post("/api/doctor/recheduleAppointment", [checkTimeSlotAvailability], controller.recheduleAppointment);
  app.get("/api/doctor/getAppointmentByPatient", controller.getAppointmentByPatient);
  app.get("/api/doctor/getAllDoctorList", controller.getAllDoctorList);
  app.post("/api/doctor/getVideoConferenceDetails", controller.getVideoConferenceDetails);
  app.get("/api/doctor/fetchDoctorDetails", [createAccountLimiter], controller.fetchDoctorDetails);
};
