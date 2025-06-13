import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { format, addDays, isSameDay } from "date-fns";
import "./Appointment.css";
import { StarFilled } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";

const Appointment = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAppContext();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // useEffect(() => {
  //   console.log(doctor);
  // }, [doctor]);

  // Tạo mảng 7 ngày từ ngày mai
  const availableDates = Array.from({ length: 7 }, (_, i) =>
    addDays(new Date(), i)
  );

  // Tạo mảng các khung giờ trong ngày
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 7; // Bắt đầu từ 7h
    return Array.from({ length: 6 }, (_, j) => {
      const minutes = j * 10;
      return `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    });
  }).flat();

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/patient/doctor_appointments/${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        // console.log(data);
        if (data.user) {
          setDoctor(data.user);
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error("Error fetching doctor info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorInfo();
  }, [user_id, API_URL]);

  const isDateAvailable = (date) => {
    if (!doctor?.doctor?.doctor_shifts) return false;

    const dateStr = format(date, "yyyy-MM-dd");
    return doctor.doctor.doctor_shifts.some(
      (shift) => shift.shift_date === dateStr
    );
  };

  const getShiftsForDate = (date) => {
    if (!doctor?.doctor?.doctor_shifts) return [];

    const dateStr = format(date, "yyyy-MM-dd");
    return doctor.doctor.doctor_shifts.filter(
      (shift) => shift.shift_date === dateStr
    );
  };

  const isTimeSlotAvailable = (time) => {
    if (!selectedDate || !doctor?.doctor?.doctor_shifts) return false;

    const shifts = getShiftsForDate(selectedDate);
    if (shifts.length === 0) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Kiểm tra thời gian đặt lịch phải trước ít nhất 2 tiếng
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    // Nếu ngày đặt lịch là hôm nay
    if (isSameDay(now, selectedDateTime)) {
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      if (selectedDateTime < twoHoursFromNow) {
        return false;
      }
    }

    // Kiểm tra xem thời gian có nằm trong ca làm việc nào không
    const isInShift = shifts.some((shift) => {
      const [startHours, startMinutes] = shift.start_time
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = shift.end_time.split(":").map(Number);
      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      return (
        timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes
      );
    });

    if (!isInShift) return false;

    // Kiểm tra xem thời gian đã có lịch hẹn nào chưa
    const selectedDateStr = format(selectedDate, "d/M/yyyy");
    const isTimeBooked = appointments?.some((appointment) => {
      // Chuyển đổi appointment_datetime từ "HH:mm:ss dd/MM/yyyy" thành phút
      const [timeStr, dateStr] = appointment.appointment_datetime.split(" ");
      if (dateStr !== selectedDateStr) return false;

      const [appHours, appMinutes] = timeStr.split(":").map(Number);
      const appointmentTimeInMinutes = appHours * 60 + appMinutes;

      // Kiểm tra xem thời gian đặt lịch có trùng với khung giờ đang xét không
      // Cho phép sai số 10 phút (thời gian khám)
      return Math.abs(appointmentTimeInMinutes - timeInMinutes) < 10;
    });

    return !isTimeBooked;
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !reason.trim()) {
      toast.info("Please fill in all required fields");
      return;
    }

    try {
      setBookingLoading(true);
      const token = localStorage.getItem("token");

      // Format datetime: YYYY-MM-DD HH:mm:ss
      const appointment_datetime = `${format(
        selectedDate,
        "yyyy-MM-dd"
      )} ${selectedTime}:00`;

      // const response = await fetch(`${API_URL}/appointment/book_online`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     doctor_id: doctor.doctor.doctor_id,
      //     appointment_datetime,
      //     reason: reason.trim(),
      //   }),
      // });

      const response = await axios.post(
        `${API_URL}/appointment/book_online`,
        {
          doctor_id: doctor.doctor.doctor_id,
          appointment_datetime,
          reason: reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Success") {
        toast.success("Appointment booked successfully!");
        navigate("/my-appointments"); // Chuyển đến trang danh sách lịch hẹn
      } else {
        throw new Error(response.data.message || "Failed to book appointment");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="appointment-loading">Loading...</div>;
  }

  if (!doctor) {
    return <div className="appointment-error">Doctor not found</div>;
  }

  return (
    <div className="appointment-container">
      <div className="appointment-doctor-info">
        <h2>Doctor Information</h2>
        <div className="appointment-info-card">
          <img
            src={doctor.avatar}
            alt={doctor.username}
            className="appointment-doctor-avatar"
          />
          <div className="appointment-info-details">
            <h3>{doctor.username}</h3>
            <p>Email: {doctor.email}</p>
            <p>Specialization: {doctor.doctor.specialization.name}</p>
            <p>Degree: {doctor.doctor.degree}</p>
            <p>Experience: {doctor.doctor.experience_years} years</p>
            <p>Description: {doctor.doctor.description}</p>
            <p>
              Rating:{" "}
              <StarFilled
                style={{ color: "#fadb14", marginRight: 4, fontSize: 16 }}
              />
              {doctor.doctor.rating ?? "N/A"}/5
            </p>
          </div>
        </div>
      </div>

      <div className="appointment-scheduler">
        <h2>Schedule Appointment</h2>

        <div className="appointment-date-selector">
          <h3>Select Date</h3>
          <div className="appointment-date-grid">
            {availableDates.map((date) => (
              <div
                key={date.toISOString()}
                className={`date-cell ${
                  isDateAvailable(date) ? "available" : "unavailable"
                } ${
                  selectedDate && isSameDay(date, selectedDate)
                    ? "selected"
                    : ""
                }`}
                onClick={() => isDateAvailable(date) && setSelectedDate(date)}
              >
                <div className="appointment-day">{format(date, "EEE")}</div>
                <div className="appointment-date">{format(date, "d")}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="appointment-time-selector">
            <h3>Select Time</h3>
            <div className="appointment-time-grid">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className={`appointment-time-slot ${
                    isTimeSlotAvailable(time) ? "available" : "unavailable"
                  } ${selectedTime === time ? "selected" : ""}`}
                  onClick={() =>
                    isTimeSlotAvailable(time) && setSelectedTime(time)
                  }
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="appointment-summary">
            <h3>Appointment Summary</h3>
            <p>Date: {format(selectedDate, "MMMM d, yyyy")}</p>
            <p>Time: {selectedTime}</p>
            <div className="appointment-reason">
              <label htmlFor="reason">Reason for booking appointment:</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe your symptoms or reason for booking appointment"
                rows={4}
                required
              />
            </div>
            <p style={{ color: "gray" }}>
              Dear patients, please arrive at the hospital at your scheduled
              appointment time to ensure a smooth consultation process and
              receive the best possible care.
            </p>
            <button
              className="appointment-book-button"
              onClick={handleBookAppointment}
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
