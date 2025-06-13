import initDB from "../models/index.js";
import BadRequestError from "../errors/bad_request.js";
import NotFoundError from "../errors/not_found.js";
import { formatToVNTime } from "../helper/formatToVNTime.js";
import { Op, literal } from "sequelize";

const db = await initDB();
const Admin = db.Admin;
const User = db.User;
const Patient = db.Patient;
const Doctor = db.Doctor;
const Specialization = db.Specialization;
// const Schedule = db.Schedule;
const Appointment = db.Appointment;
const DoctorShift = db.DoctorShift;
const Payment = db.Payment;

export const registerAdmin = async (username, password, email) => {
  const transaction = await db.sequelize.transaction();
  try {
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      throw new BadRequestError("Email is already registered");
    }
    const newUser = await User.create(
      { username, password, email, role: "admin" },
      { transaction }
    );
    const user_id = newUser.user_id;

    await Admin.create({ user_id }, { transaction });
    await transaction.commit();
    return { message: "Success" };
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};

export const loginAdmin = async (email, password) => {
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Admin, as: "admin" }],
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { admin } = user;
    if (!admin) throw new NotFoundError("Admin not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new BadRequestError("Invalid credentials");
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

export const getPatientAppointmentsByAdmin = async (user_id) => {
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
      where: { patient_id: patient.patient_id },
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
          model: Payment,
          as: "payment",
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

export const getDoctorProfileByAdmin = async (user_id) => {
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

export const getDoctorAppointmentsByAdmin = async (user_id) => {
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
          model: Patient,
          as: "patient",
          include: [
            { model: User, as: "user", attributes: { exclude: ["password"] } },
          ],
        },
      ],
      // order: [["checkin_time", "DESC"]],
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
      // Nếu checkin_time khác null thì hiển thị checkin_time, nếu null thì hiển thị appointment_datetime
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

export const createDoctorShift = async (
  doctor_id,
  shift_date,
  shift_type,
  start_time,
  end_time
) => {
  // Kiểm tra bác sĩ tồn tại
  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) throw new NotFoundError("Doctor not found");
  // Kiểm tra trùng ca
  const exists = await DoctorShift.findOne({
    where: { doctor_id, shift_date, shift_type },
  });
  if (exists)
    throw new BadRequestError(
      "Shift already exists for this doctor on this date and type"
    );
  // Tạo ca làm việc
  const shift = await DoctorShift.create({
    doctor_id,
    shift_date,
    shift_type,
    start_time,
    end_time,
  });
  return { message: "Success", shift };
};

// export const updateDoctorShift = async (shift_id, updateData) => {
//   const shift = await DoctorShift.findByPk(shift_id);
//   if (!shift) throw new NotFoundError("Shift not found");
//   // Nếu đổi ngày/ca, kiểm tra trùng
//   if (
//     (updateData.shift_date && updateData.shift_date !== shift.shift_date) ||
//     (updateData.shift_type && updateData.shift_type !== shift.shift_type)
//   ) {
//     const exists = await DoctorShift.findOne({
//       where: {
//         doctor_id: shift.doctor_id,
//         shift_date: updateData.shift_date || shift.shift_date,
//         shift_type: updateData.shift_type || shift.shift_type,
//         shift_id: { [Op.ne]: shift_id },
//       },
//     });
//     if (exists)
//       throw new BadRequestError(
//         "Shift already exists for this doctor on this date and type"
//       );
//   }
//   Object.assign(shift, updateData);
//   await shift.save();
//   return { message: "Success", shift };
// };

// export const deleteDoctorShift = async (shift_id) => {
//   const shift = await DoctorShift.findByPk(shift_id);
//   if (!shift) throw new NotFoundError("Shift not found");
//   await shift.destroy();
//   return { message: "Success" };
// };

export const updateDoctorShift = async (shift_id, updateData) => {
  const shift = await DoctorShift.findByPk(shift_id);
  if (!shift) throw new NotFoundError("Shift not found");

  // Nếu đổi ngày/ca hoặc thời gian, kiểm tra trùng
  if (
    (updateData.shift_date && updateData.shift_date !== shift.shift_date) ||
    (updateData.shift_type && updateData.shift_type !== shift.shift_type) ||
    (updateData.start_time && updateData.start_time !== shift.start_time) ||
    (updateData.end_time && updateData.end_time !== shift.end_time)
  ) {
    const exists = await DoctorShift.findOne({
      where: {
        doctor_id: shift.doctor_id,
        shift_date: updateData.shift_date || shift.shift_date,
        shift_type: updateData.shift_type || shift.shift_type,
        shift_id: { [Op.ne]: shift_id },
      },
    });
    if (exists)
      throw new BadRequestError(
        "Shift already exists for this doctor on this date and type"
      );

    // Tìm các appointment bị ảnh hưởng (nằm trong ca cũ, nhưng không còn hợp lệ với ca mới)
    const oldStart = new Date(`${shift.shift_date}T${shift.start_time}`);
    const oldEnd = new Date(`${shift.shift_date}T${shift.end_time}`);
    const newDate = updateData.shift_date || shift.shift_date;
    const newStart = updateData.start_time || shift.start_time;
    const newEnd = updateData.end_time || shift.end_time;

    const appointments = await Appointment.findAll({
      where: {
        doctor_id: shift.doctor_id,
        appointment_datetime: {
          [Op.gte]: oldStart,
          [Op.lt]: oldEnd,
        },
        status: { [Op.in]: ["scheduled"] },
      },
    });

    for (const appt of appointments) {
      // Nếu appointment không còn nằm trong ca mới thì hủy
      const apptTime = new Date(appt.appointment_datetime);
      const newStartTime = new Date(`${newDate}T${newStart}`);
      const newEndTime = new Date(`${newDate}T${newEnd}`);
      if (apptTime < newStartTime || apptTime >= newEndTime) {
        appt.status = "cancelled";
        await appt.save();
        // Gửi thông báo cho bệnh nhân nếu muốn
      }
    }
  }

  Object.assign(shift, updateData);
  await shift.save();
  return { message: "Success", shift };
};

export const deleteDoctorShift = async (shift_id) => {
  const shift = await DoctorShift.findByPk(shift_id);
  if (!shift) throw new NotFoundError("Shift not found");

  // Kiểm tra có appointment nào trong ca này không
  const appointments = await Appointment.findAll({
    where: {
      doctor_id: shift.doctor_id,
      appointment_datetime: {
        [Op.gte]: new Date(`${shift.shift_date}T${shift.start_time}`),
        [Op.lt]: new Date(`${shift.shift_date}T${shift.end_time}`),
      },
      status: { [Op.in]: ["scheduled"] },
    },
  });

  // Hủy các appointment này và gửi thông báo
  for (const appt of appointments) {
    appt.status = "cancelled";
    await appt.save();

    // Gửi email/thông báo cho bệnh nhân (nếu muốn)
    // const patient = await Patient.findByPk(appt.patient_id, { include: [{ model: User, as: "user" }] });
    // if (patient && patient.user && patient.user.email) {
    //   await sendEmail(patient.user.email, "Lịch hẹn của bạn đã bị hủy do bác sĩ thay đổi lịch làm việc.");
    // }
  }

  await shift.destroy();
  return { message: "Success" };
};

export const getDoctorShifts = async (doctor_id) => {
  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) throw new NotFoundError("Doctor not found");
  const shifts = await DoctorShift.findAll({
    where: { doctor_id },
    order: [
      ["shift_date", "ASC"],
      ["start_time", "ASC"],
    ],
  });
  return { message: "Success", shifts };
};

export const createOfflinePatient = async ({
  username,
  email,
  phone_number,
  date_of_birth,
  gender,
  address,
  insurance_number,
  id_number,
}) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Nếu không có email, tạo email giả định
    const finalEmail = email || `offline_${Date.now()}@noemail.com`;
    // Nếu không có username, tạo username giả định
    const finalUsername = username || `offline_${Date.now()}`;
    // Tạo user offline (không cần mật khẩu)
    const user = await User.create(
      {
        username: finalUsername,
        email: finalEmail,
        password: "", // không cần mật khẩu
        role: "patient",
      },
      { transaction }
    );
    // Tạo patient
    const patient = await Patient.create(
      {
        user_id: user.user_id,
        date_of_birth,
        gender,
        address,
        phone_number,
        insurance_number,
        id_number,
        is_verified: false,
      },
      { transaction }
    );
    await transaction.commit();
    return { message: "Success", user, patient };
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};
export const checkInAppointment = async (appointment_id) => {
  const transaction = await db.sequelize.transaction();
  try {
    const appointment = await Appointment.findByPk(appointment_id, {
      transaction,
    });
    if (!appointment) throw new NotFoundError("Appointment not found");
    if (appointment.status !== "scheduled") {
      throw new BadRequestError(
        "Only scheduled appointments can be checked in"
      );
    }
    appointment.arrival_status = "arrived";
    appointment.checkin_time = new Date();
    await appointment.save({ transaction });
    await transaction.commit();
    return { message: "Check-in successful" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) throw error;
    if (error instanceof NotFoundError) throw error;
    throw new Error(error.message);
  }
};

export const getAllPatients = async () => {
  const patients = await Patient.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
    ],
  });
  return { message: "Success", patients };
};
export const getAllDoctors = async () => {
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
      {
        model: DoctorShift,
        as: "doctor_shifts",
      },
      {
        model: Appointment,
        as: "appointments",
      },
    ],
  });
  const formattedDoctors = doctors.map((doctor) => ({
    ...doctor.toJSON(),
    appointments: doctor.appointments.map((appointment) => ({
      ...appointment.toJSON(),
      appointment_datetime: formatToVNTime(appointment.appointment_datetime),
    })),
  }));
  return { message: "Success", doctors: formattedDoctors };
};

export const addPatientOffline = async (patientData) => {
  try {
    const { username, email, ...patientInfo } = patientData;

    // Validate required fields
    if (!username || !email) {
      throw new Error("Username and email are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Create user
    const user = await User.create({
      username,
      email,
      role: "patient",
    });

    // Create patient
    const patient = await Patient.create({
      user_id: user.user_id,
      gender: patientInfo.gender,
      date_of_birth: patientInfo.date_of_birth,
      phone_number: patientInfo.phone_number,
      address: patientInfo.address,
      insurance_number: patientInfo.insurance_number,
      id_number: patientInfo.id_number,
    });

    return { message: "Success", patient };
  } catch (error) {
    throw new Error(error.message || "Failed to add patient");
  }
};

export const searchDoctors = async (specialization_id) => {
  try {
    // Get current time and date
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:mm
    // const currentDate = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const currentDate = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    // Determine shift type based on current time
    let shift_type;
    const hour = now.getHours();
    if (hour >= 0 && hour < 13) {
      shift_type = "morning";
    } else if (hour >= 13 && hour < 23) {
      shift_type = "afternoon";
    } else {
      return {
        message: "No doctors available at this time",
        doctors: [],
      };
    }
    console.log(shift_type);
    console.log(currentTime);
    console.log(currentDate);
    // Find doctors with matching specialization
    const doctors = await Doctor.findAll({
      where: {
        specialization_id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
        {
          model: DoctorShift,
          as: "doctor_shifts",
          where: {
            shift_date: currentDate,
            shift_type,
            start_time: { [Op.lte]: currentTime },
            end_time: { [Op.gte]: currentTime },
          },
          required: true,
        },
      ],
    });

    if (!doctors || doctors.length === 0) {
      return {
        message: "No doctors found matching the criteria",
        doctors: [],
      };
    }

    return {
      message: "Doctors found successfully",
      doctors,
    };
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    if (error instanceof NotFoundError) throw error;
    throw error;
  }
};

export const updatePatientProfile = async (user_id, updateData) => {
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

    const userFields = ["username", "email"];
    let emailChanged = false;
    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "email" && updateData.email !== user.email) {
          emailChanged = true;
        }
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

    const patientFields = [
      "date_of_birth",
      "gender",
      "address",
      "phone_number",
      "insurance_number",
      "id_number",
    ];

    patientFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        patient[field] = updateData[field];
      }
    });

    if (emailChanged) {
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

      patient.is_verified = false;
      patient.otp_code = otp_code;
      patient.otp_expiry = otp_expiry;
    }

    await user.save({ transaction });
    await patient.save({ transaction });

    if (emailChanged) {
      const link = `${process.env.URL}/patient/verify?email=${updateData.email}&otp_code=${patient.otp_code}`;
      await sendVerifyLink(updateData.email, link); // Gửi email xác thực mới
    }

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

export const createBulkDoctorShifts = async (shifts) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Validate dữ liệu đầu vào
    for (const shift of shifts) {
      const { doctor_id, shift_date, shift_type, start_time, end_time } = shift;

      // Kiểm tra bác sĩ tồn tại
      const doctor = await Doctor.findByPk(doctor_id);
      if (!doctor) {
        throw new BadRequestError(`Doctor with ID ${doctor_id} not found`);
      }

      // Kiểm tra trùng ca
      const exists = await DoctorShift.findOne({
        where: { doctor_id, shift_date, shift_type },
        transaction,
      });

      if (exists) {
        throw new BadRequestError(
          `Shift already exists for doctor ${doctor_id} on ${shift_date} (${shift_type})`
        );
      }

      // Kiểm tra thời gian hợp lệ
      const start = new Date(`${shift_date}T${start_time}`);
      const end = new Date(`${shift_date}T${end_time}`);

      if (start >= end) {
        throw new BadRequestError(
          `Invalid time range for doctor ${doctor_id} on ${shift_date}`
        );
      }

      // Kiểm tra tổng số giờ làm việc
      const totalHours = (end - start) / (1000 * 60 * 60);
      if (totalHours > 12) {
        throw new BadRequestError(
          `Total working hours cannot exceed 12 hours for doctor ${doctor_id} on ${shift_date}`
        );
      }
    }

    // Tạo các ca làm việc
    const createdShifts = await DoctorShift.bulkCreate(shifts, { transaction });

    await transaction.commit();
    return { message: "Success", shifts: createdShifts };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BadRequestError) throw error;
    throw new Error(error.message);
  }
};

export const getAllDoctorShifts = async () => {
  const shifts = await DoctorShift.findAll({
    include: [
      {
        model: Doctor,
        as: "doctor",
      },
    ],
  });
  return { message: "Success", shifts };
};
