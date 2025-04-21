import { useState } from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  BarChartOutlined,
  CalendarOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import "./NavBar.css";

const NavBar = () => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  const menuItems = [
    {
      key: "/doctor/dashboard",
      icon: <BarChartOutlined />,
      label: "Dashboard",
    },
    {
      key: "/doctor/appointments",
      icon: <CalendarOutlined />,
      label: "Appointments",
    },
    {
      key: "/doctor/profile",
      icon: <ProfileOutlined />,
      label: "Profile",
    },
  ];

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <div className="admin-navbar">
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        items={menuItems.map((item) => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        className="admin-menu"
      />
    </div>
  );
};

export default NavBar;
