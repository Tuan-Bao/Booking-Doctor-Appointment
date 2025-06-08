import * as adminService from "../services/adminService.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad_request.js";

export const registerAdmin = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      throw new BadRequestError("Missing required fields");
    }
    const result = await adminService.registerAdmin(username, password, email);
    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Missing required fields");
    }
    const result = await adminService.loginAdmin(email, password);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatientAppointmentsByAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const result = await adminService.getPatientAppointmentsByAdmin(user_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDoctorProfileByAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const result = await adminService.getDoctorProfileByAdmin(user_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointmentsByAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const result = await adminService.getDoctorAppointmentsByAdmin(user_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const createDoctorShift = async (req, res, next) => {
  try {
    const { doctor_id, shift_date, shift_type, start_time, end_time } =
      req.body;
    if (!doctor_id || !shift_date || !shift_type || !start_time || !end_time) {
      throw new BadRequestError("Missing required fields");
    }
    const result = await adminService.createDoctorShift(
      doctor_id,
      shift_date,
      shift_type,
      start_time,
      end_time
    );
    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateDoctorShift = async (req, res, next) => {
  try {
    const { shift_id } = req.params;
    const updateData = req.body;
    const result = await adminService.updateDoctorShift(shift_id, updateData);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorShift = async (req, res, next) => {
  try {
    const { shift_id } = req.params;
    const result = await adminService.deleteDoctorShift(shift_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDoctorShifts = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    const result = await adminService.getDoctorShifts(doctor_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const createOfflinePatient = async (req, res, next) => {
  try {
    const result = await adminService.createOfflinePatient(req.body);
    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const checkInAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const result = await adminService.checkInAppointment(appointment_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const result = await adminService.getAllPatients();
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const result = await adminService.getAllDoctors();
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const addPatientOffline = async (req, res, next) => {
  try {
    const result = await adminService.addPatientOffline(req.body);
    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const searchDoctors = async (req, res, next) => {
  try {
    const { specialization_id, shift_date, shift_type, start_time, end_time } =
      req.body;

    if (
      !specialization_id ||
      !shift_date ||
      !shift_type ||
      !start_time ||
      !end_time
    ) {
      throw new BadRequestError("Missing required fields");
    }

    const result = await adminService.searchDoctors(
      specialization_id,
      shift_date,
      shift_type,
      start_time,
      end_time
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
