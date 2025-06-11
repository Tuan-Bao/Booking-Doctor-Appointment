import React from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import "./Banner.css";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className="banner-container">
      {/* Left Side */}
      <div className="banner-left">
        <div className="banner-title">
          <p>Book Appointment</p>
          <p className="banner-title-sub">With 100+ Trusted Doctors</p>
        </div>
        <button className="banner-cta" onClick={() => navigate("/about")}>
          Know more about us
        </button>
      </div>
      {/* Right Side */}
      <div className="banner-right">
        <img
          className="banner-img"
          src={assets.appointment_img}
          alt="appointment"
        />
      </div>
    </div>
  );
};

export default Banner;
