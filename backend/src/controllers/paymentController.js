import * as paymentService from "../services/paymentService.js";
import momoService from "../services/momoService.js";
import BadRequestError from "../errors/bad_request.js";
import { StatusCodes } from "http-status-codes";
// import momoService from "../services/momoService.js";

export const paymentForAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const result = await paymentService.paymentForAppointment(appointment_id);
    res.status(StatusCodes.OK).json({
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const createMomoPayment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const result = await paymentService.createMomoPayment(appointment_id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const handlePaymentResult = async (req, res, next) => {
  try {
    // console.log("Payment result received:", req.query);
    const result = await momoService.handlePaymentResult(req.query);
    if (result.success) {
      res.redirect(`http://localhost:5173/payment`);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result);
    }
  } catch (error) {
    next(error);
  }
};
