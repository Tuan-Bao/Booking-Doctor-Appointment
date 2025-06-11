import React, { useEffect, useState } from "react";
import "./SpecialityMenu.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const SpecialityMenu = () => {
  const { API_URL } = useAppContext();
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/specialization/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpecialities(res.data.specializations || []);
      } catch {
        setSpecialities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialities();
  }, []);

  return (
    <div className="speciality-menu-container">
      <h2 className="speciality-menu-title">
        Find by <span>Speciality</span>
      </h2>
      <p className="speciality-menu-desc">
        Simply browse through our extensive list of trusted doctors, schedule
        your appointment hassle-free.
      </p>
      {loading ? (
        <div className="speciality-menu-loading">Loading...</div>
      ) : (
        <div className="speciality-menu-list">
          {specialities.map((item) => (
            <div
              className="speciality-menu-item"
              key={item.specialization_id}
              onClick={() => {
                navigate(`/doctors/${item.specialization_id}`);
              }}
            >
              <div className="speciality-menu-icon">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="speciality-menu-name">{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialityMenu;
