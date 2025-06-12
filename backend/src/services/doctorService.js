import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";
import cloudinary from "../config/cloudinary.js";
import { formatToVNTime } from "../helper/formatToVNTime.js";
import { isSameDay } from "../helper/isSameDay.js";
// import { sequelize } from "../models/index.js";
import { Op, literal } from "sequelize";
const db = await initDB();
const Doctor = db.Doctor;
const User = db.User;
const Patient = db.Patient;
const Specialization = db.Specialization;
// const Schedule = db.Schedule;
const Appointment = db.Appointment;
const Feedback = db.Feedback;
const DoctorShift = db.DoctorShift;
const MedicalRecord = db.MedicalRecord;
const Prescription = db.Prescription;

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

export const getAllDoctors = async ({
  specialization_id,
  date,
  shift_type,
  start_time,
  end_time,
}) => {
  try {
    const where = {};
    if (specialization_id) {
      where.specialization_id = specialization_id;
    }
    let doctors;
    // Nếu có tìm kiếm theo ca làm việc
    if (date || shift_type || start_time || end_time) {
      // Lấy các ca làm việc phù hợp
      const shiftWhere = {};
      if (date) shiftWhere.shift_date = date;
      if (shift_type) shiftWhere.shift_type = shift_type;
      if (start_time) shiftWhere.start_time = { [Op.lte]: start_time }; // <=
      if (end_time) shiftWhere.end_time = { [Op.gte]: end_time }; // >=
      // Lấy tất cả ca phù hợp

      const shiftList = await DoctorShift.findAll({ where: shiftWhere });
      // Lọc các bác sĩ có ca làm việc phù hợp
      const doctorIds = shiftList.map((s) => s.doctor_id);
      // Nếu không có ca nào phù hợp thì trả về rỗng
      if (doctorIds.length === 0) {
        return { message: "Success", doctors: [] };
      }
      // Lấy thông tin bác sĩ
      doctors = await Doctor.findAll({
        where: { ...where, doctor_id: doctorIds },
        include: [
          { model: User, as: "user", attributes: { exclude: ["password"] } },
          { model: Specialization, as: "specialization" },
        ],
      });
      // // Nếu muốn loại bỏ bác sĩ đã kín lịch trong ca đó:
      // if (date && (shift_type || (start_time && end_time))) {
      //   // Lọc các bác sĩ đã kín lịch (có appointment trong ca này)
      //   const availableDoctors = [];
      //   for (const doctor of doctors) {
      //     // Tìm ca làm việc của bác sĩ này
      //     const shift = shiftList.find((s) => s.doctor_id === doctor.doctor_id);
      //     if (!shift) continue;
      //     // Tìm appointment trong ca này
      //     const appts = await Appointment.findAll({
      //       where: {
      //         doctor_id: doctor.doctor_id,
      //         appointment_datetime: {
      //           [db.Sequelize.Op.gte]: new Date(
      //             `${shift.shift_date}T${shift.start_time}`
      //           ),
      //           [db.Sequelize.Op.lt]: new Date(
      //             `${shift.shift_date}T${shift.end_time}`
      //           ),
      //         },
      //         status: { [db.Sequelize.Op.in]: ["scheduled"] },
      //       },
      //     });
      //     // Nếu chưa kín lịch (ví dụ: chưa có appointment hoặc còn slot), cho vào danh sách
      //     // Ở đây bạn có thể kiểm tra số lượng slot tối đa/ca nếu muốn
      //     if (appts.length === 0) {
      //       availableDoctors.push(doctor);
      //     }
      //   }
      //   doctors = availableDoctors;
      // }
    } else {
      // Không truyền ngày/ca, trả về tất cả bác sĩ như cũ
      doctors = await Doctor.findAll({
        where,
        include: [
          { model: User, as: "user", attributes: { exclude: ["password"] } },
          { model: Specialization, as: "specialization" },
        ],
      });
    }
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

// user + doctor + specialization + doctor_shifts
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
            { model: DoctorShift, as: "doctor_shifts" },
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
      // Sắp xếp: check-in trước, chưa check-in sau, no_show cuối cùng, trong mỗi nhóm theo thời gian tăng dần
      order: [
        // [
        //   db.sequelize.literal(
        //     `FIELD(arrival_status, 'arrived', 'pending', 'no_show')`
        //   ),
        //   "ASC",
        // ],
        // [
        //   db.sequelize.literal(
        //     `CASE WHEN arrival_status = 'arrived' THEN checkin_time ELSE appointment_datetime END`
        //   ),
        //   "ASC",
        // ],
        // ["appointment_datetime", "ASC"],
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

    const formattedAppointments = appointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
      checkin_time: a.checkin_time
        ? formatToVNTime(a.checkin_time)
        : formatToVNTime(a.appointment_datetime),
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
        {
          model: MedicalRecord,
          as: "medical_record",
        },
        {
          model: Prescription,
          as: "prescription",
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
    });

    const formattedAppointments = appointments.map((a) => ({
      ...a.toJSON(),
      appointment_datetime: formatToVNTime(a.appointment_datetime),
      checkin_time: a.checkin_time
        ? formatToVNTime(a.checkin_time)
        : formatToVNTime(a.appointment_datetime),
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

    // const doctor_id = newDoctor.doctor_id;

    // await Schedule.create(
    //   {
    //     doctor_id,
    //   },
    //   { transaction }
    // );

    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new Error(error.message);
  }
}; // add user + doctor

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

    await user.destroy({ transaction });

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

export const getDoctorShifts = async (user_id) => {
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

    const shifts = await DoctorShift.findAll({
      where: { doctor_id },
      order: [
        ["shift_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    const formattedShifts = shifts.map((shift) => {
      const shiftDate = new Date(shift.shift_date);

      return {
        ...shift.toJSON(),
        shift_date: shiftDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      };
    });

    return {
      message: "Success",
      shifts: formattedShifts,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(error.message);
  }
};

export const getTopDoctors = async () => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        { model: User, as: "user", attributes: { exclude: ["password"] } },
        { model: Specialization, as: "specialization" },
      ],
      order: [["rating", "DESC"]],
      limit: 10,
    });

    if (doctors.length === 0) {
      throw new NotFoundError("No doctors found");
    }

    return {
      message: "Success",
      doctors,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
