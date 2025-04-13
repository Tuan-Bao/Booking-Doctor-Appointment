import express from "express";
import * as appointmentController from "../controllers/appoinmentController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const appointmentRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: API dành cho Appointment
 */

/**
 * @swagger
 * /api/appointment/book:
 *   post:
 *     summary: Book a new appointment (Patient only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - appointment_datetime
 *             properties:
 *               doctor_id:
 *                 type: integer
 *                 example: 2
 *               appointment_datetime:
 *                 type: string
 *                 example: "2025-04-20T10:00:00"
 *                 description: Timezone UTC +07:00 (Appointments must be booked at least 2 hours in advance.)
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Invalid time or appointment conflict
 */
appointmentRouter.post(
  "/book",
  authentication,
  authorized(["patient"]),
  appointmentController.bookAppointment
);

/**
 * @swagger
 * /api/appointment/accept_appointment/{appointment_id}:
 *   post:
 *     summary: Accept an appointment (Doctor only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment accepted
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Appointment not valid or too close to current time
 */
appointmentRouter.post(
  "/accept_appointment/:appointment_id",
  authentication,
  authorized(["doctor"]),
  appointmentController.acceptAppointment
);

/**
 * @swagger
 * /api/appointment/cancel_appointment_patient/{appointment_id}:
 *   post:
 *     summary: Cancel an appointment by patient (Patient only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Cannot cancel because the time has passed or already accepted
 */
appointmentRouter.post(
  "/cancel_appointment_patient/:appointment_id",
  authentication,
  authorized(["patient"]),
  appointmentController.cancelAppointmentByPatient
);

/**
 * @swagger
 * /api/appointment/cancel_appointment_doctor/{appointment_id}:
 *   post:
 *     summary: Cancel an appointment by doctor (Doctor only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Cannot cancel (already accepted and less than 1 day before)
 */
appointmentRouter.post(
  "/cancel_appointment_doctor/:appointment_id",
  authentication,
  authorized(["doctor"]),
  appointmentController.cancelAppointmentByDoctor
);

/**
 * @swagger
 * /api/appointment/complete_appointment/{appointment_id}:
 *   post:
 *     summary: Mark appointment as completed (Doctor only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment completed and payment created
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Cannot complete (status invalid or time not passed yet)
 */
appointmentRouter.post(
  "/complete_appointment/:appointment_id",
  authentication,
  authorized(["doctor"]),
  appointmentController.completeAppointment
);

/**
 * @swagger
 * /api/appointment/mark_patient_not_coming/{appointment_id}:
 *   post:
 *     summary: Mark the patient as not coming (Doctor only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment updated to 'patient_not_coming'
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Cannot mark (status invalid or appointment not found)
 */
appointmentRouter.post(
  "/mark_patient_not_coming/:appointment_id",
  authentication,
  authorized(["doctor"]),
  appointmentController.markPatientNotComing
);

/**
 * @swagger
 * /api/appointment/all:
 *   get:
 *     summary: Get all appointments in the system (Admin only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all appointments with patient and doctor details
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               appointments:
 *                 - appointment_id: 6
 *                   patient_id: 1
 *                   doctor_id: 2
 *                   appointment_datetime: "16:30:00 17/4/2025"
 *                   status: cancelled
 *                   fees: 250000
 *                   createdAt: "2025-04-09T23:51:01.000Z"
 *                   updatedAt: "2025-04-10T10:54:23.000Z"
 *                   patient:
 *                     patient_id: 1
 *                     gender: male
 *                     address: Da Nang, Vietnam
 *                     phone_number: "0765362207"
 *                     user:
 *                       user_id: 1
 *                       username: Tuan Bao
 *                       email: tuanbaoho2k3@gmail.com
 *                       avatar: https://res.cloudinary.com/...
 *                   doctor:
 *                     doctor_id: 2
 *                     degree: Thạc sĩ
 *                     experience_years: 10
 *                     rating: 3.5
 *                     user:
 *                       username: Chi Pham
 *                       email: chi.pham@gmail.com
 *                     specialization:
 *                       name: Tim mạch
 *                       fees: 250000
 *                       image: https://res.cloudinary.com/...
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not admin)
 */
appointmentRouter.get(
  "/all",
  authentication,
  authorized(["admin"]),
  appointmentController.getAllAppointments
);

/**
 * @swagger
 * /api/appointment/paid:
 *   get:
 *     summary: Get all completed appointments that have been paid (Admin only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all paid and completed appointments
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               appointments:
 *                 - appointment_id: 2
 *                   status: completed
 *                   fees: 250000
 *                   createdAt: "2025-04-09T14:41:37.000Z"
 *                   updatedAt: "2025-04-10T06:44:05.000Z"
 *                   patient:
 *                     patient_id: 1
 *                     gender: male
 *                     user:
 *                       username: Tuan Bao
 *                       email: tuanbaoho2k3@gmail.com
 *                   doctor:
 *                     doctor_id: 1
 *                     rating: 4
 *                     user:
 *                       username: Doan Bao Tran
 *                       email: bao.tran@gmail.com
 *                     specialization:
 *                       name: Da liễu
 *                       fees: 250000
 *                   payment:
 *                     payment_id: 5
 *                     appointment_id: 2
 *                     amount: 250000
 *                     payment_method: e-wallet
 *                     status: paid
 *                     createdAt: "2025-04-10T06:45:12.000Z"
 *                     updatedAt: "2025-04-10T06:50:10.000Z"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
appointmentRouter.get(
  "/paid",
  authentication,
  authorized(["admin"]),
  appointmentController.getPaidAppointments
);

/**
 * @swagger
 * /api/appointment/details/{appointment_id}:
 *   get:
 *     summary: Get detailed information about a specific appointment (Patient, Doctor, Admin)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the appointment to retrieve
 *     responses:
 *       200:
 *         description: Detailed appointment information retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               appointmentDetails:
 *                 appointment_id: 2
 *                 appointment_datetime: "09:00:00 12/4/2025"
 *                 status: completed
 *                 fees: 250000
 *                 patient:
 *                   patient_id: 1
 *                   user_id: 1
 *                   date_of_birth: "2000-01-01"
 *                   gender: male
 *                   address: Da Nang, Vietnam
 *                   phone_number: "0765362207"
 *                   insurance_number: 123456789
 *                   id_number: 123456789
 *                   user:
 *                     username: Tuan Bao
 *                     email: tuanbaoho2k3@gmail.com
 *                 doctor:
 *                   doctor_id: 1
 *                   degree: Bác sĩ chuyên khoa I
 *                   experience_years: 8
 *                   rating: 4
 *                   user:
 *                     username: Doan Bao Tran
 *                     email: bao.tran@gmail.com
 *                   specialization:
 *                     name: Da liễu
 *                     fees: 250000
 *                 feedback:
 *                   rating: 4
 *                   comment: Khám kỹ, nhưng chờ hơi lâu.
 *                 prescription:
 *                   medicine_details: "Omeprazol 25mg - 1 viên trước ăn sáng; Antacid - 1 viên sau ăn"
 *                 medical_record:
 *                   diagnosis: Đau dạ dày
 *                   treatment: Sử dụng thuốc chống acid, ăn uống đúng giờ
 *                 payment:
 *                   amount: 250000
 *                   status: pending
 *       404:
 *         description: Appointment not found
 */
appointmentRouter.get(
  "/details/:appointment_id",
  authentication,
  authorized(["patient", "doctor", "admin"]),
  appointmentController.getAppointmentsDetails
);

export default appointmentRouter;
