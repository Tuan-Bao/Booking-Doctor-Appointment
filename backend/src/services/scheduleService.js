import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";
import { Op } from "sequelize";

const db = await initDB();
const Schedule = db.Schedule;
const User = db.User;
const Doctor = db.Doctor;
const Appointment = db.Appointment;

export const updateDoctorSchedule = async (user_id, off_date) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Doctor, as: "doctor" }],
      transaction,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { doctor } = user;
    if (!doctor) {
      throw new NotFoundError("Patient not found");
    }
    const doctor_id = doctor.doctor_id;

    const now = new Date();
    const offDate = new Date(off_date);
    const oneDateBeforeOffDate = new Date(
      offDate.getTime() - 24 * 60 * 60 * 1000
    );

    const nowTimestamp = now.getTime();
    const oneDateBeforeOffDateTimestamp = oneDateBeforeOffDate.getTime();

    if (oneDateBeforeOffDateTimestamp < nowTimestamp) {
      throw new BadRequestError(
        "You can only update schedule at least 1 day in advance."
      );
    }

    const appointments = await Appointment.findAll({
      where: {
        doctor_id,
        appointment_datetime: {
          [Op.gte]: new Date(new Date(off_date).setHours(0, 0, 0, 0)),
          [Op.lt]: new Date(new Date(off_date).setHours(23, 59, 59, 999)),
        },
      },
      transaction,
    });

    const hasAccepted = appointments.some((a) => a.status === "accepted");

    if (hasAccepted) {
      throw new BadRequestError(
        "You can not update schedule when you have accepted appointment."
      );
    }

    const appointmentsToCancel = appointments.filter((a) =>
      ["waiting_for_confirmation"].includes(a.status)
    );

    for (const appointment of appointmentsToCancel) {
      appointment.status = "cancelled";
      await appointment.save({ transaction });
    }

    const weekdayMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayIndex = offDate.getDay(); // trả về 0–6
    const weekdayStr = weekdayMap[dayIndex];

    const schedule = await Schedule.findOne({
      where: { doctor_id },
      transaction,
    });

    if (!(weekdayStr in schedule)) {
      throw new BadRequestError(`Invalid weekday: ${weekdayStr}`);
    }

    schedule[weekdayStr] = false;
    await schedule.save({ transaction });

    await transaction.commit();
    return {
      message: "Success",
    };
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};
