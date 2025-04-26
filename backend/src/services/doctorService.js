import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";
import cloudinary from "../config/cloudinary.js";
import { formatToVNTime } from "../helper/formatToVNTime.js";
import { isSameDay } from "../helper/isSameDay.js";

const db = await initDB();
const Doctor = db.Doctor;
const User = db.User;
const Patient = db.Patient;
const Specialization = db.Specialization;
const Schedule = db.Schedule;
const Appointment = db.Appointment;
const Feedback = db.Feedback;

export const loginDoctor = async (email, password) => {
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Doctor, as: "doctor" }],
    });

    if (!user) {
      throw new NotFoundError("Doctor not found");
    }

    const { doctor } = user;
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new BadRequestError("Invalid password");
    }

    const role = user.role;
    const token = user.createJWT();

    return {
      message: "Success",
      role,
      token,
    };
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getAllDoctors = async () => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
        {
          model: Specialization,
          as: "specialization",
        },
      ],
    });

    if (doctors.length === 0) {
      throw new NotFoundError("No doctors found");
    }

    return {
      message: "Success",
      doctors,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

// user + doctor + specialization + schedule
export const getDoctorProfile = async (user_id) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Doctor,
          as: "doctor",
          include: [
            { model: Specialization, as: "specialization" },
            { model: Schedule, as: "schedule" },
          ],
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { doctor } = user;
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    return {
      message: "Success",
      user,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getDoctorAppointments = async (
  user_id,
  page = 1,
  limit = 10,
  status = null
) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Doctor, as: "doctor" }],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { doctor } = user;
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const doctor_id = doctor.doctor_id;

    const offset = (page - 1) * limit;

    const whereClause = { doctor_id };
    if (status) {
      whereClause.status = status;
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
      ],
      order: [["appointment_datetime", "DESC"]],
      limit,
      offset,
    });

    const formattedAppointments = appointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
    }));

    return {
      message: "Success",
      user,
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

export const getPatientAppointmentsByDoctor = async (user_id) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Patient, as: "patient" }],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { patient } = user;
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const appointments = await Appointment.findAll({
      where: {
        patient_id: patient.patient_id,
        status: "completed",
      },
      include: [
        {
          model: Doctor,
          as: "doctor",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
            { model: Specialization, as: "specialization" },
          ],
        },
      ],
      order: [["appointment_datetime", "DESC"]],
    });

    const formattedAppointments = appointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
    }));

    return {
      message: "Success",
      user,
      appointments: formattedAppointments,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const addDoctor = async (doctorData) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      username,
      email,
      password,
      avatar,
      specialization_id,
      degree,
      experience_years,
      description,
    } = doctorData;

    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      throw new BadRequestError("Email is already registered");
    }

    let avatarUrl = null;
    if (avatar) {
      const uploadResult = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        use_filename: true,
        unique_filename: false,
      });

      avatarUrl = uploadResult.secure_url;
    }

    const newUser = await User.create(
      {
        username,
        email,
        password,
        avatar:
          avatarUrl ||
          "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png",
        role: "doctor",
      },
      { transaction }
    );

    const user_id = newUser.user_id;

    const newDoctor = await Doctor.create(
      {
        user_id,
        specialization_id,
        degree,
        experience_years,
        description,
      },
      { transaction }
    );

    const doctor_id = newDoctor.doctor_id;

    await Schedule.create(
      {
        doctor_id,
      },
      { transaction }
    );

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new Error(error.message);
  }
}; // add user + doctor + schedule

export const updateDoctorProfile = async (user_id, updateData) => {
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
      throw new NotFoundError("Doctor not found");
    }

    const userFields = ["username", "email"];
    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    if (updateData.avatar) {
      const uploadResult = await cloudinary.uploader.upload(updateData.avatar, {
        folder: "avatars",
        use_filename: true,
        unique_filename: false,
      });
      user.avatar = uploadResult.secure_url;
    }

    const doctorFields = [
      "degree",
      "experience_years",
      "description",
      "specialization_id",
    ];
    doctorFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        doctor[field] = updateData[field];
      }
    });

    await user.save({ transaction });
    await doctor.save({ transaction });

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const deleteDoctor = async (user_id) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findByPk(user_id, {
      include: [{ model: Doctor, as: "doctor" }],
      transaction,
    });

    if (!user || !user.doctor) {
      throw new NotFoundError("Doctor not found");
    }

    await user.destroy({ transaction }); // CASCADE sẽ xóa doctor & schedule liên quan

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getDoctorFeedback = async (user_id) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Doctor, as: "doctor" }],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { doctor } = user;
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const doctor_id = doctor.doctor_id;

    const appointments = await Appointment.findAll({
      where: { doctor_id },
      include: [
        {
          model: Feedback,
          as: "feedback",
        },
      ],
    });

    if (appointments.length === 0) {
      throw new NotFoundError("Appointments not found");
    }

    return {
      message: "Success",
      appointments,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getDoctorAppointmentStats = async (user_id) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Doctor, as: "doctor" }],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { doctor } = user;
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const doctor_id = doctor.doctor_id;

    const appointments = await Appointment.findAll({
      where: { doctor_id },
    });

    const today = new Date();
    const todayAppointments = appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_datetime);
      return isSameDay(apptDate, today);
    });

    return {
      message: "Success",
      total: todayAppointments.length,
      waiting: appointments.filter(
        (a) => a.status === "waiting_for_confirmation"
      ).length,
      accepted: appointments.filter((a) => a.status === "accepted").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      notComing: appointments.filter((a) => a.status === "patient_not_coming")
        .length,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};
