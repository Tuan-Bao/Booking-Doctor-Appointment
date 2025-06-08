import * as paymentService from "../services/paymentService.js";
import BadRequestError from "../errors/bad_request.js";
import { StatusCodes } from "http-status-codes";

export const paymentForAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const result = await paymentService.paymentForAppointment(appointment_id);

    res.status(200).json({
      result,
    });
  } catch (error) {
    next(error);
  }
};
