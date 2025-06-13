import express from "express";
import * as adminController from "../controllers/adminController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const adminRouter = express.Router();

adminRouter.post("/register", adminController.registerAdmin);

adminRouter.post("/login", adminController.loginAdmin);

adminRouter.get(
  "/patient_appointments/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.getPatientAppointmentsByAdmin
);

adminRouter.get(
  "/doctor_profile/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.getDoctorProfileByAdmin
);

adminRouter.get(
  "/doctor_appointments/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.getDoctorAppointmentsByAdmin
);

adminRouter.post(
  "/doctor_shift",
  authentication,
  authorized(["admin"]),
  adminController.createDoctorShift
);

adminRouter.patch(
  "/doctor_shift/:shift_id",
  authentication,
  authorized(["admin"]),
  adminController.updateDoctorShift
);

adminRouter.delete(
  "/doctor_shift/:shift_id",
  authentication,
  authorized(["admin"]),
  adminController.deleteDoctorShift
);

adminRouter.get(
  "/doctor_shift/:doctor_id",
  authentication,
  authorized(["admin"]),
  adminController.getDoctorShifts
);

adminRouter.post(
  "/offline_patient",
  authentication,
  authorized(["admin"]),
  adminController.createOfflinePatient
);

adminRouter.post(
  "/check_in_appointment/:appointment_id",
  authentication,
  authorized(["admin"]),
  adminController.checkInAppointment
);

adminRouter.get(
  "/patients",
  authentication,
  authorized(["admin"]),
  adminController.getAllPatients
);

adminRouter.get(
  "/doctors",
  authentication,
  authorized(["admin"]),
  adminController.getAllDoctors
);

adminRouter.post(
  "/add_patient_offline",
  authentication,
  authorized(["admin"]),
  adminController.addPatientOffline
);

adminRouter.post(
  "/search_doctors",
  authentication,
  authorized(["admin"]),
  adminController.searchDoctors
);

adminRouter.patch(
  "/update_patient/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.updatePatientProfile
);

adminRouter.post(
  "/doctor_shifts/bulk",
  authentication,
  authorized(["admin"]),
  adminController.createBulkDoctorShifts
);

adminRouter.get(
  "/doctor_shifts",
  authentication,
  authorized(["admin"]),
  adminController.getAllDoctorShifts
);

export default adminRouter;
