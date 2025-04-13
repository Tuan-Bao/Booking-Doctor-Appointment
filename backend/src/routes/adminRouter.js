import express from "express";
import * as adminController from "../controllers/adminController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API dành cho Admin
 */

adminRouter.post("/register", adminController.registerAdmin);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login as admin (Admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: an.nguyen@gmail.com
 *               password:
 *                 type: string
 *                 example: An123456@
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               role: admin
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6Ik5ndXllbiBWYW4gQW4iLCJpYXQiOjE3NDQ0MjkwNTksImV4cCI6MTc0NDQzNjI1OX0.fk3KKwuEPZk7XsHG_TO-gF37Px-Bpf5DlMxKWxrYtmo
 *       400:
 *         description: Invalid credentials
 */
adminRouter.post("/login", adminController.loginAdmin);

/**
 * @swagger
 * /api/admin/patient_appointments/{user_id}:
 *   get:
 *     summary: Get all appointments of a specific patient (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID of the patient
 *     responses:
 *       200:
 *         description: Successfully retrieved patient appointments with details
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 1
 *                 username: Tuan Bao
 *                 email: tuanbaoho2k3@gmail.com
 *                 avatar: https://res.cloudinary.com/...
 *                 role: patient
 *                 patient:
 *                   patient_id: 1
 *                   date_of_birth: 2003-11-01T00:00:00.000Z
 *                   gender: male
 *                   address: Da Nang, Vietnam
 *                   phone_number: "0765362207"
 *                   insurance_number: BHYT-0011223344
 *                   id_number: "0123456789"
 *               appointments:
 *                 - appointment_id: 1
 *                   appointment_datetime: "09:00:00 7/4/2025"
 *                   status: completed
 *                   fees: 250000
 *                   doctor:
 *                     doctor_id: 2
 *                     degree: Thạc sĩ
 *                     experience_years: 10
 *                     description: Bác sĩ chuyên khoa tim mạch giỏi.
 *                     rating: 3.5
 *                     user:
 *                       user_id: 4
 *                       username: Chi Pham
 *                       email: chi.pham@gmail.com
 *                     specialization:
 *                       specialization_id: 1
 *                       name: Tim mạch
 *                       fees: 250000
 *                       image: https://res.cloudinary.com/...
 *       404:
 *         description: Patient not found
 */
adminRouter.get(
  "/patient_appointments/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.getPatientAppointmentsByAdmin
);

/**
 * @swagger
 * /api/admin/doctor_profile/{user_id}:
 *   get:
 *     summary: Get doctor's full profile (including specialization and schedule) (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID of the doctor
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor profile
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 3
 *                 username: Doan Bao Tran
 *                 email: bao.tran@gmail.com
 *                 avatar: https://res.cloudinary.com/...
 *                 role: doctor
 *                 createdAt: 2025-04-08T23:48:34.000Z
 *                 updatedAt: 2025-04-09T03:52:32.000Z
 *                 doctor:
 *                   doctor_id: 1
 *                   user_id: 3
 *                   specialization_id: 2
 *                   degree: Bác sĩ chuyên khoa I
 *                   experience_years: 8
 *                   description: Bác sĩ da liễu có nhiều kinh nghiệm.
 *                   rating: 4
 *                   createdAt: 2025-04-08T23:48:34.000Z
 *                   updatedAt: 2025-04-10T13:16:56.000Z
 *                   specialization:
 *                     specialization_id: 2
 *                     name: Da liễu
 *                     image: https://res.cloudinary.com/...
 *                     fees: 250000
 *                     createdAt: 2025-04-08T16:27:34.000Z
 *                     updatedAt: 2025-04-08T16:27:34.000Z
 *                   schedule:
 *                     schedule_id: 1
 *                     doctor_id: 1
 *                     monday: true
 *                     tuesday: true
 *                     wednesday: true
 *                     thursday: true
 *                     friday: true
 *                     saturday: true
 *                     sunday: false
 *                     createdAt: 2025-04-08T23:48:34.000Z
 *                     updatedAt: 2025-04-11T18:26:33.000Z
 *       404:
 *         description: Doctor not found
 */
adminRouter.get(
  "/doctor_profile/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.getDoctorProfileByAdmin
);

/**
 * @swagger
 * /api/admin/doctor_appointments/{user_id}:
 *   get:
 *     summary: Get all appointments of a specific doctor (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID of the doctor
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor's appointments with patient details
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 3
 *                 username: Doan Bao Tran
 *                 email: bao.tran@gmail.com
 *                 avatar: https://res.cloudinary.com/...
 *                 role: doctor
 *                 doctor:
 *                   doctor_id: 1
 *                   specialization_id: 2
 *                   degree: Bác sĩ chuyên khoa I
 *                   experience_years: 8
 *                   description: Bác sĩ da liễu có nhiều kinh nghiệm.
 *                   rating: 4
 *               appointments:
 *                 - appointment_id: 2
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: completed
 *                   fees: 250000
 *                   patient:
 *                     patient_id: 1
 *                     gender: male
 *                     phone_number: "0765362207"
 *                     address: Da Nang, Vietnam
 *                     user:
 *                       user_id: 1
 *                       username: Tuan Bao
 *                       email: tuanbaoho2k3@gmail.com
 *                       avatar: https://res.cloudinary.com/...
 *       404:
 *         description: Doctor not found
 */
adminRouter.get(
  "/doctor_appointments/:user_id",
  authentication,
  authorized(["admin"]),
  adminController.getDoctorAppointmentsByAdmin
);

export default adminRouter;
