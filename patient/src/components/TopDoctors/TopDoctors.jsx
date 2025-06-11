// import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { AppContext } from '../context/AppContext';
import { doctors } from "../../assets/assets";
import "./TopDoctors.css";

const TopDoctors = () => {
  const navigate = useNavigate();
  // const { doctors } = useContext(AppContext);

  return (
    <div className="top-doctors">
      <h1 className="top-doctors__title">Top Doctors to Book</h1>
      <p className="top-doctors__subtitle">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="top-doctors__grid">
        {doctors.slice(0, 10).map((item) => (
          <div
            key={item._id}
            className="top-doctors__card"
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
          >
            <img
              className="top-doctors__img"
              src={item.image}
              alt={item.name}
            />
            <div className="top-doctors__card-content">
              <div
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
              </div>

              <p className="top-doctors__name">{item.name}</p>
              <p className="top-doctors__speciality">{item.speciality}</p>
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
