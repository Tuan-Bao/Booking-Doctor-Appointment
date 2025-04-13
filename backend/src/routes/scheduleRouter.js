import express from "express";
import * as scheduleController from "../controllers/scheduleController.js";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const scheduleRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedule
 *   description: API dành cho Schedule
 */

/**
 * @swagger
 * /api/schedule/update:
 *   patch:
 *     summary: Update doctor schedule (Doctor only)
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               off_date:
 *                 type: string
 *                 format: date
 *                 description: The date the doctor wants to take off
 *             required:
 *               - off_date
 *             example:
 *               off_date: "2023-08-15"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad Request - Missing or invalid off_date
 *         content:
 *           application/json:
 *             example:
 *               message: At least off_date must be provided.
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
scheduleRouter.patch(
  "/update",
  authentication,
  authorized(["doctor"]),
  scheduleController.updateDoctorSchedule
);

export default scheduleRouter;
