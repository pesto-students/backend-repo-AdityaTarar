const rateLimit = require('express-rate-limit');
const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many accounts created from this IP, please try again after an hour",
});

module.exports = createAccountLimiter;