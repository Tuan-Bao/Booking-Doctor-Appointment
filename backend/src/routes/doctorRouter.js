import express from "express";
import * as doctorController from "../controllers/doctorController.js";
import multer from "multer";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const doctorRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: API dành cho Doctor
 */

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /api/doctor/login:
 *   post:
 *     summary: Doctor login (Doctor only)
 *     tags: [Doctor]
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
 *                 example: doctor@gmail.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Doctor login successful
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               role: doctor
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             example:
 *               message: Email and password are required
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid email or password
 */
doctorRouter.post("/login", doctorController.loginDoctor);

/**
 * @swagger
 * /api/doctor/all:
 *   get:
 *     summary: Get information of all doctors (Patient, Admin)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               doctors:
 *                 - doctor_id: 1
 *                   user_id: 3
 *                   specialization_id: 2
 *                   degree: Bác sĩ chuyên khoa I
 *                   experience_years: 8
 *                   description: Bác sĩ da liễu có nhiều kinh nghiệm.
 *                   rating: 4
 *                   createdAt: 2025-04-08T23:48:34.000Z
 *                   updatedAt: 2025-04-10T13:16:56.000Z
 *                   user:
 *                     user_id: 3
 *                     username: Doan Bao Tran
 *                     email: bao.tran@gmail.com
 *                     avatar: https://res.cloudinary.com/...png
 *                     role: doctor
 *                     createdAt: 2025-04-08T23:48:34.000Z
 *                     updatedAt: 2025-04-09T03:52:32.000Z
 *                   specialization:
 *                     specialization_id: 2
 *                     name: Da liễu
 *                     image: https://res.cloudinary.com/...webp
 *                     fees: 250000
 *                     createdAt: 2025-04-08T16:27:34.000Z
 *                     updatedAt: 2025-04-08T16:27:34.000Z
 *
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
doctorRouter.get(
  "/all",
  authentication,
  authorized(["patient", "admin"]),
  doctorController.getAllDoctors
);

/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Get profile of logged-in doctor (Doctor only)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor's profile
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 3
 *                 username: Doan Bao Tran
 *                 email: bao.tran@gmail.com
 *                 avatar: https://res.cloudinary.com/dku5kljxv/image/upload/v1744170751/avatars/vrfqeegmxpa9ykc3aoqy.png
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
 *                     image: https://res.cloudinary.com/.../specializations/...
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
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
doctorRouter.get(
  "/profile",
  authentication,
  authorized(["doctor"]),
  doctorController.getDoctorProfile
);

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     summary: Retrieve list of all appointments of the logged-in doctor (Doctor only)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor's appointments
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 3
 *                 username: Doan Bao Tran
 *                 email: bao.tran@gmail.com
 *                 avatar: https://res.cloudinary.com/.../avatar.png
 *                 role: doctor
 *                 createdAt: "2025-04-08T23:48:34.000Z"
 *                 updatedAt: "2025-04-09T03:52:32.000Z"
 *                 doctor:
 *                   doctor_id: 1
 *                   user_id: 3
 *                   specialization_id: 2
 *                   degree: Bác sĩ chuyên khoa I
 *                   experience_years: 8
 *                   description: Bác sĩ da liễu có nhiều kinh nghiệm.
 *                   rating: 4
 *                   createdAt: "2025-04-08T23:48:34.000Z"
 *                   updatedAt: "2025-04-10T13:16:56.000Z"
 *               appointments:
 *                 - appointment_id: 2
 *                   patient_id: 1
 *                   doctor_id: 1
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: completed
 *                   fees: 250000
 *                   createdAt: "2025-04-09T14:41:37.000Z"
 *                   updatedAt: "2025-04-10T06:44:05.000Z"
 *                   patient:
 *                     patient_id: 1
 *                     user_id: 1
 *                     username: Tuan Bao
 *                     email: tuanbaoho2k3@gmail.com
 *                     gender: male
 *                     phone_number: 0765362207
 *                     address: Da Nang, Vietnam
 *                     insurance_number: BHYT-0011223344
 *                     id_number: 0123456789
 *                     user:
 *                       user_id: 1
 *                       username: Tuan Bao
 *                       email: tuanbaoho2k3@gmail.com
 *                       avatar: https://res.cloudinary.com/.../avatar.jpg
 *                       role: patient
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
doctorRouter.get(
  "/appointments",
  authentication,
  authorized(["doctor"]),
  doctorController.getDoctorAppointments
);

/**
 * @swagger
 * /api/doctor/patient_appointments/{user_id}:
 *   get:
 *     summary: Get all completed appointments of a specific patient (Doctor only)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID of the patient
 *     responses:
 *       200:
 *         description: List of completed appointments for the given patient
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 1
 *                 username: Tuan Bao
 *                 email: tuanbaoho2k3@gmail.com
 *                 avatar: https://res.cloudinary.com/.../avatar.jpg
 *                 role: patient
 *                 patient:
 *                   patient_id: 1
 *                   date_of_birth: "2003-11-01T00:00:00.000Z"
 *                   gender: male
 *                   phone_number: "0765362207"
 *                   address: "Da Nang, Vietnam"
 *                   insurance_number: "BHYT-0011223344"
 *                   id_number: "0123456789"
 *                   is_verified: true
 *               appointments:
 *                 - appointment_id: 2
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: completed
 *                   fees: 250000
 *                   doctor:
 *                     doctor_id: 1
 *                     username: Doan Bao Tran
 *                     email: bao.tran@gmail.com
 *                     user:
 *                       user_id: 3
 *                       username: Doan Bao Tran
 *                       email: bao.tran@gmail.com
 *                       avatar: https://res.cloudinary.com/.../avatar.jpg
 *                       role: doctor
 *                     specialization:
 *                       specialization_id: 2
 *                       name: "Da liễu"
 *                       fees: 250000
 *                       image: https://res.cloudinary.com/.../specialization.jpg
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             example:
 *               message: Patient not found
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
doctorRouter.get(
  "/patient_appointments/:user_id",
  authentication,
  authorized(["doctor"]),
  doctorController.getPatientAppointmentsByDoctor
);

/**
 * @swagger
 * /api/doctor/add:
 *   post:
 *     summary: Add a new doctor to the system (Admin only)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the doctor
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the doctor
 *               password:
 *                 type: string
 *                 description: The password for the doctor's account
 *               specialization_id:
 *                 type: integer
 *                 description: The specialization ID for the doctor
 *               degree:
 *                 type: string
 *                 description: The degree or qualification of the doctor
 *               experience_years:
 *                 type: integer
 *                 description: The number of years of experience the doctor has
 *               description:
 *                 type: string
 *                 description: A brief description about the doctor
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file for the doctor
 *     responses:
 *       201:
 *         description: Successfully added a new doctor
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid data input
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
doctorRouter.post(
  "/add",
  authentication,
  authorized(["admin"]),
  upload.single("avatar"),
  doctorController.addDoctor
);

/**
 * @swagger
 * /api/doctor/update:
 *   patch:
 *     summary: Update the doctor's profile information (Doctor only)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the doctor (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the doctor (optional)
 *               degree:
 *                 type: string
 *                 description: The degree or qualification of the doctor (optional)
 *               experience_years:
 *                 type: integer
 *                 description: The number of years of experience the doctor has (optional)
 *               description:
 *                 type: string
 *                 description: A brief description about the doctor (optional)
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file of the doctor (optional)
 *               specialization_id:
 *                 type: integer
 *                 description: The ID of the specialization the doctor belongs to (optional)
 *     responses:
 *       200:
 *         description: Successfully updated the doctor's profile
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid data input
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             example:
 *               message: Doctor not found
 */
doctorRouter.patch(
  "/update",
  authentication,
  authorized(["doctor"]),
  upload.single("avatar"),
  doctorController.updateDoctorProfile
);

/**
 * @swagger
 * /api/doctor/delete/{user_id}:
 *   delete:
 *     summary: Delete a doctor from the system (Admin only)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID of the doctor to be deleted
 *     responses:
 *       200:
 *         description: Successfully deleted the doctor
 *         content:
 *           application/json:
 *             example:
 *               message: Doctor deleted successfully
 *       400:
 *         description: Bad request - Invalid user ID
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid user ID
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             example:
 *               message: Doctor not found
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
doctorRouter.delete(
  "/delete/:user_id",
  authentication,
  authorized(["admin"]),
  doctorController.deleteDoctor
);

doctorRouter.get(
  "/feedback",
  authentication,
  authorized(["doctor"]),
  doctorController.getDoctorFeedback
);

doctorRouter.get(
  "/appointments/stats",
  authentication,
  authorized(["doctor"]),
  doctorController.getDoctorAppointmentStats
);

export default doctorRouter;
