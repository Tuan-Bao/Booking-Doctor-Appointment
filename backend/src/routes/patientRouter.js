import express from "express";
import * as patientController from "../controllers/patientController.js";
import multer from "multer";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const patientRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: API dành cho Patient
 */

/**
 * @swagger
 * /api/patient/register:
 *   post:
 *     summary: Register a new patient account
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the patient (required)
 *               email:
 *                 type: string
 *                 description: The email address of the patient (required)
 *               password:
 *                 type: string
 *                 description: The password for the account (required)
 *     responses:
 *       201:
 *         description: Successfully registered patient account
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Missing required fields or invalid data
 *         content:
 *           application/json:
 *             example:
 *               message: Missing required fields
 *       409:
 *         description: Conflict - Email already registered
 *         content:
 *           application/json:
 *             example:
 *               message: Email already registered
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.post("/register", patientController.registerPatient);

/**
 * @swagger
 * /api/patient/verify:
 *   get:
 *     summary: Verify patient account using OTP
 *     tags: [Patient]
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         description: The email address of the patient for verification
 *         schema:
 *           type: string
 *       - name: otp_code
 *         in: query
 *         required: true
 *         description: The OTP code received by the patient to verify the email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully verified the patient account
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Missing OTP or invalid OTP
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid OTP code or missing OTP
 *       404:
 *         description: Not found - Patient or OTP code not found
 *         content:
 *           application/json:
 *             example:
 *               message: Patient not found or OTP expired
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.get("/verify", patientController.verifyEmail);

/**
 * @swagger
 * /api/patient/login:
 *   post:
 *     summary: Login patient account using email and password
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the patient
 *                 example: "tuanbaoho2k3@gmail.com"
 *               password:
 *                 type: string
 *                 description: The password of the patient
 *                 example: "@Tuanbao003!"
 *     responses:
 *       200:
 *         description: Successfully logged in patient
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               role: patient
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request - Invalid email or password
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid email or password
 *       404:
 *         description: Not found - Patient not found
 *         content:
 *           application/json:
 *             example:
 *               message: Patient not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.post("/login", patientController.loginPatient);

/**
 * @swagger
 * /api/patient/change_password:
 *   post:
 *     summary: Change the patient's password (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *                 description: The current password of the patient
 *                 example: "@Tuanbao003"
 *               new_password:
 *                 type: string
 *                 description: The new password for the patient account
 *                 example: "@NewPassword123"
 *     responses:
 *       200:
 *         description: Successfully changed the patient's password
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Incorrect current password or invalid new password format
 *         content:
 *           application/json:
 *             example:
 *               message: Incorrect password or invalid new password format
 *       404:
 *         description: Not found - Patient not found
 *         content:
 *           application/json:
 *             example:
 *               message: Patient not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.post(
  "/change_password",
  authentication,
  authorized(["patient"]),
  patientController.changePassword
);

/**
 * @swagger
 * /api/patient/all:
 *   get:
 *     summary: Get the list of all patients (Admin only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully get all patients
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               patients:
 *                 - patient_id: 1
 *                   user_id: 1
 *                   date_of_birth: "2003-11-01T00:00:00.000Z"
 *                   gender: "male"
 *                   address: "Da Nang, Vietnam"
 *                   phone_number: "0765362207"
 *                   insurance_number: "BHYT-0011223344"
 *                   id_number: "0123456789"
 *                   is_verified: true
 *                   otp_code: null
 *                   otp_expiry: null
 *                   createdAt: "2025-04-08T12:32:02.000Z"
 *                   updatedAt: "2025-04-10T11:14:55.000Z"
 *                   user:
 *                     user_id: 1
 *                     username: "Tuan Bao"
 *                     email: "tuanbaoho2k3@gmail.com"
 *                     avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744116980/avatars/kzklq4ysogiuu5nmfgan.jpg"
 *                     role: "patient"
 *                     createdAt: "2025-04-08T12:32:02.000Z"
 *                     updatedAt: "2025-04-10T11:14:36.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
patientRouter.get(
  "/all",
  authentication,
  authorized(["admin"]),
  patientController.getAllPatients
);

/**
 * @swagger
 * /api/patient/profile:
 *   get:
 *     summary: Get patient profile details (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully get the patient profile
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 1
 *                 username: "Tuan Bao"
 *                 email: "tuanbaoho2k3@gmail.com"
 *                 avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744116980/avatars/kzklq4ysogiuu5nmfgan.jpg"
 *                 role: "patient"
 *                 createdAt: "2025-04-08T12:32:02.000Z"
 *                 updatedAt: "2025-04-10T11:14:36.000Z"
 *                 patient:
 *                   patient_id: 1
 *                   user_id: 1
 *                   date_of_birth: "2003-11-01T00:00:00.000Z"
 *                   gender: "male"
 *                   address: "Da Nang, Vietnam"
 *                   phone_number: "0765362207"
 *                   insurance_number: "BHYT-0011223344"
 *                   id_number: "0123456789"
 *                   is_verified: true
 *                   otp_code: null
 *                   otp_expiry: null
 *                   createdAt: "2025-04-08T12:32:02.000Z"
 *                   updatedAt: "2025-04-10T11:14:55.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
patientRouter.get(
  "/profile",
  authentication,
  authorized(["patient"]),
  patientController.getPatientProfile
);

/**
 * @swagger
 * /api/patient/update:
 *   patch:
 *     summary: Update patient profile information (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the patient (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the patient (optional)
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image of the patient (optional)
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the patient (optional)
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: The gender of the patient (optional)
 *               address:
 *                 type: string
 *                 description: The address of the patient (optional)
 *               phone_number:
 *                 type: string
 *                 description: The phone number of the patient (optional)
 *               insurance_number:
 *                 type: string
 *                 description: The insurance number of the patient (optional)
 *               id_number:
 *                 type: string
 *                 description: The ID number of the patient (optional)
 *     responses:
 *       200:
 *         description: Successfully updated patient profile
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request, missing required fields or invalid data
 *         content:
 *           application/json:
 *             example:
 *               message: Bad request, missing required fields or invalid data
 *       401:
 *         description: Unauthorized, authentication failed or token expired
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized access
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.patch(
  "/update",
  authentication,
  authorized(["patient"]),
  upload.single("avatar"),
  patientController.updatePatientProfile
);

/**
 * @swagger
 * /api/patient/appointments:
 *   get:
 *     summary: Get all appointments of logged-in patient (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments for the patient
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 1
 *                 username: "Tuan Bao"
 *                 email: "tuanbaoho2k3@gmail.com"
 *                 avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744116980/avatars/kzklq4ysogiuu5nmfgan.jpg"
 *                 role: "patient"
 *                 patient:
 *                   patient_id: 1
 *                   user_id: 1
 *                   date_of_birth: "2003-11-01T00:00:00.000Z"
 *                   gender: "male"
 *                   address: "Da Nang, Vietnam"
 *                   phone_number: "0765362207"
 *                   insurance_number: "BHYT-0011223344"
 *                   id_number: "0123456789"
 *               appointments:
 *                 - appointment_id: 6
 *                   patient_id: 1
 *                   doctor_id: 2
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: "cancelled"
 *                   fees: 250000
 *                   createdAt: "2025-04-09T23:51:01.000Z"
 *                   updatedAt: "2025-04-10T10:54:23.000Z"
 *                   doctor:
 *                     doctor_id: 2
 *                     degree: "Thạc sĩ"
 *                     experience_years: 10
 *                     description: "Bác sĩ chuyên khoa tim mạch giỏi."
 *                     user:
 *                       user_id: 3
 *                       username: Doan Bao Tram
 *                       email: "doanbaotram@gmail"
 *                       avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129800/avatars/1.webp"
 *                       role: "doctor"
 *                     specialization:
 *                       specialization_id: 1
 *                       name: "Tim mạch"
 *                       image: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129800/specializations/qc6orjcgwglnwfpqsuml.webp"
 *                       fees: 250000
 *                 - appointment_id: 5
 *                   patient_id: 1
 *                   doctor_id: 1
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: "cancelled"
 *                   fees: 250000
 *                   createdAt: "2025-04-09T22:39:35.000Z"
 *                   updatedAt: "2025-04-10T10:54:06.000Z"
 *                   doctor:
 *                     doctor_id: 1
 *                     user_id: 4
 *                     degree: "Bác sĩ chuyên khoa I"
 *                     experience_years: 8
 *                     description: "Bác sĩ da liễu có nhiều kinh nghiệm."
 *                     user:
 *                       user_id: 4
 *                       username: Doan Bao Bao
 *                       email: "doanbaobao@gmail"
 *                       avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129800/avatars/1.webp"
 *                       role: "doctor"
 *                     specialization:
 *                       specialization_id: 2
 *                       name: "Da liễu"
 *                       image: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129654/specializations/dgwt8srho3dt0y8shwzp.webp"
 *                       fees: 250000
 *       400:
 *         description: Invalid user_id or bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid user_id"
 *       401:
 *         description: Unauthorized, authentication failed or token expired
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
patientRouter.get(
  "/appointments",
  authentication,
  authorized(["patient"]),
  patientController.getPatientAppointments
);

/**
 * @swagger
 * /api/patient/payments:
 *   get:
 *     summary: Get payments of logged-in patient (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments of logged-in patient
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 1
 *                 username: Tuan Bao
 *                 email: "tuanbaoho2k3@gmail.com"
 *                 avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129800/avatars/1.webp"
 *                 role: "patient"
 *                 patient:
 *                   patient_id: 1
 *                   user_id: 1
 *                   date_of_birth: "2003-11-01T00:00:00.000Z"
 *                   gender: "male"
 *                   address: "Da Nang, Vietnam"
 *                   phone_number: "0765362207"
 *                   insurance_number: "BHYT-0011223344"
 *                   id_number: "0123456789"
 *                   is_verified: true
 *                   otp_code: null
 *                   otp_expiry: null
 *               appointments:
 *                 - appointment_id: 1
 *                   patient_id: 1
 *                   doctor_id: 1
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: completed
 *                   fees: 250000
 *                   doctor:
 *                     doctor_id: 1
 *                     user_id: 3
 *                     specialization_id: 2
 *                     degree: "Bác sĩ chuyên khoa I"
 *                     experience_years: 8
 *                     description: "Bác sĩ da liễu có nhiều kinh nghiệm."
 *                     user:
 *                       user_id: 3
 *                       username: Doan Bao Tram
 *                       email: "doanbaotram@gmail"
 *                       avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129800/avatars/1.webp"
 *                       role: "doctor"
 *                     specialization:
 *                       specialization_id: 2
 *                       name: "Da liễu"
 *                       image: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129654/specializations/dgwt8srho3dt0y8shwzp.webp"
 *                       fees: 250000
 *                   payment:
 *                     payment_id: 1
 *                     appointment_id: 1
 *                     amount: 250000
 *                     payment_method: null
 *                     status: pending
 *       400:
 *         description: Invalid user_id or bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid user_id"
 *       401:
 *         description: Unauthorized, authentication failed or token expired
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
patientRouter.get(
  "/payments",
  authentication,
  authorized(["patient"]),
  patientController.getPatientPayments
);

/**
 * @swagger
 * /api/patient/doctor_profile/{user_id}:
 *   get:
 *     summary: Get doctor profile by patient (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         description: The user ID of the patient
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success get dcotor profile
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 3
 *                 username: "Doan Bao Tran"
 *                 email: "bao.tran@gmail.com"
 *                 avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744170751/avatars/vrfqeegmxpa9ykc3aoqy.png"
 *                 role: "doctor"
 *                 createdAt: "2025-04-08T23:48:34.000Z"
 *                 updatedAt: "2025-04-09T03:52:32.000Z"
 *                 doctor:
 *                   doctor_id: 1
 *                   user_id: 3
 *                   specialization_id: 2
 *                   degree: "Bác sĩ chuyên khoa I"
 *                   experience_years: 8
 *                   description: "Bác sĩ da liễu có nhiều kinh nghiệm."
 *                   rating: 4
 *                   specialization:
 *                     specialization_id: 2
 *                     name: "Da liễu"
 *                     image: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744129654/specializations/dgwt8srho3dt0y8shwzp.webp"
 *                     fees: 250000
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
 *       400:
 *         description: Invalid user_id or bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid user_id
 *       401:
 *         description: Unauthorized, authentication failed or token expired
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized access
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.get(
  "/doctor_profile/:user_id",
  authentication,
  authorized(["patient"]),
  patientController.getDoctorProfileByPatient
);

/**
 * @swagger
 * /api/patient/doctor_appointments/{user_id}:
 *   get:
 *     summary: Get doctor appointments by patient (Patient only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         description: The user ID of the patient
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *               user:
 *                 user_id: 3
 *                 username: "Doan Bao Tran"
 *                 email: "bao.tran@gmail.com"
 *                 avatar: "https://res.cloudinary.com/dku5kljxv/image/upload/v1744170751/avatars/vrfqeegmxpa9ykc3aoqy.png"
 *                 role: "doctor"
 *                 createdAt: "2025-04-08T23:48:34.000Z"
 *                 updatedAt: "2025-04-09T03:52:32.000Z"
 *                 doctor:
 *                   doctor_id: 1
 *                   user_id: 3
 *                   specialization_id: 2
 *                   degree: "Bác sĩ chuyên khoa I"
 *                   experience_years: 8
 *                   description: "Bác sĩ da liễu có nhiều kinh nghiệm."
 *                   rating: 4
 *                   createdAt: "2025-04-08T23:48:34.000Z"
 *                   updatedAt: "2025-04-10T13:16:56.000Z"
 *               appointments:
 *                 - appointment_id: 2
 *                   patient_id: 1
 *                   doctor_id: 1
 *                   appointment_datetime: "09:00:00 12/4/2025"
 *                   status: "completed"
 *                   fees: 250000
 *                   createdAt: "2025-04-09T14:41:37.000Z"
 *                   updatedAt: "2025-04-10T06:44:05.000Z"
 *       400:
 *         description: Invalid user_id or bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid user_id
 *       401:
 *         description: Unauthorized, authentication failed or token expired
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized access
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
patientRouter.get(
  "/doctor_appointments/:user_id",
  authentication,
  authorized(["patient"]),
  patientController.getDoctorAppointmentsByPatient
);

patientRouter.get(
  "/payments/:payment_id",
  authentication,
  authorized(["patient"]),
  patientController.getPaymentById
);

export default patientRouter;
