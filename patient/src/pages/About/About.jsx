import React from "react";
import { assets } from "../../assets/assets";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-title">
        <p>
          ABOUT <span className="about-title-highlight">US</span>
        </p>
      </div>

      <div className="about-main">
        <img className="about-img" src={assets.about_image} alt="about" />
        <div className="about-desc">
          <p>
            Welcome to Prescripto, your trusted partner in managing your
            healthcare needs conveniently and efficiently. At Prescripto, we
            understand the challenges individuals face when it comes to
            scheduling doctor appointments and managing their health records.
          </p>
          <p>
            Prescripto is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior
            service. Whether you're booking your first appointment or managing
            ongoing care, Prescripto is here to support you every step of the
            way.
          </p>
          <b className="about-vision">Our Vision</b>
          <p className="about-vision-desc">
            Our vision at Prescripto is to create a seamless healthcare
            experience for every user. We aim to bridge the gap between patients
            and healthcare providers, making it easier for you to access the
            care you need, when you need it.
          </p>
        </div>
      </div>

      <div className="about-why-title">
        <p>
          WHY <span className="about-why-highlight">CHOOSE US</span>
        </p>
      </div>

      <div className="about-why-list">
        <div className="about-why-item">
          <b>Efficiency:</b>
          <p>
            Streamlined appointment scheduling that fits into your busy
            lifestyle.
          </p>
        </div>
        <div className="about-why-item">
          <b>Convenience:</b>
          <p>
            Access to a network of trusted healthcare professionals in your
            area.
          </p>
        </div>
        <div className="about-why-item">
          <b>Personalization:</b>
          <p>
            Tailored recommendations and reminders to help you stay on top of
            your health.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
