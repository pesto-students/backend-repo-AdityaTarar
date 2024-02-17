const db = require("../models");
const Razorpay = require('razorpay')
const Patient = db.patinet
const Doctor = db.doctor
const Payment = db.payments
const crypto = require('crypto')
exports.checkout = async (req, res) => {
  const instance = new Razorpay({
    key_id: 'rzp_test_5Jwy12U4I4bVdD',
    key_secret: '0yBvx3BPsmqXm9oQtQ5869Wb',
  });
  const { amount } = req.body
  console.log(amount);
  try {
    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `rcpt_${new Date().getTime()}`
    };
    instance.orders.create(options, function (err, order) {
      console.log('order', order);
      res.send(order)
    });
  } catch (error) {
    console.log(error);

  }
}
exports.paymentHistory = async (req, res) => {
  const { userType, id } = req.body
  try {
    if (userType === 'patient') {
      const payments = await Payment.find({ patientId: id })
      if (!payments) {
        res.status(200).json({ message: 'No Payments found' })
      }
      res.status(200).json(payments)
    }
    else {
      const payments = await Payment.find({ doctorId: id })
      if (!payments) {
        res.status(200).json({ message: 'No Payments found' })
      }
      res.status(200).json(payments)
    }
  } catch (error) {
    res.status(500).send({ message: err.message });
    console.log(error)
  }
}
