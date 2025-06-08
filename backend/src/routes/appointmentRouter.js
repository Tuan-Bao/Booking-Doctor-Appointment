import express from "express";
import * as appointmentController from "../controllers/appointmentController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";
import validateDate from "../middlewares/validateDate.js";

const appointmentRouter = express.Router();

appointmentRouter.post(
  "/book_online",
  authentication,
  authorized(["patient"]),
  validateDate,
  appointmentController.bookAppointmentOnline
);

// appointmentRouter.post(
//   "/accept_appointment/:appointment_id",
//   authentication,
//   authorized(["doctor"]),
//   appointmentController.acceptAppointment
// );

appointmentRouter.post(
  "/cancel_appointment_patient/:appointment_id",
  authentication,
  authorized(["patient"]),
  appointmentController.cancelAppointmentByPatient
);

// appointmentRouter.post(
//   "/cancel_appointment_doctor/:appointment_id",
//   authentication,
//   authorized(["doctor"]),
//   appointmentController.cancelAppointmentByDoctor
// );

appointmentRouter.post(
  "/completed/:appointment_id",
  authentication,
  authorized(["doctor"]),
  appointmentController.completeAppointment
);

appointmentRouter.post(
  "/no_show/:appointment_id",
  authentication,
  authorized(["doctor"]),
  appointmentController.markPatientNotComing
);

appointmentRouter.get(
  "/all",
  authentication,
  authorized(["admin"]),
  appointmentController.getAllAppointments
);

appointmentRouter.get(
  "/paid",
  authentication,
  authorized(["admin"]),
  appointmentController.getPaidAppointments
);

appointmentRouter.get(
  "/details/:appointment_id",
  authentication,
  authorized(["patient", "doctor", "admin"]),
  appointmentController.getAppointmentsDetails
);

appointmentRouter.get(
  "/",
  authentication,
  authorized(["admin"]),
  appointmentController.getAppointments
);

appointmentRouter.get(
  "/stats",
  authentication,
  authorized(["admin"]),
  appointmentController.getAppointmentsStats
);

appointmentRouter.post(
  "/book_offline",
  authentication,
  authorized(["admin"]),
  appointmentController.bookAppointmentOffline
);

export default appointmentRouter;
