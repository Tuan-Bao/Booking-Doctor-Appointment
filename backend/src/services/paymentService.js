import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";
import momoService from "./momoService.js";

const db = await initDB();
const Payment = db.Payment;
const Appointment = db.Appointment;
const Doctor = db.Doctor;
const User = db.User;

export const paymentForAppointment = async (appointmentId) => {
  // Find the appointment
  const appointment = await Appointment.findByPk(appointmentId);
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({
    where: { appointment_id: appointmentId },
  });

  // Update appointment status
  //   await existingPayment.update({
  //     method: "cash",
  //     status: "paid",
  //   });

  existingPayment.payment_method = "cash";
  existingPayment.status = "paid";
  await existingPayment.save();

  return {
    message: "Payment confirmed successfully",
  };
};

export const createMomoPayment = async (appointmentId) => {
  // Find the appointment
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [
      {
        model: Doctor,
        as: "doctor",
        include: [{ model: User, as: "user" }],
      },
    ],
  });

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({
    where: { appointment_id: appointmentId },
  });

  if (!existingPayment) {
    throw new NotFoundError("Payment not found for this appointment");
  }

  if (existingPayment.status === "paid") {
    throw new BadRequestError("Payment already completed");
  }

  const orderId = `PAY-${appointmentId}-${Date.now()}`;
  const amount = existingPayment.amount;
  const orderInfo = `Payment for appointment with Dr. ${appointment.doctor.user.username}`;

  const paymentResponse = await momoService.createPayment(
    orderId,
    amount,
    orderInfo
  );

  if (paymentResponse.resultCode === 0) {
    return {
      message: "Payment URL created successfully",
      paymentUrl: paymentResponse.payUrl,
    };
  } else {
    throw new BadRequestError(
      `Failed to create payment: ${paymentResponse.message}`
    );
  }
};

export const handleMomoCallback = async (callbackData) => {
  console.log("Callback data received payment service");
  // Verify signature
  const isValid = momoService.verifyPaymentResponse(callbackData);
  console.log("is valid: ", isValid);
  if (!isValid) {
    throw new BadRequestError("Invalid signature");
  }

  // Extract appointment ID from orderId (format: PAY-{appointment_id}-{timestamp})
  const appointmentId = callbackData.orderId.split("-")[1];
  console.log("appointmentId: ", appointmentId);
  console.log("resultCode: ", callbackData.resultCode);
  if (callbackData.resultCode === 0) {
    // Payment successful
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    const payment = await Payment.findOne({
      where: { appointment_id: appointmentId },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    // Update payment status
    await payment.update({
      status: "paid",
      payment_method: "e-wallet",
    });

    return {
      message: "Payment successful",
    };
  } else {
    throw new BadRequestError(`Payment failed: ${callbackData.message}`);
  }
};
