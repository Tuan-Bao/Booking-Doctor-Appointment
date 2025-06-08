import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";

const db = await initDB();
const Payment = db.Payment;
const Appointment = db.Appointment;

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
