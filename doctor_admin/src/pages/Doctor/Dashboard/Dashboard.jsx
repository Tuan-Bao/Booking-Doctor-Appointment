import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import { format, parse } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { API_URL } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    todayPatients: 0,
    todayAppointments: 0,
    today_appointments: [],
    appointments: [],
    nextPatient: null,
    averageRating: 0,
    totalReviews: 0,
    ratings: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const [date, setDate] = useState(new Date());

  // Patient statistics data for pie chart
  // const [patientData, setPatientData] = useState([
  //   { name: "New Patients", value: 0, color: "#3A59D1" },
  //   { name: "Old Patients", value: 0, color: "#7AC6D2" },
  // ]);

  const handlePatientDetails = (user_id) => {
    if (user_id) {
      navigate(`/doctor/patient/${user_id}`);
    } else {
      console.log("Patient information not found");
    }
  };

  function isSameDay(dateA, dateB) {
    return (
      dateA.getDate() === dateB.getDate() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getFullYear() === dateB.getFullYear()
    );
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch doctor profile and appointments
        const [profileResponse, feedbackResponse] = await Promise.all([
          axios.get(`${API_URL}/doctor/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/doctor/feedback`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { user } = profileResponse.data;
        const { appointments: feedbackAppointments } = feedbackResponse.data;

        // Process feedback data
        const feedbacksWithComments = feedbackAppointments.filter(
          (appt) => appt.feedback
        );
        const ratingCounts = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        feedbacksWithComments.forEach((appt) => {
          if (appt.feedback) {
            ratingCounts[appt.feedback.rating]++;
          }
        });

        setDashboardData((prev) => ({
          ...prev,
          averageRating: user.doctor.rating,
          totalReviews: feedbacksWithComments.length,
          ratings: Object.entries(ratingCounts).map(([rating, count]) => ({
            rating: parseInt(rating),
            count,
            percentage:
              feedbacksWithComments.length > 0
                ? Math.round((count / feedbacksWithComments.length) * 100)
                : 0,
          })),
        }));

        // Assume we have an endpoint to get doctor profile with today's appointments
        const response = await axios.get(`${API_URL}/doctor/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log(response.data);
        // Extract relevant data (this will depend on your actual API response)
        const { appointments } = response.data;
        const uniquePatientIds = new Set(
          appointments.map((appt) => appt.patient?.patient_id)
        );
        const totalPatients = uniquePatientIds.size;

        // Filter today's appointments
        const today = new Date();
        const todayAppointmentsList = appointments
          .filter((appt) => {
            const parsedDate = parse(
              appt.checkin_time,
              "HH:mm:ss d/M/yyyy",
              new Date()
            );
            return (
              isSameDay(parsedDate, today) && appt.status === "scheduled"
              // && parsedDate >= new Date()
            );
          })
          .sort((a, b) => {
            const dateA = parse(
              a.checkin_time,
              "HH:mm:ss d/M/yyyy",
              new Date()
            );
            const dateB = parse(
              b.checkin_time,
              "HH:mm:ss d/M/yyyy",
              new Date()
            );
            return dateA - dateB; // ASC (tăng dần)
          });

        // Find next patient
        const nextPatient = todayAppointmentsList.find((appt) => {
          // const apptDate = parse(
          //   appt.checkin_time,
          //   "HH:mm:ss d/M/yyyy",
          //   new Date()
          // );
          return appt.status === "scheduled";
          // && apptDate > new Date()
        });

        const todayPatients = new Set(
          todayAppointmentsList.map((appt) => appt.patient?.patient_id)
        ).size;

        // Đếm số lần mỗi patient_id xuất hiện
        const patientVisitCount = {};

        appointments.forEach((appt) => {
          const patientId = appt.patient?.patient_id;
          if (patientId) {
            patientVisitCount[patientId] =
              (patientVisitCount[patientId] || 0) + 1;
          }
        });

        // Đếm số bệnh nhân mới và cũ
        // let newPatients = 0;
        // let oldPatients = 0;

        // Object.values(patientVisitCount).forEach((count) => {
        //   if (count === 1) newPatients++;
        //   else oldPatients++;
        // });

        // Cập nhật patientData cho PieChart
        // setPatientData([
        //   { name: "New Patients", value: newPatients, color: "#3D90D7" },
        //   { name: "Old Patients", value: oldPatients, color: "#7AC6D2" },
        // ]);
        // console.log("todayAppointmentsList: ", todayAppointmentsList);
        setDashboardData({
          totalPatients: totalPatients,
          todayPatients: todayPatients,
          todayAppointments: todayAppointmentsList.length,
          today_appointments: todayAppointmentsList,
          appointments: appointments,
          nextPatient: nextPatient || null,
          averageRating: user.doctor.rating,
          totalReviews: feedbacksWithComments.length,
          ratings: Object.entries(ratingCounts).map(([rating, count]) => ({
            rating: parseInt(rating),
            count,
            percentage:
              feedbacksWithComments.length > 0
                ? Math.round((count / feedbacksWithComments.length) * 100)
                : 0,
          })),
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format time from datetime string (assuming format like "2023-12-21T09:30:00")
  // const formatTime = (datetimeStr) => {
  //   try {
  //     const time = datetimeStr.split("T")[1].substring(0, 5);
  //     return time.replace(":", " : ");
  //   } catch {
  //     return datetimeStr;
  //   }
  // };

  // Handle calendar tile content
  // const tileContent = ({ date }) => {
  //   // Check if date has appointments
  //   const dateString = format(date, "dd/M/yyyy");
  //   const hasAppointments = dashboardData.appointments.some((appt) =>
  //     appt.appointment_datetime.includes(dateString)
  //   );

  //   return hasAppointments ? <div className="appointment-dot"></div> : null;
  // };

  // const getStatusLabel = (status) => {
  //   const statusMap = {
  //     scheduled: "Scheduled",
  //     cancelled: "Cancelled",
  //     completed: "Completed",
  //     no_show: "No Show",
  //   };

  //   return statusMap[status] || "Unknown";
  // };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        {/* <div className="card">
          <div className="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="blue"
              width="48"
              height="48"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>Total Patients</h3>
            <h2>{dashboardData.totalPatients}</h2>
            <p>Till Today</p>
          </div>
        </div> */}
        <div className="card">
          <div className="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="blue"
              width="48"
              height="48"
            >
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>Today Patients</h3>
            <h2>{dashboardData.todayPatients}</h2>
            <p>{format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="blue"
              width="48"
              height="48"
            >
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>Today Appointments</h3>
            <h2>{dashboardData.todayAppointments}</h2>
            <p>{format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Left Section - Patient Summary */}
        {/* <div className="patient-summary">
          <h3>Patients Summary {format(new Date(), "MMMM yyyy")}</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={patientData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                >
                  {patientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {patientData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Middle Section - Today's Appointments */}
        <div className="today-appointments">
          <h3>Today Appointments</h3>
          <div className="appointment-list">
            <div className="appointment-header">
              <span>Patient</span>
              <span>Name</span>
              <span>Date</span>
              <span>Reason</span>
            </div>

            <div className="appointment-scroll-container">
              {dashboardData.today_appointments.length > 0 ? (
                dashboardData.today_appointments.map((appointment, index) => (
                  <div key={index} className="appointment-item">
                    <div className="patient-avatar">
                      <img
                        src={
                          appointment.patient?.user?.avatar ||
                          "https://via.placeholder.com/40"
                        }
                        alt="Patient"
                      />
                    </div>
                    <div className="patient-info-dashboard-doctor">
                      <div className="patient-name">
                        {appointment.patient?.user?.username || "Unknown"}
                      </div>
                    </div>
                    <div className="appointment-time">
                      {appointment.checkin_time}
                    </div>
                    <div className="appointment-reason">
                      {appointment.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-appointments">No appointments for today</div>
              )}
            </div>

            <div className="see-all">
              <a href="/doctor/appointments">See All Today Appointments</a>
            </div>
          </div>
        </div>

        {/* Right Section - Next Patient */}
        <div className="next-patient">
          <h3>Next Patient</h3>
          {dashboardData.nextPatient ? (
            <div className="patient-card">
              <div className="patient-header">
                <div className="patient-avatar-name">
                  <img
                    src={
                      dashboardData.nextPatient?.patient?.user?.avatar ||
                      "https://via.placeholder.com/60"
                    }
                    alt="Patient"
                    className="patient-avatar-img"
                  />
                  <div className="patient-name-info">
                    <h4 className="patient-name">
                      {dashboardData.nextPatient?.patient?.user?.username ||
                        "Unknown"}
                    </h4>
                  </div>
                </div>

                <div className="patient-id-container">
                  <span className="patient-id-label">Patient ID</span>
                  <span className="patient-id-value">
                    {dashboardData.nextPatient.patient?.patient_id || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="patient-details-grid">
                <div className="detail-item">
                  <span className="detail-label">D.O.B</span>
                  <span className="detail-value">
                    {dashboardData.nextPatient.patient?.date_of_birth
                      ? format(
                          new Date(
                            dashboardData.nextPatient.patient.date_of_birth
                          ),
                          "dd MMMM yyyy"
                        )
                      : "Unknown"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Sex</span>
                  <span className="detail-value">
                    {dashboardData.nextPatient.patient?.gender || "Unknown"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">
                    {dashboardData.nextPatient.patient?.user?.email ||
                      "Unknown"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">
                    {dashboardData.nextPatient.patient?.phone_number ||
                      "Unknown"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {dashboardData.nextPatient.patient?.address || "Unknown"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Insurance</span>
                  <span className="detail-value">
                    {dashboardData.nextPatient.patient?.insurance_number ||
                      "Unknown"}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                {/* <button className="btn-call">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
                  </svg>
                  Call
                </button> */}
                <button
                  className="btn-document"
                  onClick={() =>
                    handlePatientDetails(
                      dashboardData.nextPatient.patient.user_id
                    )
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4 0h5.5v1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h1V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
                    <path d="M9.5 3V0L14 4.5h-3A1.5 1.5 0 0 1 9.5 3z" />
                  </svg>
                  Patient Details
                </button>
              </div>
            </div>
          ) : (
            <div className="no-next-patient">No upcoming patients</div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      {/* <div className="bottom-section">
        <div className="patient-reviews">
          <h3>Patients Review</h3>
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">
                {dashboardData.averageRating.toFixed(1)}
              </span>
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    className={`star ${
                      index < Math.floor(dashboardData.averageRating)
                        ? "filled"
                        : ""
                    } ${
                      index === Math.floor(dashboardData.averageRating) &&
                      dashboardData.averageRating % 1 >= 0.5
                        ? "half-filled"
                        : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="total-reviews">
                {dashboardData.totalReviews} reviews
              </span>
            </div>
          </div>
          <div className="rating-distribution">
            {dashboardData.ratings.map(({ rating, count, percentage }) => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} stars</span>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="rating-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-section">
          <h3>Calendar</h3>
          <div className="calendar-container">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
            />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
