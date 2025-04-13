import express from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const feedbackRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: API dành cho Feedback
 */

/**
 * @swagger
 * /api/feedback/add:
 *   post:
 *     summary: Add feedback for a completed appointment (Patient only)
 *     tags: [Feedback]
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
 *               rating:
 *                 type: integer
 *                 description: The rating for the doctor, between 1 and 5 (required)
 *               comment:
 *                 type: string
 *                 description: The comment from the patient (optional)
 *     responses:
 *       201:
 *         description: Successfully added feedback
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Missing required fields
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
feedbackRouter.post(
  "/add",
  authentication,
  authorized(["patient"]),
  feedbackController.addFeedback
);

/**
 * @swagger
 * /api/feedback/update/{feedback_id}:
 *   patch:
 *     summary: Update feedback for an appointment (Doctor only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: feedback_id
 *         in: path
 *         required: true
 *         description: The ID of the feedback to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: The new rating for the doctor (optional)
 *               comment:
 *                 type: string
 *                 description: The new comment from the patient (optional)
 *     responses:
 *       200:
 *         description: Successfully updated feedback
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
 *         description: Feedback not found
 *         content:
 *           application/json:
 *             example:
 *               message: Feedback not found
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 */
feedbackRouter.patch(
  "/update/:feedback_id",
  authentication,
  authorized(["patient"]),
  feedbackController.updateFeedback
);

export default feedbackRouter;
