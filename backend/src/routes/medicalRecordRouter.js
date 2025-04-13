import express from "express";
import * as medicalRecordController from "../controllers/medicalRecordController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const medicalRecordRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Medical Record
 *   description: API dành cho Medical Record
 */

/**
 * @swagger
 * /api/medical_record/add:
 *   post:
 *     summary: Add medical record for a completed appointment (Doctor only)
 *     tags: [Medical Record]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_id:
 *                 type: integer
 *                 description: The ID of the appointment (required)
 *               diagnosis:
 *                 type: string
 *                 description: The diagnosis for the patient (required)
 *               treatment:
 *                 type: string
 *                 description: The treatment for the patient (required)
 *               notes:
 *                 type: string
 *                 description: Additional notes for the medical record (optional)
 *     responses:
 *       201:
 *         description: Successfully added medical record
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
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             example:
 *               message: Appointment not found
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
medicalRecordRouter.post(
  "/add",
  authentication,
  authorized(["doctor"]),
  medicalRecordController.addMedicalRecord
);

/**
 * @swagger
 * /api/medical_record/update/{record_id}:
 *   patch:
 *     summary: Update medical record for a completed appointment (Doctor only)
 *     tags: [Medical Record]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: record_id
 *         in: path
 *         required: true
 *         description: The ID of the medical record to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnosis:
 *                 type: string
 *                 description: The updated diagnosis for the patient (optional)
 *               treatment:
 *                 type: string
 *                 description: The updated treatment for the patient (optional)
 *               notes:
 *                 type: string
 *                 description: Additional updated notes for the medical record (optional)
 *     responses:
 *       200:
 *         description: Successfully updated medical record
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Invalid or empty fields
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid data input
 *       404:
 *         description: Medical record not found
 *         content:
 *           application/json:
 *             example:
 *               message: Medical record not found
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
medicalRecordRouter.patch(
  "/update/:record_id",
  authentication,
  authorized(["doctor"]),
  medicalRecordController.updateMedicalRecord
);

export default medicalRecordRouter;
