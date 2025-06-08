import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/offline/:appointment_id",
  authentication,
  authorized(["admin"]),
  paymentController.paymentForAppointment
);

export default paymentRouter;
