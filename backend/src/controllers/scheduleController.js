import * as scheduleService from "../services/scheduleService.js";
import BadRequestError from "../errors/bad_request.js";
import { StatusCodes } from "http-status-codes";

export const updateDoctorSchedule = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { off_date } = req.body;

    if (!off_date) {
      throw new BadRequestError("At least off_date must be provided.");
    }

    const result = await scheduleService.updateDoctorSchedule(
      user_id,
      off_date
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
