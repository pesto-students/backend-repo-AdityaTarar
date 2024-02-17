const controller = require('../../controllers/doctor/appointment.controllers')
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/doctor/getMyUpcommingAppointments", controller.getMyUpcommingAppointments);
  app.post("/api/doctor/addMedication", controller.addMedication);
  app.post("/api/doctor/getAppointmentByDoctors", controller.getAppointmentByDoctors);
  app.post("/api/doctor/completeAppointment", controller.completeAppointment);
};