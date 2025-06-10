import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const paymentRouter = express.Router();

// Offline payment (admin only)
paymentRouter.post(
  "/offline/:appointment_id",
  authentication,
  authorized(["admin"]),
  paymentController.paymentForAppointment
);

// MoMo payment
paymentRouter.post(
  "/momo/:appointment_id",
  authentication,
  paymentController.createMomoPayment
);

// Handle payment result
paymentRouter.get("/momo/result", paymentController.handlePaymentResult);
export default paymentRouter;
