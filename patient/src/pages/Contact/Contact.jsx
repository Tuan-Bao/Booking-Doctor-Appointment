import React from "react";
import { assets } from "../../assets/assets";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-title">
        <p>
          CONTACT <span className="contact-title-highlight">US</span>
        </p>
      </div>

      <div className="contact-main">
        <img className="contact-img" src={assets.contact_image} alt="contact" />
        <div className="contact-info">
          <p className="contact-section-title">Our OFFICE</p>
          <p className="contact-info-text">
            54709 Willms Station <br /> Suite 350, Washington, USA
          </p>
          <p className="contact-info-text">
            Tel: +84 765 362 207 <br /> Email: tuanbaoho2k3@gmail.com
          </p>
          <p className="contact-section-title-2">Careers at PRESCRIPTO</p>
          <p className="contact-info-text-2">
            Learn more about our teams and job openings.
          </p>
          <button className="contact-jobs-btn">Explore Jobs</button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
