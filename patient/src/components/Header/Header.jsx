import React from "react";
import { assets } from "../../assets/assets";
import "./Header.css";

const Header = () => {
  return (
    <div className="header-container">
      {/* Left Side */}
      <div className="header-left">
        <h1 className="header-title">
          Book Appointment <br /> With Trusted Doctors
        </h1>
        <div className="header-desc-row">
          <img
            className="header-group-img"
            src={assets.group_profiles}
            alt="group"
          />
          <p className="header-desc">
            Simply browse through our extensive list of trusted doctors,
            <br className="header-desc-break" /> schedule your appointment
            hassle-free.
          </p>
        </div>
        <a className="header-cta" href="/doctors">
          Book appointment
          <img className="header-arrow" src={assets.arrow_icon} alt="arrow" />
        </a>
      </div>
      {/* Right Side */}
      <div className="header-right">
        <img
          className="header-img"
          src={assets.header_img}
          alt="doctor group"
        />
      </div>
    </div>
  );
};

export default Header;
