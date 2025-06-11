import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import "./Navbar.css";
import { Dropdown, Avatar, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, userData, logout } = useAppContext();
  const [showMenu, setShowMenu] = useState(false);

  //   const logout = () => {
  //     setToken(false);
  //     localStorage.removeItem("token");
  //   };

  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/my-profile")}>
        My Profile
      </Menu.Item>
      <Menu.Item
        key="appointments"
        onClick={() => navigate("/my-appointments")}
      >
        My Appointments
      </Menu.Item>
      <Menu.Item key="payment" onClick={() => navigate("/payment")}>
        Payment
      </Menu.Item>
      <Menu.Item
        key="change-password"
        onClick={() => navigate("/change-password")}
      >
        Change Password
      </Menu.Item>
      <Menu.Item
        key="logout"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <nav className="navbar">
      <div className="navbar__logo" onClick={() => navigate("/")}>
        <img src={assets.logo} alt="Logo" className="navbar__logo-img" />
      </div>
      <ul className="navbar__menu">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            HOME
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/doctors"
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            ALL DOCTORS
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            ABOUT
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            CONTACT
          </NavLink>
        </li>
      </ul>
      <div className="navbar__actions">
        {token && userData !== null ? (
          <Dropdown overlay={menu} trigger={["click"]}>
            <div className="navbar__user" style={{ cursor: "pointer" }}>
              <Avatar src={userData.avatar} size={36} />
              <DownOutlined style={{ marginLeft: 8, color: "#5568fe" }} />
            </div>
          </Dropdown>
        ) : (
          <button className="navbar__cta" onClick={() => navigate("/login")}>
            LOGIN
          </button>
        )}

        <img
          src={assets.menu_icon}
          alt="menu"
          className="navbar__menu-icon"
          onClick={() => setShowMenu(true)}
        />
      </div>
      {/* Mobile menu */}
      <div
        className={`navbar__mobile${showMenu ? " navbar__mobile--show" : ""}`}
      >
        <div className="navbar__mobile-header">
          <img src={assets.logo} alt="Logo" className="navbar__logo-img" />
          <img
            src={assets.cross_icon}
            alt="close"
            className="navbar__close-icon"
            onClick={() => setShowMenu(false)}
          />
        </div>
        <ul className="navbar__mobile-menu">
          <li>
            <NavLink
              to="/"
              onClick={() => setShowMenu(false)}
              className="navbar__mobile-link"
            >
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/doctors"
              onClick={() => setShowMenu(false)}
              className="navbar__mobile-link"
            >
              ALL DOCTORS
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              onClick={() => setShowMenu(false)}
              className="navbar__mobile-link"
            >
              ABOUT
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              onClick={() => setShowMenu(false)}
              className="navbar__mobile-link"
            >
              CONTACT
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
