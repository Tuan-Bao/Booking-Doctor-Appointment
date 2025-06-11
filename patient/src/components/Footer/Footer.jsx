import React from "react";
import { assets } from "../../assets/assets";
import "./Footer.css";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="footer-container">
      <div className="footer-grid">
        {/* Left Section */}
        <div className="footer-left">
          <img className="footer-logo" src={assets.logo} alt="logo" />
          <p className="footer-desc">
            Prescripto is a secure, user-friendly platform that redefines how
            patients and healthcare professionals manage prescriptions. With
            Prescripto, you can seamlessly receive, review and track all your
            medication orders in one intuitive dashboard, set up automatic
            refill reminders.
          </p>
        </div>
        {/* Center Section */}
        <div className="footer-center">
          <p className="footer-title">COMPANY</p>
          <ul className="footer-list">
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/about")}>About us</li>
            <li onClick={() => navigate("/contact")}>Contact us</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        {/* Right Section */}
        <div className="footer-right">
          <p className="footer-title">GET IN TOUCH</p>
          <ul className="footer-list">
            <li>+84-765-362-207</li>
            <li>tuanbaoho2k3@gmail.com</li>
          </ul>
        </div>
      </div>
      {/* Copyright */}
      <div className="footer-copyright">
        <hr />
        <p>Copyright © 2025 - All Right Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
