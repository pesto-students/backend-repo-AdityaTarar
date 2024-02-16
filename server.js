const express = require('express');
const db = require("./app/models");
const cors = require("cors");
const PORT = 3001;
const Sentry = require("@sentry/node");
const app = express();
require('dotenv').config();

var corsOptions = {
  origin: "*",
};
Sentry.init({
  dsn: "https://6d2dac7621e16bd1a10a1eba507e2cae@o4506669534937088.ingest.sentry.io/4506742622519296",
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());

app.use(Sentry.Handlers.tracingHandler());

app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

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
require('./app/routes/otp.routes')(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


app.get("/", (req, res) => {
  res.json({ message: "Welcome to authentication application." });
});
