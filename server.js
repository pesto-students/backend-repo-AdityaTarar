const express = require('express');
const db = require("./app/models");
const cors = require("cors");
const PORT = 3001;

const app = express();

var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
db.mongoose
  .connect(
    `mongodb+srv://adityatarar8:vo4dmcqmGtBCTMpz@pestohealth.rq6xeh3.mongodb.net/`,
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

require("./app/routes/auth.routes")(app);
require("./app/routes/patient/bookappointment.routes")(app);
require("./app/routes/doctor/availability.routes")(app);
require('./app/routes/doctor/appointments.routes')(app);
require('./app/routes/patient/medication.routes')(app);
require('./app/routes/patient/vitals.routes')(app);
require('./app/routes/payment.routes')(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


app.get("/", (req, res) => {
  res.json({ message: "Welcome to authentication application." });
});
