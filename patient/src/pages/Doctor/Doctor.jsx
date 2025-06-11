import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Doctor.css";
import { useAppContext } from "../../context/AppContext";
import { StarFilled } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Doctor = () => {
  const navigate = useNavigate();
  const { speciality_id } = useParams();
  const { API_URL } = useAppContext();
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    specialization_id: "",
    date: "",
    shift_type: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchSpecialities();
    // fetchDoctors();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Khi đã có danh sách specialities và có param speciality trên URL
    if (speciality_id) {
      // Tìm id theo tên (không phân biệt hoa thường)
      const found = specialities.find(
        (s) => String(s.specialization_id) === String(speciality_id)
      );
      if (found) {
        const newFilters = {
          ...filters,
          specialization_id: found.specialization_id,
        };
        setFilters(newFilters);
        fetchDoctors(newFilters);
        return;
      }
    }
    // Nếu không có param speciality thì fetch tất cả
    if (!speciality_id) {
      const newFilters = { ...filters, specialization_id: "" };
      setFilters(newFilters);
      fetchDoctors(newFilters);
    }
    // eslint-disable-next-line
  }, [specialities, speciality_id]);

  const fetchSpecialities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/specialization/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpecialities(res.data.specializations || []);
    } catch {
      setSpecialities([]);
    }
  };

  const fetchDoctors = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/doctor/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setDoctors(res.data.doctors || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load doctors"
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDoctors(filters);
  };

  return (
    <div className="doctor-container">
      <h2 className="doctor-title">Find Your Doctor</h2>
      <form className="doctor-filter" onSubmit={handleFilterSubmit}>
        <select
          name="specialization_id"
          value={filters.specialization_id}
          onChange={handleFilterChange}
        >
          <option value="">All Specialities</option>
          {specialities.map((spec) => (
            <option value={spec.specialization_id} key={spec.specialization_id}>
              {spec.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
        <select
          name="shift_type"
          value={filters.shift_type}
          onChange={handleFilterChange}
        >
          <option value="">All Shifts</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
        </select>
        <input
          type="time"
          name="start_time"
          value={filters.start_time}
          onChange={handleFilterChange}
        />
        <input
          type="time"
          name="end_time"
          value={filters.end_time}
          onChange={handleFilterChange}
        />
        <button type="submit" className="doctor-filter-btn">
          Filter
        </button>
      </form>
      {loading ? (
        <div className="doctor-loading">Loading...</div>
      ) : error ? (
        <div className="doctor-error">{error}</div>
      ) : (
        <div className="doctor-list">
          {doctors.length === 0 ? (
            <div className="doctor-empty">No doctors found.</div>
          ) : (
            doctors.map((doctor) => (
              <div
                className="patient-doctor-card"
                key={doctor.doctor_id}
                onClick={() => navigate(`/appointment/${doctor.user.user_id}`)}
              >
                <img
                  className="doctor-avatar"
                  src={doctor.user?.avatar || "/default-doctor.png"}
                  alt={doctor.user?.username}
                />
                <div className="doctor-info">
                  <div className="doctor-name">{doctor.user?.username}</div>
                  <div className="doctor-speciality">
                    {doctor.specialization?.name}
                  </div>
                  <div className="doctor-rating">
                    <StarFilled
                      style={{ color: "#fadb14", marginRight: 4, fontSize: 16 }}
                    />
                    {doctor.rating ?? "N/A"}/5
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Doctor;
