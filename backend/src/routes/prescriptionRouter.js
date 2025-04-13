import express from "express";
import * as prescriptionController from "../controllers/prescriptionController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const prescriptionRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prescription
 *   description: API dành cho Prescription
 */

/**
 * @swagger
 * /api/prescription/add:
 *   post:
 *     summary: Add a new prescription to an appointment (Doctor only)
 *     tags: [Prescription]
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
 *                 description: ID of the appointment
 *               medicine_details:
 *                 type: string
 *                 description: Details of the prescribed medicines
 *           example:
 *             appointment_id: 2
 *             medicine_details: "Omeprazol 25mg - 1 viên trước ăn sáng; Antacid - 1 viên sau ăn"
 *     responses:
 *       201:
 *         description: Prescription added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Invalid request or bad data
 *         content:
 *           application/json:
 *             example:
 *               message: Missing required fields
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
prescriptionRouter.post(
  "/add",
  authentication,
  authorized(["doctor"]),
  prescriptionController.addPrescription
);

/**
 * @swagger
 * /api/prescription/update/{prescription_id}:
 *   patch:
 *     summary: Update an existing prescription (Doctor only)
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: prescription_id
 *         in: path
 *         required: true
 *         description: ID of the prescription to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicine_details:
 *                 type: string
 *                 description: Updated details of the prescribed medicines
 *           example:
 *             medicine_details: "Updated medicine - 1 viên trước ăn sáng"
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Invalid data or missing fields
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid request or missing required fields
 *       404:
 *         description: Prescription not found
 *         content:
 *           application/json:
 *             example:
 *               message: Prescription not found
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
prescriptionRouter.patch(
  "/update/:prescription_id",
  authentication,
  authorized(["doctor"]),
  prescriptionController.updatePrescription
);

export default prescriptionRouter;
