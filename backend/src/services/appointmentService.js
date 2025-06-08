import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";
import { formatToVNTime } from "../helper/formatToVNTime.js";
import { isSameDay } from "../helper/isSameDay.js";
import { Op, literal } from "sequelize";

const db = await initDB();
const Appointment = db.Appointment;
const User = db.User;
const Doctor = db.Doctor;
const Specialization = db.Specialization;
// const Schedule = db.Schedule;
const Patient = db.Patient;
const Feedback = db.Feedback;
const Prescription = db.Prescription;
const MedicalRecord = db.MedicalRecord;
const Payment = db.Payment;
const DoctorShift = db.DoctorShift;

export const bookAppointmentOnline = async (
  user_id,
  doctor_id,
  appointment_datetime
) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Patient, as: "patient" }],
      transaction,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { patient } = user;
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const doctor = await Doctor.findByPk(doctor_id, {
      include: [
        {
          model: Specialization,
          as: "specialization",
        },
      ],
      transaction,
    });

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    let compareTime = new Date(appointment_datetime);
    let now = new Date();
    let minimumAllowedTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const minimumTimestamp = minimumAllowedTime.getTime();
    const compareTimestamp = compareTime.getTime();

    if (compareTimestamp <= minimumTimestamp) {
      throw new BadRequestError(
        "Appointments must be booked at least 24 hours in advance."
      );
    }

    // Kiểm tra ca làm việc (DoctorShift) của bác sĩ có phù hợp không
    const shiftDate = appointment_datetime.slice(0, 10); // YYYY-MM-DD
    const shiftTime = appointment_datetime.slice(11, 19); // HH:mm:ss

    const shift = await DoctorShift.findOne({
      where: {
        doctor_id,
        shift_date: shiftDate,
        start_time: { [db.Sequelize.Op.lte]: shiftTime },
        end_time: { [db.Sequelize.Op.gt]: shiftTime },
      },
      transaction,
    });
    if (!shift) {
      throw new BadRequestError("Doctor is not available at this time");
    }

    const appointmentTime = new Date(appointment_datetime);
    const doctorConflict = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_datetime: appointmentTime,
        status: {
          [Op.in]: ["scheduled", "completed", "no_show"],
        },
      },
      transaction,
    });

    if (doctorConflict) {
      throw new BadRequestError(
        "Doctor already has an appointment at this time"
      );
    }

    const patientConflict = await Appointment.findOne({
      where: {
        patient_id: patient.patient_id,
        appointment_datetime: appointmentTime,
        status: {
          [Op.in]: ["scheduled", "completed", "no_show"],
        },
      },
      transaction,
    });

    if (patientConflict) {
      throw new BadRequestError("You already have an appointment at this time");
    }

    await Appointment.create(
      {
        patient_id: patient.patient_id,
        doctor_id,
        appointment_datetime,
        fees: doctor.specialization.fees,
        booking_source: "online",
      },
      { transaction }
    );

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const bookAppointmentOffline = async (
  patient_id,
  doctor_id,
  reason = null
) => {
  const transaction = await db.sequelize.transaction();
  try {
    // định dạng thời gian hiện tại theo định dạng yyyy-mm-dd hh:mm:ss
    const appointment_datetime = new Date().toISOString().slice(0, 19);
    const patient = await Patient.findByPk(patient_id, { transaction });
    if (!patient) throw new NotFoundError("Patient not found");
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{ model: Specialization, as: "specialization" }],
      transaction,
    });
    if (!doctor) throw new NotFoundError("Doctor not found");
    // let compareTime = new Date(appointment_datetime);
    // let now = new Date();
    // let minimumAllowedTime = new Date(now.getTime() + 60 * 60 * 1000); // Cho phép đặt offline sát giờ hơn
    // const minimumTimestamp = minimumAllowedTime.getTime();
    // const compareTimestamp = compareTime.getTime();
    // if (compareTimestamp <= minimumTimestamp) {
    //   throw new BadRequestError(
    //     "Appointments must be booked at least 1 hour in advance."
    //   );
    // }
    // Kiểm tra ca làm việc (DoctorShift)
    const shiftDate = appointment_datetime.slice(0, 10);
    const shiftTime = appointment_datetime.slice(11, 19);

    const shift = await DoctorShift.findOne({
      where: {
        doctor_id,
        shift_date: shiftDate,
        start_time: { [db.Sequelize.Op.lte]: shiftTime },
        end_time: { [db.Sequelize.Op.gt]: shiftTime },
      },
      transaction,
    });
    if (!shift) {
      throw new BadRequestError("Doctor is not available at this time");
    }
    const appointmentTime = new Date(appointment_datetime);
    const doctorConflict = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_datetime: appointmentTime,
        status: {
          [Op.in]: ["scheduled", "completed", "no_show"],
        },
      },
      transaction,
    });
    if (doctorConflict) {
      throw new BadRequestError(
        "Doctor already has an appointment at this time"
      );
    }
    const patientConflict = await Appointment.findOne({
      where: {
        patient_id,
        appointment_datetime: appointmentTime,
        status: {
          [Op.in]: ["scheduled", "completed", "no_show"],
        },
      },
      transaction,
    });
    if (patientConflict) {
      throw new BadRequestError(
        "Patient already has an appointment at this time"
      );
    }
    await Appointment.create(
      {
        patient_id,
        doctor_id,
        appointment_datetime: new Date(),
        fees: doctor.specialization.fees,
        booking_source: "offline",
        reason,
        arrival_status: "arrived",
        checkin_time: new Date(),
      },
      { transaction }
    );
    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

// export const acceptAppointment = async (appointment_id) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const appointment = await Appointment.findByPk(appointment_id, {
//       transaction,
//     });

//     if (!appointment) {
//       throw new NotFoundError("Appointment not found");
//     }

//     let appointmentTime = new Date(appointment.appointment_datetime);
//     const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);
//     let now = new Date();

//     const nowTimestamp = now.getTime();
//     const acceptLimitTimestamp = oneHourBefore.getTime();

//     if (nowTimestamp < acceptLimitTimestamp) {
//       appointment.status = "accepted";
//     } else {
//       throw new BadRequestError(
//         "You can only accept appointments at least 1 hour in advance."
//       );
//     }

//     await appointment.save({ transaction });

//     await transaction.commit();
//     return { message: "Success" };
//   } catch (error) {
//     await transaction.rollback();
//     if (error instanceof BadRequestError) {
//       throw error;
//     } else if (error instanceof NotFoundError) {
//       throw error;
//     }
//     throw new Error(error.message);
//   }
// };

export const cancelAppointmentByPatient = async (appointment_id) => {
  const transaction = await db.sequelize.transaction();
  try {
    const appointment = await Appointment.findByPk(appointment_id, {
      transaction,
    });

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.appointment_datetime);
    const twelveHoursBefore = new Date(
      appointmentDate.getTime() - 12 * 60 * 60 * 1000
    );

    if (appointment.status !== "scheduled") {
      throw new BadRequestError("You cannot cancel this appointment.");
    }
    if (now.getTime() > twelveHoursBefore.getTime()) {
      throw new BadRequestError(
        "You can only cancel appointments at least 12 hours in advance."
      );
    }
    appointment.status = "cancelled";
    appointment.arrival_status = "no_show";
    await appointment.save({ transaction });

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

// export const cancelAppointmentByDoctor = async (appointment_id) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const appointment = await Appointment.findByPk(appointment_id, {
//       transaction,
//     });

//     if (!appointment) {
//       throw new NotFoundError("Appointment not found");
//     }

//     const now = new Date();
//     const appointmentDate = new Date(appointment.appointment_datetime);
//     const oneDayBefore = new Date(appointmentDate);
//     oneDayBefore.setDate(oneDayBefore.getDate() - 1);

//     const nowTimestamp = now.getTime();
//     const oneDayBeforeTimestamp = oneDayBefore.getTime();

//     if (appointment.status === "waiting_for_confirmation") {
//       // Bác sĩ hủy khi chưa xác nhận
//       appointment.status = "cancelled";
//     } else if (appointment.status === "accepted") {
//       // Bác sĩ chỉ được hủy nếu còn trước 1 ngày
//       if (nowTimestamp > oneDayBeforeTimestamp) {
//         throw new BadRequestError(
//           "You cannot cancel this appointment less than 1 day in advance."
//         );
//       }
//       appointment.status = "cancelled";
//     } else {
//       throw new BadRequestError("You cannot cancel this appointment.");
//     }
//     await appointment.save({ transaction });

//     await transaction.commit();
//     return { message: "Success" };
//   } catch (error) {
//     await transaction.rollback();
//     if (error instanceof BadRequestError) {
//       throw error;
//     } else if (error instanceof NotFoundError) {
//       throw error;
//     }
//     throw new Error(error.message);
//   }
// };

export const completeAppointment = async (appointment_id) => {
  const transaction = await db.sequelize.transaction();
  try {
    const appointment = await Appointment.findByPk(appointment_id, {
      transaction,
    });

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    if (appointment.status === "completed") {
      throw new BadRequestError("Appointment is already completed");
    }

    // const now = new Date();
    // const appointmentDate = new Date(appointment.appointment_datetime);
    // const nowTimestamp = now.getTime();
    // const appointmentTimestamp = appointmentDate.getTime();

    // if (nowTimestamp <= appointmentTimestamp) {
    //   throw new BadRequestError(
    //     "Appointment cannot be completed before the scheduled time."
    //   );
    // }

    if (appointment.status === "scheduled") {
      appointment.status = "completed";
      // appointment.arrival_status = "arrived";
    } else {
      throw new BadRequestError("You cannot complete this appointment.");
    }
    await appointment.save({ transaction });

    const existingPayment = await Payment.findOne({
      where: { appointment_id },
      transaction,
    });

    if (!existingPayment) {
      await Payment.create(
        {
          appointment_id,
          amount: appointment.fees,
        },
        { transaction }
      );
    }

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const markPatientNotComing = async (appointment_id) => {
  const transaction = await db.sequelize.transaction();
  try {
    const appointment = await Appointment.findByPk(appointment_id, {
      transaction,
    });

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    if (appointment.status === "no_show") {
      throw new BadRequestError("Patient is already marked as not coming");
    }

    // const now = new Date();
    // const appointmentDate = new Date(appointment.appointment_datetime);
    // const nowTimestamp = now.getTime();
    // const appointmentTimestamp = appointmentDate.getTime();

    // if (nowTimestamp <= appointmentTimestamp) {
    //   throw new BadRequestError(
    //     "Appointment cannot be marked patient not coming before the scheduled time."
    //   );
    // }

    if (appointment.status === "scheduled") {
      appointment.status = "no_show";
      appointment.arrival_status = "no_show";
      // appointment.checkin_time = null;
    } else {
      throw new BadRequestError("You cannot mark patient as not coming.");
    }
    await appointment.save({ transaction });

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getAllAppointments = async () => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Patient,
          as: "patient",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
          ],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
            { model: Specialization, as: "specialization" },
          ],
        },
      ],
      // order: [["appointment_datetime", "ASC"]],
      order: [
        [
          literal(
            "COALESCE(`Appointment`.`checkin_time`, `Appointment`.`appointment_datetime`)"
          ),
          "ASC",
        ],
      ],
    });
    if (appointments.length === 0) {
      throw new NotFoundError("No appointments found");
    }

    const formattedAppointments = appointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
    }));
    return { message: "Success", appointments: formattedAppointments };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getPaidAppointments = async () => {
  try {
    const paidAppointments = await Appointment.findAll({
      where: { status: "completed" },
      include: [
        {
          model: Patient,
          as: "patient",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
          ],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
            { model: Specialization, as: "specialization" },
          ],
        },
        {
          model: Payment,
          as: "payment",
          where: { status: "paid" },
          required: true,
        },
      ],
      order: [["appointment_datetime", "DESC"]],
    });

    /*
    Khi dùng include + where, mặc định Sequelize dùng LEFT OUTER JOIN, tức là:
    - Vẫn lấy bản ghi từ bảng Appointment
    - Dù không có Payment, chỉ cần có Appointment, nó vẫn trả về (payment sẽ là null)
    - Điều này phá vỡ điều kiện lọc status: "paid" nếu bạn không cẩn thận
    -> dùng required: true, Sequelize sẽ dùng INNER JOIN
    */

    const formattedAppointments = paidAppointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
    }));

    return { message: "Success", paidAppointments: formattedAppointments };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAppointmentsDetails = async (appointment_id) => {
  try {
    const appointmentDetails = await Appointment.findByPk(appointment_id, {
      include: [
        {
          model: Patient,
          as: "patient",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
          ],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
            { model: Specialization, as: "specialization" },
          ],
        },
        {
          model: Feedback,
          as: "feedback",
        },
        {
          model: Prescription,
          as: "prescription",
        },
        {
          model: MedicalRecord,
          as: "medical_record",
        },
        {
          model: Payment,
          as: "payment",
        },
      ],
    });

    if (!appointmentDetails) {
      throw new NotFoundError("No appointment found");
    }

    const result = appointmentDetails.toJSON();

    result.appointment_datetime = formatToVNTime(
      appointmentDetails.appointment_datetime
    );

    return { message: "Success", appointmentDetails: result };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getAppointments = async (
  page = 1,
  limit = 10,
  status = null,
  date = null
) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      whereClause.appointment_datetime = {
        [Op.between]: [startDate, endDate],
      };
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: "patient",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
          ],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
            { model: Specialization, as: "specialization" },
          ],
        },
      ],
      // order: [["appointment_datetime", "DESC"]],
      order: [
        [
          literal(
            "COALESCE(`Appointment`.`checkin_time`, `Appointment`.`appointment_datetime`)"
          ),
          "DESC",
        ],
      ],
      limit,
      offset,
    });

    // if (appointments.length === 0) {
    //   throw new NotFoundError("No appointments found");
    // }

    const formattedAppointments = appointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
      checkin_time: a.checkin_time
        ? formatToVNTime(a.checkin_time)
        : formatToVNTime(a.appointment_datetime),
    }));

    return {
      message: "Success",
      appointments: formattedAppointments,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getAppointmentsStats = async () => {
  try {
    const appointments = await Appointment.findAll();

    if (appointments.length === 0) {
      throw new NotFoundError("No appointments found");
    }

    const today = new Date();
    const todayAppointments = appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_datetime);
      return isSameDay(apptDate, today);
    });

    return {
      message: "Success",
      total: todayAppointments.length,
      checked_in: todayAppointments.filter(
        (a) => a.arrival_status === "arrived"
      ).length,
      completed: todayAppointments.filter((a) => a.status === "completed")
        .length,
      cancelled: todayAppointments.filter((a) => a.status === "cancelled")
        .length,
      no_show: todayAppointments.filter((a) => a.status === "no_show").length,
      scheduled: todayAppointments.filter((a) => a.status === "scheduled")
        .length,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};
