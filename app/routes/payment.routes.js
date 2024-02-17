const controller = require("../controllers/payments.controllers");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/payment/checkout", controller.checkout);
  app.post("/api/payment/fetchPaymentHistory", controller.paymentHistory);
};
