import express from "express";
import * as specializationController from "../controllers/specializationController.js";
import multer from "multer";
import authentication from "../middlewares/authentication.js";
import authorized from "../middlewares/authorization.js";

const specializationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Specialization
 *   description: API dành cho Specialization
 */

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /api/specialization/all:
 *   get:
 *     summary: Get all specializations  (Patient, Admin )
 *     tags: [Specialization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all specializations
 *         content:
 *           application/json:
 *             example:
 *               message: "Success"
 *               specializations:
 *                 - specialization_id: 1
 *                   name: "Tim mạch"
 *                   image: "https://image-url.com/tim-mach.jpg"
 *                   fees: 250000
 *                 - specialization_id: 2
 *                   name: "Da liễu"
 *                   image: "https://image-url.com/da-lieu.jpg"
 *                   fees: 200000
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
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
specializationRouter.get(
  "/all",
  authentication,
  authorized(["patient", "doctor", "admin"]),
  specializationController.getAllSpecializations
);

/**
 * @swagger
 * /api/specialization/create:
 *   post:
 *     summary: Add a new specialization (Admin only)
 *     tags: [Specialization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the specialization (required)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the specialization (optional)
 *               fees:
 *                 type: integer
 *                 description: The fees associated with the specialization (required)
 *             example:
 *               name: "Tim mạch"
 *               fees: 250000
 *     responses:
 *       201:
 *         description: Successfully added specialization
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
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
specializationRouter.post(
  "/create",
  authentication,
  authorized(["admin"]),
  upload.single("image"),
  specializationController.createSpecialization
);

/**
 * @swagger
 * /api/specialization/update/{specialization_id}:
 *   patch:
 *     summary: Update an existing specialization (Admin only)
 *     tags: [Specialization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: specialization_id
 *         in: path
 *         required: true
 *         description: The ID of the specialization to be updated
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the specialization (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The new image file for the specialization (optional)
 *               fees:
 *                 type: integer
 *                 description: The new fees for the specialization (optional)
 *             example:
 *               name: "Tim mạch"
 *               fees: 300000
 *     responses:
 *       200:
 *         description: Successfully updated specialization
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Invalid input or missing required fields
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid or missing fields
 *       404:
 *         description: Specialization not found
 *         content:
 *           application/json:
 *             example:
 *               message: Specialization not found
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
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
specializationRouter.patch(
  "/update/:specialization_id",
  authentication,
  authorized(["admin"]),
  upload.single("image"),
  specializationController.updateSpecialization
);

/**
 * @swagger
 * /api/specialization/delete/{specialization_id}:
 *   delete:
 *     summary: Delete a specialization by ID (Admin only)
 *     tags: [Specialization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: specialization_id
 *         in: path
 *         required: true
 *         description: The ID of the specialization to be deleted
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted specialization
 *         content:
 *           application/json:
 *             example:
 *               message: Success
 *       400:
 *         description: Bad request - Invalid specialization_id or missing parameters
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid specialization_id
 *       404:
 *         description: Specialization not found
 *         content:
 *           application/json:
 *             example:
 *               message: Specialization not found
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
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
specializationRouter.delete(
  "/delete/:specialization_id",
  authentication,
  authorized(["admin"]),
  specializationController.deleteSpecialization
);

specializationRouter.get(
  "/",
  authentication,
  authorized(["admin"]),
  specializationController.getSpecializations
);

export default specializationRouter;
