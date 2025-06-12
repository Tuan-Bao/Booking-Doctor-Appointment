// import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { AppContext } from '../context/AppContext';
// import { doctors } from "../../assets/assets";
import "./TopDoctors.css";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect } from "react";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { API_URL } = useAppContext();
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopDoctors = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_URL}/doctor/top`);
      setTopDoctors(res.data.doctors);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopDoctors();
  }, []);

  useEffect(() => {
    console.log(topDoctors);
  }, [topDoctors]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="top-doctors">
      <h1 className="top-doctors__title">Top Doctors to Book</h1>
      <p className="top-doctors__subtitle">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="top-doctors__grid">
        {topDoctors.map((item) => (
          <div
            key={item._id}
            className="top-doctors__card"
            onClick={() => {
              navigate(`/appointment/${item.user.user_id}`);
              window.scrollTo(0, 0);
            }}
          >
            <img
              className="top-doctors__img"
              src={item.user.avatar}
              alt={item.user.username}
            />
            <div className="top-doctors__card-content">
              {/* <div
                className={`top-doctors__status ${
                  item.available
                    ? "top-doctors__status--available"
                    : "top-doctors__status--unavailable"
                }`}
              >
                <span
                  className={`top-doctors__status-dot ${
                    item.available
                      ? "top-doctors__status-dot--available"
                      : "top-doctors__status-dot--unavailable"
                  }`}
                />
                <span>{item.available ? "Available" : "Not Available"}</span>
              </div> */}

              <p className="top-doctors__name">{item.user.username}</p>
              <p className="top-doctors__speciality">
                {item.specialization.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="top-doctors__more-btn"
        onClick={() => {
          navigate("/doctors");
          window.scrollTo(0, 0);
        }}
      >
        More
      </button>
    </div>
  );
};

export default TopDoctors;
